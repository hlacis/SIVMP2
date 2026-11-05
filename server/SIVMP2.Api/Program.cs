
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SIVMP2.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity: user management and password security, without cookies
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        options.User.RequireUniqueEmail = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT configuration
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT signing key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT audience is missing.");

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must be at least 32 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.FindFirstValue(
                    JwtRegisteredClaimNames.Sub);

                var tokenSecurityStamp = context.Principal?.FindFirstValue(
                    "security_stamp");

                if (string.IsNullOrEmpty(userId) ||
                    string.IsNullOrEmpty(tokenSecurityStamp))
                {
                    context.Fail("Invalid token.");
                    return;
                }

                var userManager = context.HttpContext.RequestServices
                    .GetRequiredService<UserManager<ApplicationUser>>();

                var user = await userManager.FindByIdAsync(userId);

                if (user == null ||
                    !string.Equals(
                        user.SecurityStamp,
                        tokenSecurityStamp,
                        StringComparison.Ordinal))
                {
                    context.Fail("Token has been revoked.");
                }
            }
        };
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,
            RequireExpirationTime = true,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)),

            ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },
            ClockSkew = TimeSpan.FromSeconds(30),

            NameClaimType = "name",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllersWithViews();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initialize application roles
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "User", "Superuser", "Admin" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var result = await roleManager.CreateAsync(
                new IdentityRole(role));

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to create role '{role}': " +
                    string.Join(
                        ", ",
                        result.Errors.Select(e => e.Description))
                );
            }
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();

// Enforce mandatory password change before accessing protected APIs
app.Use(async (context, next) =>
{
    var path = context.Request.Path;

    // Only check authenticated API requests
    if (path.StartsWithSegments("/api") &&
        context.User.Identity?.IsAuthenticated == true)
    {
        // Allow the user to change their password and check account status
        var allowedPath =
            path.Equals("/api/auth/change-password",
                StringComparison.OrdinalIgnoreCase) ||
            path.Equals("/api/auth/me",
                StringComparison.OrdinalIgnoreCase);

        if (!allowedPath)
        {
            var userId = context.User.FindFirstValue(
                JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userId))
            {
                context.Response.StatusCode = 401;
                return;
            }

            var userManager = context.RequestServices
                .GetRequiredService<UserManager<ApplicationUser>>();

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                context.Response.StatusCode = 401;
                return;
            }

            if (user.MustChangePassword)
            {
                context.Response.StatusCode = 403;

                await context.Response.WriteAsJsonAsync(new
                {
                    message = "You must change your password before continuing.",
                    mustChangePassword = true
                });

                return;
            }
        }
    }

    await next(context);
});

app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/hello", () =>
{
    return Results.Ok(new
    {
        message = "Hello from C# backend!"
    });
});

// Development-only database connectivity check
if (app.Environment.IsDevelopment())
{
    app.MapGet("/api/db-test", async (ApplicationDbContext db) =>
    {
        bool connected = await db.Database.CanConnectAsync();

        return connected
            ? Results.Ok(new { message = "Database connected!" })
            : Results.Problem("Database connection failed.");
    });
}

app.MapFallbackToFile("index.html");

app.Run();
