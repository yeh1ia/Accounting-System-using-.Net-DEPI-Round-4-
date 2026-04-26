using Accounting.Data.Domain.Sales;
using Accounting.Data.Domain.Purchases;

namespace Accounting.Data.Domain.Accounting;

public class Account : AuditableEntity
{
    public int AccountId { get; set; }
    public string Name { get; set; } = null!;
    public string AccountNumber { get; set; } = null!;
    public AccountType Type { get; set; }
    

    public decimal OpeningBalance { get; set; } = 0;
    public bool Enabled { get; set; } = true;



    public Currency Currency { get; set; } = null!;
    public ICollection<JournalItem> JournalItems { get; set; } = [];
}


public class Category : AuditableEntity
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public CategoryType Type { get; set; }
    public bool Enabled { get; set; } = true;

    public ICollection<Invoice> Invoices { get; set; } = [];
    public ICollection<Bill> Bills { get; set; } = [];
}
