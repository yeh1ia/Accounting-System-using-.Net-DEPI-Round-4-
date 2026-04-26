using Microsoft.AspNetCore.Mvc;

namespace Accounting.Data.Controllers.Dashboard
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
