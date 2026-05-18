using Accounting.Data;
using Accounting.Data.Domain;
using Accounting.Data.ViewModels.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace Accounting.Services;

public class DashboardService : Interfaces.IDashboardService
{
    private readonly AppDbContext ctx;

    public DashboardService(AppDbContext ctx)
    {
        this.ctx = ctx;
    }

    public async Task<DashboardStats> GetStatsAsync()
    {
        var bills = await ctx.Bills
            .AsNoTracking()
            .Include(b => b.Payments)
            .Where(b => b.DeletedAt == null)
            .ToListAsync();

        var stats = new DashboardStats
        {
            TotalBills = bills.Count,
            TotalAccounts = await ctx.Accounts.AsNoTracking().CountAsync(a => a.DeletedAt == null),
            TotalUsers = await ctx.Users.AsNoTracking().CountAsync(),
            PendingApprovals = bills.Count(b => b.Status == DocumentStatus.Draft),
            TotalBillsAmount = bills.Sum(b => b.Amount),
            TotalPaidAmount = bills.Sum(b => b.Status == DocumentStatus.Paid ? b.Amount : b.AmountPaid),
            TotalDueAmount = bills.Sum(b => b.Status == DocumentStatus.Paid || b.Status == DocumentStatus.Cancelled ? 0m : b.AmountDue),
            DraftBills = bills.Count(b => b.Status == DocumentStatus.Draft),
            SentBills = bills.Count(b => b.Status == DocumentStatus.Sent),
            PaidBills = bills.Count(b => b.Status == DocumentStatus.Paid),
            OverdueBills = bills.Count(b => b.Status != DocumentStatus.Paid && b.Status != DocumentStatus.Cancelled && b.DueAt < DateTime.Today)
        };

        return stats;
    }
}