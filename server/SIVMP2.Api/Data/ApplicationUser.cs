using Microsoft.AspNetCore.Identity;

namespace SIVMP2.Api.Data;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }

    public bool MustChangePassword { get; set; } = false;
}