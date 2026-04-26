using Accounting.Data.Domain.Sales;
using Accounting.Data.Domain.Purchases;
using Accounting.Data.Domain.Accounting;

namespace Accounting.Data.Domain;
public class Item : AuditableEntity
{
    public int ItemId { get; set; }
    public string ItemCode { get; set; } = null!;
    public string ItemName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal DefaultSalePrice { get; set; } = 0;
    public decimal DefaultPurchasePrice { get; set; } = 0;

    public int? DefaultIncomeAccountId { get; set; }

    public int? DefaultExpenseAccountId { get; set; }
    public bool Enabled { get; set; } = true;

    public Account? DefaultIncomeAccount { get; set; }
    public Account? DefaultExpenseAccount { get; set; }
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = [];
    public ICollection<BillItem> BillItems { get; set; } = [];
}

public class Setting
{
    public int SettingId { get; set; }
    public string SettingKey { get; set; } = null!;
    public string? SettingValue { get; set; }
}
