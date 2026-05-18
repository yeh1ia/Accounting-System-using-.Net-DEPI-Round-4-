using Accounting.Data.ViewModels.Dashboard;
using Accounting.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountingSystem.Controllers.Dashboard;

[Authorize]
public class DashboardController : Controller
{
    private readonly IDashboardService dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        this.dashboardService = dashboardService;
    }

    public async Task<IActionResult> Index()
    {
        var stats = await dashboardService.GetStatsAsync();
        return View("~/Views/Dashboard/Index.cshtml", stats);
    }
}