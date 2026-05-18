using Accounting.Data.ViewModels;
using Accounting.Data.ViewModels.Administration;

namespace Accounting.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserListItem>> GetAllUsersAsync();
    Task<UserFormViewModel?> GetUserByIdAsync(string id);
    Task<(bool Success, string[] Errors)> CreateUserAsync(UserFormViewModel model);
    Task<(bool Success, string[] Errors)> UpdateUserAsync(UserFormViewModel model);
    Task<bool> DeleteUserAsync(string id);
    Task<bool> ToggleLockAsync(string id);
    Task<IEnumerable<SelectOption>> GetAvailableRolesAsync();
}