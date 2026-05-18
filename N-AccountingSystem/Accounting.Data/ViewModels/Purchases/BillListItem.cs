using Accounting.Data.Domain;

namespace Accounting.Data.ViewModels.Purchases;

public class BillListItem
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
    public string CategoryName { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
}