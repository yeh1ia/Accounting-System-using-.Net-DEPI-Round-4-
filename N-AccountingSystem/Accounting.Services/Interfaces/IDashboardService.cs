using Accounting.Data.ViewModels.Dashboard;

namespace Accounting.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardStats> GetStatsAsync();
}