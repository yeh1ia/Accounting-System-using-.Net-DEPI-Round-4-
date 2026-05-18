using Accounting.Data;
using Accounting.Data.Domain;
using Accounting.Data.Identity;
using Accounting.Data.ViewModels;
using Accounting.Data.ViewModels.Administration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Accounting.Services;

public class UserService : Interfaces.IUserService
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly RoleManager<IdentityRole> roleManager;
    private readonly AppDbContext ctx;

    public UserService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, AppDbContext ctx)
    {
        this.userManager = userManager;
        this.roleManager = roleManager;
        this.ctx = ctx;
    }

    public async Task<IEnumerable<UserListItem>> GetAllUsersAsync()
    {
        var users = await ctx.Users.AsNoTracking().ToListAsync();
        var userIds = users.Select(u => u.Id).ToList();

        var userRoles = await ctx.UserRoles
            .AsNoTracking()
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(ctx.Roles.AsNoTracking(), ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name ?? "" })
            .ToListAsync();

        return users.Select(u => new UserListItem
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email ?? string.Empty,
            PhoneNumber = u.PhoneNumber,
            Roles = userRoles.Where(ur => ur.UserId == u.Id).Select(ur => ur.RoleName).ToList(),
            AccessFailedCount = u.AccessFailedCount,
            LockoutEnabled = u.LockoutEnabled,
            LockoutEnd = u.LockoutEnd
        });
    }

    public async Task<UserFormViewModel?> GetUserByIdAsync(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return null;

        var roles = await userManager.GetRolesAsync(user);
        var allRoles = await roleManager.Roles.Select(r => r.Name).ToListAsync();

        return new UserFormViewModel
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            SelectedRole = roles.FirstOrDefault() ?? string.Empty,
            AvailableRoles = allRoles
                .Where(r => r != null && AllowedRoles.Contains(r))
                .Select(r => new SelectOption { Value = r!, Text = r! }).ToList()
        };
    }

    public async Task<(bool Success, string[] Errors)> CreateUserAsync(UserFormViewModel model)
    {
        if (string.IsNullOrEmpty(model.Password) || string.IsNullOrEmpty(model.Email))
            return (false, new[] { "Email and password are required." });

        var user = new ApplicationUser
        {
            FullName = model.FullName,
            UserName = model.Email,
            Email = model.Email,
            PhoneNumber = model.PhoneNumber
        };

        var result = await userManager.CreateAsync(user, model.Password!);

        if (!result.Succeeded)
            return (false, result.Errors.Select(e => e.Description).ToArray());

        if (!string.IsNullOrEmpty(model.SelectedRole))
        {
            var roleExists = await roleManager.RoleExistsAsync(model.SelectedRole);
            if (!roleExists)
            {
                await roleManager.CreateAsync(new IdentityRole(model.SelectedRole));
            }
            await userManager.AddToRoleAsync(user, model.SelectedRole);
        }

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdateUserAsync(UserFormViewModel model)
    {
        if (string.IsNullOrEmpty(model.Id))
            return (false, new[] { "User ID is required." });

        var user = await userManager.FindByIdAsync(model.Id);
        if (user == null)
            return (false, new[] { "User not found." });

        user.FullName = model.FullName;
        user.Email = model.Email;
        user.PhoneNumber = model.PhoneNumber;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return (false, result.Errors.Select(e => e.Description).ToArray());

        // Update role
        var currentRoles = await userManager.GetRolesAsync(user);
        if (currentRoles.Any())
            await userManager.RemoveFromRolesAsync(user, currentRoles.ToArray());

        if (!string.IsNullOrEmpty(model.SelectedRole))
        {
            var roleExists = await roleManager.RoleExistsAsync(model.SelectedRole);
            if (!roleExists)
                await roleManager.CreateAsync(new IdentityRole(model.SelectedRole));
            await userManager.AddToRoleAsync(user, model.SelectedRole);
        }

        // Update password if provided
        if (!string.IsNullOrEmpty(model.Password))
        {
            var passwordResult = await userManager.RemovePasswordAsync(user);
            if (passwordResult.Succeeded)
                await userManager.AddPasswordAsync(user, model.Password);
        }

        return (true, Array.Empty<string>());
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return false;
        var result = await userManager.DeleteAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ToggleLockAsync(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return false;

        if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow)
            await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow);
        else
            await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));

        return true;
    }

    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase) { "Admin", "Accountant", "User" };

    public async Task<IEnumerable<SelectOption>> GetAvailableRolesAsync()
    {
        var roles = await roleManager.Roles
            .OrderBy(r => r.Name)
            .Select(r => r.Name)
            .ToListAsync();

        return roles
            .Where(r => r != null && AllowedRoles.Contains(r))
            .Select(r => new SelectOption { Value = r!, Text = r! });
    }
}