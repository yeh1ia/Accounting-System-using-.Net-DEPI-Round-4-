using Accounting.Data.Domain.People;
using Accounting.Data.Domain.Accounting;

namespace Accounting.Data.Domain.Purchases;

public class Bill : AuditableEntity
{
    public int BillId { get; set; }
    public string BillNumber { get; set; } = null!;
    public string? OrderNumber { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public DateTime BilledAt { get; set; }
    public DateTime DueAt { get; set; }
    public decimal Amount { get; set; } = 0;
    public int CategoryId { get; set; }
    public int ContactId { get; set; }

    public string ContactName { get; set; } = null!;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactAddress { get; set; }

    public string? Notes { get; set; }
    public string? Footer { get; set; }
    public int? ParentId { get; set; }



    public Currency Currency { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
    public Bill? Parent { get; set; }
    public ICollection<Bill> DebitNotes { get; set; } = [];
    public ICollection<BillItem> Items { get; set; } = [];
    public ICollection<BillPayment> Payments { get; set; } = [];
    public ICollection<BillStatusLog> StatusLogs { get; set; } = [];

    public decimal AmountPaid => Payments.Sum(p => p.Amount);
    public decimal AmountDue => Amount - AmountPaid;

    public void RecalculateAmount()
        => Amount = Items.Where(i => !i.IsDeleted).Sum(i => i.Total);
}

public class BillItem : AuditableEntity
{
    public int BillItemId { get; set; }
    public int BillId { get; set; }
    public int? ItemId { get; set; }
    public string Description { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
    public decimal DiscountRate { get; set; } = 0;
    public DiscountType DiscountType { get; set; } = DiscountType.Percent;
    public int AccountId { get; set; }

    public Bill Bill { get; set; } = null!;
    public Item? Item { get; set; }
    public Account Account { get; set; } = null!;

    public void RecalculateTotal()
    {
        Total = DiscountType == DiscountType.Percent
            ? Quantity * Price * (1m - DiscountRate / 100m)
            : Quantity * Price - DiscountRate;
        if (Total < 0) Total = 0;
    }
}

public class BillPayment
{
    public int BillPaymentId { get; set; }
    public int BillId { get; set; }
    public int JournalEntryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public Bill Bill { get; set; } = null!;
    public JournalEntry JournalEntry { get; set; } = null!;
}

public class BillStatusLog
{
    public int BillStatusLogId { get; set; }
    public int BillId { get; set; }
    public DocumentStatus Status { get; set; }
    public bool Notify { get; set; } = false;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public Bill Bill { get; set; } = null!;
}
