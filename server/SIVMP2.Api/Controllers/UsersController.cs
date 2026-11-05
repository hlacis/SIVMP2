
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using SIVMP2.Api.Data;

namespace SIVMP2.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User,Superuser,Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        int page = 1,
        int pageSize = 10)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new
            {
                message = "Invalid pagination parameters."
            });
        }

        var totalUsers = await _userManager.Users.CountAsync();

        var users = await _userManager.Users
            .OrderBy(user => user.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userList = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            userList.Add(new
            {
                user.Id,
                user.UserName,
                user.FullName,
                Roles = roles
            });
        }

        return Ok(new
        {
            Page = page,
            PageSize = pageSize,
            TotalUsers = totalUsers,
            TotalPages = (int)Math.Ceiling(
                (double)totalUsers / pageSize),
            Users = userList
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.FullName
        });
    }

    // This may not be needed but is useful for account lookup operations.
    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetUserByUsername(string username)
    {
        var user = await _userManager.FindByNameAsync(username);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.FullName,
            Roles = roles
        });
    }

    // Restricts users from creating other accounts through this endpoint.
    [Authorize(Roles = "Superuser,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserRequest request)
    {
        var existingUser = await _userManager.FindByNameAsync(
            request.UserName);

        if (existingUser != null)
        {
            return Conflict(new
            {
                message = "This username is already in use."
            });
        }

        if (!await _roleManager.RoleExistsAsync("User"))
        {
            var roleResult = await _roleManager.CreateAsync(
                new IdentityRole("User"));

            if (!roleResult.Succeeded)
            {
                return BadRequest(new
                {
                    errors = roleResult.Errors.Select(e => e.Description)
                });
            }
        }

        var user = new ApplicationUser
        {
            UserName = request.UserName,
            FullName = request.FullName,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(
            user,
            request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(e => e.Description)
            });
        }

        var roleAssignment = await _userManager.AddToRoleAsync(
            user,
            "User");

        if (!roleAssignment.Succeeded)
        {
            await _userManager.DeleteAsync(user);

            return BadRequest(new
            {
                errors = roleAssignment.Errors.Select(e => e.Description)
            });
        }

        return CreatedAtAction(
            nameof(GetUser),
            new { id = user.Id },
            new
            {
                
                user.Id,
                user.UserName,
                user.FullName,
                Role = "User"
            });
    }

    // User accounts can't update user info. 
    // Superusers can edit regular Users. Admins can edit everyone. (Maria)
    [Authorize(Roles = "Superuser,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(
        string id,
        [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        // Superusers can only edit accounts with the regular User role. (Maria)
        var targetRoles = await _userManager.GetRolesAsync(user);

        if (User.IsInRole("Superuser") && !User.IsInRole("Admin"))
        {
            if (targetRoles.Count != 1 || !targetRoles.Contains("User"))
            {
                return Forbid();
            }
        }

        var existingUserName = await _userManager.FindByNameAsync(
            request.UserName);

        if (existingUserName != null && existingUserName.Id != user.Id)
        {
            return Conflict(new
            {
                message = "This username is already in use."
            });
        }

        user.UserName = request.UserName;
        user.FullName = request.FullName;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            message = "User updated successfully.",
            user.Id,
            user.UserName,
            user.FullName
        });
    }
    
    // Superusers can delete regular users. Admins can delete everyone. (Maria) 
    [Authorize(Roles = "Superuser,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        // Check the role of the user being deleted
        var targetRoles = await _userManager.GetRolesAsync(user);

        if (targetRoles.Any(role => role == "Admin" || role == "Superuser")
            && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            message = "User deleted successfully."
        });
    }
    
    // Only Admin can change user roles (Maria)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateUserRole(
        string id,
        [FromBody] UpdateUserRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var targetRoles = await _userManager.GetRolesAsync(user);

        //Needs to be deleted bc it's only admin's responsibility (Maria)
        /*
        if (targetRoles.Contains("Superuser") ||
            targetRoles.Contains("Admin"))
        {
            if (!User.IsInRole("Admin"))
            {
                return Forbid();
            }
        } */

        var validRoles = new[] { "User", "Superuser", "Admin" };

        if (!validRoles.Contains(request.Role))
        {
            return BadRequest(new
            {
                message = "Invalid role."
            });
        }

        if (!await _roleManager.RoleExistsAsync(request.Role))
        {
            var roleResult = await _roleManager.CreateAsync(
                new IdentityRole(request.Role));

            if (!roleResult.Succeeded)
            {
                return BadRequest(new
                {
                    errors = roleResult.Errors.Select(e => e.Description)
                });
            }
        }

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Contains(request.Role))
        {
            return Ok(new
            {
                message = "User already has this role."
            });
        }

        var addResult = await _userManager.AddToRoleAsync(
            user,
            request.Role);

        if (!addResult.Succeeded)
        {
            return BadRequest(new
            {
                errors = addResult.Errors.Select(e => e.Description)
            });
        }

        var removeResult = await _userManager.RemoveFromRolesAsync(
            user,
            currentRoles);

        if (!removeResult.Succeeded)
        {
            await _userManager.RemoveFromRoleAsync(user, request.Role);

            return BadRequest(new
            {
                errors = removeResult.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            message = "User role updated successfully.",
            user.Id,
            user.UserName,
            Role = request.Role
        });
    }
}

public class CreateUserRequest
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserRequest
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;
}

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;
}
