using System.Diagnostics;
using AccountingSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountingSystem.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction(nameof(DashBoard));
            return RedirectToAction("Login", "Account");
        }

        [Authorize]
        public IActionResult DashBoard()
        {
            return RedirectToAction("Index", "Dashboard");
        }

        [Authorize]
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("~/Views/Shared/Error.cshtml", new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
                StatusCode = 500,
                Title = "Something went wrong",
                Message = "An unexpected error occurred. Please try again later."
            });
        }

        [Route("/Home/StatusCode/{code:int}")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult StatusCode(int code)
        {
            var model = new ErrorViewModel
            {
                StatusCode = code,
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            };

            switch (code)
            {
                case 404:
                    model.Title = "Page Not Found";
                    model.Message = "The page you are looking for doesn't exist or has been moved.";
                    break;
                case 403:
                    model.Title = "Access Denied";
                    model.Message = "You don't have permission to access this resource.";
                    break;
                default:
                    model.Title = "Error";
                    model.Message = "An unexpected error occurred.";
                    break;
            }

            Response.StatusCode = code;
            return View("~/Views/Shared/Error.cshtml", model);
        }

        public IActionResult AccessDenied()
        {
            return View("~/Views/Shared/Error.cshtml", new ErrorViewModel
            {
                StatusCode = 403,
                Title = "Access Denied",
                Message = "You don't have permission to access this resource. Contact your administrator if you believe this is a mistake.",
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }
    }
}