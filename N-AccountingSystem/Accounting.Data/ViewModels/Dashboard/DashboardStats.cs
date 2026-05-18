using Accounting.Data.ViewModels;

namespace Accounting.Data.ViewModels.Dashboard;

public class DashboardStats
{
    public int TotalBills { get; set; }
    public int TotalAccounts { get; set; }
    public int PendingApprovals { get; set; }
    public int TotalUsers { get; set; }
    public decimal TotalBillsAmount { get; set; }
    public decimal TotalPaidAmount { get; set; }
    public decimal TotalDueAmount { get; set; }
    public int DraftBills { get; set; }
    public int SentBills { get; set; }
    public int PaidBills { get; set; }
    public int OverdueBills { get; set; }
}