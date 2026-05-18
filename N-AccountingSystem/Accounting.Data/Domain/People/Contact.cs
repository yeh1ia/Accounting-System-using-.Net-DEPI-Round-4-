using Accounting.Data.Domain.Accounting;
using Accounting.Data.Domain.Sales;
using Accounting.Data.Domain.Purchases;

namespace Accounting.Data.Domain.People;

public class Contact : AuditableEntity
{
    public int ContactId { get; set; }
    public ContactType Type { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool Enabled { get; set; } = true;

    public Currency Currency { get; set; } = null!;
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public ICollection<JournalItem> JournalItems { get; set; } = new List<JournalItem>();
}