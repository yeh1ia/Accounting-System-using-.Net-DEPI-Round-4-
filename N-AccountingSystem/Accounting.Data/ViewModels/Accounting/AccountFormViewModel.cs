using Accounting.Data.Domain;

namespace Accounting.Data.ViewModels.Accounting;

public class AccountFormViewModel
{
    public int? AccountId { get; set; }
    public string AccountNumber { get; set; } = null!;
    public string Name { get; set; } = null!;
    public AccountType Type { get; set; }
    public decimal OpeningBalance { get; set; }
    public string CurrencyName { get; set; } = "USD";
    public bool Enabled { get; set; } = true;
    public IEnumerable<SelectOption> Currencies { get; set; } = new List<SelectOption>();
    public IEnumerable<SelectOption> TypeOptions { get; set; } = new List<SelectOption>();
    public bool IsEdit => AccountId.HasValue;
}