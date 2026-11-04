
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace SIVMP2.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<IdentityUser> userManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        Response.Headers.CacheControl = "no-store";

        var user = await _userManager.FindByNameAsync(request.UserName);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid username or password."
            });
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return Unauthorized(new
            {
                message = "Account temporarily locked."
            });
        }

        var validPassword = await _userManager.CheckPasswordAsync(
            user, request.Password);

        if (!validPassword)
        {
            if (_userManager.SupportsUserLockout)
            {
                await _userManager.AccessFailedAsync(user);

                if (await _userManager.IsLockedOutAsync(user))
                {
                    return Unauthorized(new
                    {
                        message = "Account temporarily locked."
                    });
                }
            }

            return Unauthorized(new
            {
                message = "Invalid username or password."
            });
        }

        if (!await _userManager.IsEmailConfirmedAsync(user)
            && _userManager.Options.SignIn.RequireConfirmedEmail)
        {
            return Unauthorized(new
            {
                message = "Account is not confirmed."
            });
        }

        if (_userManager.SupportsUserLockout)
        {
            await _userManager.ResetAccessFailedCountAsync(user);
        }

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("name", user.UserName ?? "")
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim("role", role));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler()
            .WriteToken(token);

        return Ok(new
        {
            message = "Login successful.",
            token = tokenString,
            expiresAt,
            user.Id,
            user.UserName,
            user.Email,
            Roles = roles
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            Roles = roles
        });
    }
}

public class LoginRequest
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
