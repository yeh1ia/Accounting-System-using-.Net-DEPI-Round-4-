using Accounting.Data.ViewModels;
using Accounting.Data.ViewModels.Accounting;

namespace Accounting.Services.Interfaces;

public interface IAccountService
{
    Task<IEnumerable<SelectOption>> GetAllAccountsAsync();
    Task<AccountFormViewModel> GetAccountFormModelAsync(int? id = null);
    Task<(bool Success, int AccountId, string[] Errors)> SaveAccountAsync(AccountFormViewModel model);
    Task<bool> DeleteAccountAsync(int id);
}