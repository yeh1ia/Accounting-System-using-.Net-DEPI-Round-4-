using Accounting.Data;
using Accounting.Data.Domain;
using Accounting.Data.Domain.Accounting;
using Accounting.Data.ViewModels;
using Accounting.Data.ViewModels.Accounting;
using Microsoft.EntityFrameworkCore;

namespace Accounting.Services;

public class AccountService : Interfaces.IAccountService
{
    private readonly AppDbContext ctx;

    public AccountService(AppDbContext ctx)
    {
        this.ctx = ctx;
    }

    public async Task<IEnumerable<SelectOption>> GetAllAccountsAsync()
    {
        var accounts = await ctx.Accounts
            .AsNoTracking()
            .Where(a => a.DeletedAt == null && a.Enabled)
            .OrderBy(a => a.AccountNumber)
            .ToListAsync();

        return accounts.Select(a => new SelectOption
        {
            Value = a.AccountId.ToString(),
            Text = $"{a.AccountNumber} - {a.Name} ({a.Type})"
        });
    }

    public async Task<AccountFormViewModel> GetAccountFormModelAsync(int? id = null)
    {
        var currencies = await ctx.Currencies.Where(c => c.Enabled).AsNoTracking().ToListAsync();
        var accountTypes = Enum.GetValues<AccountType>();

        var model = new AccountFormViewModel
        {
            CurrencyName = "USD",
            Currencies = currencies.Select(c => new SelectOption { Value = c.Name, Text = $"{c.Name} ({c.Symbol})" }),
            TypeOptions = accountTypes.Select(t => new SelectOption { Value = t.ToString(), Text = t.ToString() }),
            Enabled = true
        };

        if (id.HasValue)
        {
            var account = await ctx.Accounts
                .Include(a => a.Currency)
                .FirstOrDefaultAsync(a => a.AccountId == id.Value && a.DeletedAt == null);
            if (account != null)
            {
                model.AccountId = account.AccountId;
                model.AccountNumber = account.AccountNumber;
                model.Name = account.Name;
                model.Type = account.Type;
                model.OpeningBalance = account.OpeningBalance;
                model.CurrencyName = account.Currency?.Name ?? "USD";
                model.Enabled = account.Enabled;
            }
        }

        return model;
    }

    public async Task<(bool Success, int AccountId, string[] Errors)> SaveAccountAsync(AccountFormViewModel model)
    {
        Account? account;

        if (model.AccountId.HasValue)
        {
            account = await ctx.Accounts
                .Include(a => a.Currency)
                .FirstOrDefaultAsync(a => a.AccountId == model.AccountId.Value && a.DeletedAt == null);

            if (account == null)
                return (false, 0, new[] { "Account not found." });
        }
        else
        {
            var exists = await ctx.Accounts.AnyAsync(a => a.AccountNumber == model.AccountNumber && a.DeletedAt == null);
            if (exists)
                return (false, 0, new[] { "An account with this number already exists." });

            var currency = await ctx.Currencies.FindAsync(model.CurrencyName);
            if (currency == null)
                return (false, 0, new[] { "Currency not found." });

            account = new Account
            {
                AccountNumber = model.AccountNumber,
                Name = model.Name,
                Type = model.Type,
                OpeningBalance = model.OpeningBalance,
                Currency = currency,
                Enabled = model.Enabled,
                CreatedAt = DateTime.UtcNow
            };
            ctx.Accounts.Add(account);
            await ctx.SaveChangesAsync();
            return (true, account.AccountId, Array.Empty<string>());
        }

        account.Name = model.Name;
        account.Type = model.Type;
        account.OpeningBalance = model.OpeningBalance;
        account.Enabled = model.Enabled;
        account.UpdatedAt = DateTime.UtcNow;

        if (model.CurrencyName != account.Currency.Name)
        {
            var currency = await ctx.Currencies.FindAsync(model.CurrencyName);
            if (currency == null)
                return (false, 0, new[] { "Currency not found." });
            account.Currency = currency;
        }

        await ctx.SaveChangesAsync();
        return (true, account.AccountId, Array.Empty<string>());
    }

    public async Task<bool> DeleteAccountAsync(int id)
    {
        var account = await ctx.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.DeletedAt == null);
        if (account == null) return false;
        account.DeletedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return true;
    }
}