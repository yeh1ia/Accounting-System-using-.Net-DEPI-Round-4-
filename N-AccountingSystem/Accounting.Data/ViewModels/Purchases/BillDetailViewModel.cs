using Accounting.Data.Domain;

namespace Accounting.Data.ViewModels.Purchases;

public class BillDetailViewModel
{
    public int BillId { get; set; }
    public string BillNumber { get; set; } = null!;
    public string? OrderNumber { get; set; }
    public DocumentStatus Status { get; set; }
    public DateTime BilledAt { get; set; }
    public DateTime DueAt { get; set; }
    public decimal Amount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal AmountDue => Amount - AmountPaid;
    public string ContactName { get; set; } = null!;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactAddress { get; set; }
    public string CurrencyName { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Footer { get; set; }
    public List<BillItemRow> Items { get; set; } = new List<BillItemRow>();
    public List<BillPaymentRow> Payments { get; set; } = new List<BillPaymentRow>();
    public List<BillStatusRow> StatusHistory { get; set; } = new List<BillStatusRow>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BillItemRow
{
    public int BillItemId { get; set; }
    public string Description { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal DiscountRate { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal Total { get; set; }
    public string AccountName { get; set; } = null!;
}

public class BillPaymentRow
{
    public int BillPaymentId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
}

public class BillStatusRow
{
    public DocumentStatus Status { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}