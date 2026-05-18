using Accounting.Data.Domain;

namespace Accounting.Data.ViewModels.Purchases;

public class BillApprovalViewModel
{
    public int BillId { get; set; }
    public string BillNumber { get; set; } = null!;
    public DocumentStatus Status { get; set; }
    public DateTime BilledAt { get; set; }
    public DateTime DueAt { get; set; }
    public decimal Amount { get; set; }
    public string ContactName { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public List<BillItemRow> Items { get; set; } = new List<BillItemRow>();
    public List<BillStatusRow> StatusHistory { get; set; } = new List<BillStatusRow>();
    public string? PendingNotes { get; set; }
}