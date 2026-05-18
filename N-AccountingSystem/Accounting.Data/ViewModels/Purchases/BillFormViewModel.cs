using Accounting.Data.Domain;

namespace Accounting.Data.ViewModels.Purchases;

public class BillFormViewModel
{
    public int? BillId { get; set; }
    public string BillNumber { get; set; } = null!;
    public string? OrderNumber { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public DateTime BilledAt { get; set; } = DateTime.Today;
    public DateTime DueAt { get; set; } = DateTime.Today.AddDays(30);
    public int ContactId { get; set; }
    public int CategoryId { get; set; }
    public string CurrencyName { get; set; } = "USD";
    public string? Notes { get; set; }
    public string? Footer { get; set; }
    public IEnumerable<SelectOption> Contacts { get; set; } = new List<SelectOption>();
    public IEnumerable<SelectOption> Categories { get; set; } = new List<SelectOption>();
    public IEnumerable<SelectOption> Currencies { get; set; } = new List<SelectOption>();
    public IEnumerable<SelectOption> Accounts { get; set; } = new List<SelectOption>();
    public IEnumerable<SelectOption> StatusOptions { get; set; } = new List<SelectOption>();
    public List<BillLineItem> LineItems { get; set; } = new List<BillLineItem>();
    public bool IsEdit => BillId.HasValue;
}

public class BillLineItem
{
    public int? BillItemId { get; set; }
    public int? ItemId { get; set; }
    public string Description { get; set; } = null!;
    public decimal Quantity { get; set; } = 1;
    public decimal Price { get; set; }
    public decimal DiscountRate { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.Percent;
    public int AccountId { get; set; }
    public decimal Total => DiscountType == DiscountType.Percent
        ? Quantity * Price * (1 - DiscountRate / 100m)
        : Math.Max(0, Quantity * Price - DiscountRate);
}