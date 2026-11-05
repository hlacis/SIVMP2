
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Xunit;

namespace SIVMP2.Tests;

public class PasswordSecurityTests
{
    [Theory]
    [InlineData("abc123", false)]
    [InlineData("password123!", false)]
    [InlineData("PASSWORD123!", false)]
    [InlineData("Password!", false)]
    [InlineData("Password123", false)]
    [InlineData("Password123!", true)]
    public async Task PasswordRequirements_AreEnforced(
        string password,
        bool shouldSucceed)
    {
        var options = Options.Create(new IdentityOptions
        {
            Password =
            {
                RequiredLength = 8,
                RequireDigit = true,
                RequireLowercase = true,
                RequireUppercase = true,
                RequireNonAlphanumeric = true
            }
        });

        var validator = new PasswordValidator<IdentityUser>();

        // PasswordValidator uses the configured IdentityOptions
        // through UserManager. No database connection is required.
        var userManager = new UserManager<IdentityUser>(
            new TestUserStore(),
            options,
            new PasswordHasher<IdentityUser>(),
            new IUserValidator<IdentityUser>[] { },
            new IPasswordValidator<IdentityUser>[] { validator },
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            null!,
            null!
        );

        var result = await validator.ValidateAsync(
            userManager,
            new IdentityUser(),
            password
        );

        Assert.Equal(shouldSucceed, result.Succeeded);
    }

    private sealed class TestUserStore : IUserStore<IdentityUser>
    {
        public void Dispose() { }

        public Task<string> GetUserIdAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(user.Id);

        public Task<string?> GetUserNameAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(user.UserName);

        public Task SetUserNameAsync(
            IdentityUser user, string? userName,
            CancellationToken cancellationToken)
        {
            user.UserName = userName;
            return Task.CompletedTask;
        }

        public Task<string?> GetNormalizedUserNameAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(user.NormalizedUserName);

        public Task SetNormalizedUserNameAsync(
            IdentityUser user, string? normalizedName,
            CancellationToken cancellationToken)
        {
            user.NormalizedUserName = normalizedName;
            return Task.CompletedTask;
        }

        public Task<IdentityResult> CreateAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(IdentityResult.Success);

        public Task<IdentityResult> UpdateAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(IdentityResult.Success);

        public Task<IdentityResult> DeleteAsync(
            IdentityUser user, CancellationToken cancellationToken)
            => Task.FromResult(IdentityResult.Success);

        public Task<IdentityUser?> FindByIdAsync(
            string userId, CancellationToken cancellationToken)
            => Task.FromResult<IdentityUser?>(null);

        public Task<IdentityUser?> FindByNameAsync(
            string normalizedUserName,
            CancellationToken cancellationToken)
            => Task.FromResult<IdentityUser?>(null);
    }
}
