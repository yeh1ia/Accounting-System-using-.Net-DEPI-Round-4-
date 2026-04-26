using Accounting.Data.Domain.Sales;
using Accounting.Data.Domain.People;
using Accounting.Data.Domain.Purchases;

namespace Accounting.Data.Domain.Accounting;

public class JournalEntry : AuditableEntity
{
    public int JournalEntryId { get; set; }
    public string JournalNumber { get; set; } = null!;
    public DateTime EntryDate { get; set; }
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public JournalEntryStatus Status { get; set; } = JournalEntryStatus.Draft;
    public string? SourceType { get; set; } 
    public int? SourceId { get; set; }

    public Currency Currency { get; set; } = null!;
    public ICollection<JournalItem> JournalItems { get; set; } = [];
    public ICollection<InvoicePayment> InvoicePayments { get; set; } = [];
    public ICollection<BillPayment> BillPayments { get; set; } = [];

    public bool IsBalanced()
    {
        var active = JournalItems.Where(i => !i.IsDeleted).ToList();
        if (active.Count == 0) return false;
        var diff = Math.Abs(active.Sum(i => i.Debit) - active.Sum(i => i.Credit));
        return diff <= 0.0001m;
    }

    public bool IsEditable() => Status == JournalEntryStatus.Draft;
}

public class JournalItem : AuditableEntity
{
    public int JournalItemId { get; set; }
    public int JournalEntryId { get; set; }
    public int AccountId { get; set; }

    public decimal Debit { get; set; } = 0;

    public decimal Credit { get; set; } = 0;

    public string? Description { get; set; }
    public int? ContactId { get; set; }

    public JournalEntry JournalEntry { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Contact? Contact { get; set; }


    public bool IsValid() =>
        (Debit > 0 && Credit == 0) || (Credit > 0 && Debit == 0);
}
