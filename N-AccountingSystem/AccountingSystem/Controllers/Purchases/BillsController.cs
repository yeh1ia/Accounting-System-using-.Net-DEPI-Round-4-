using Accounting.Services.Interfaces;
using Accounting.Data.ViewModels.Purchases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountingSystem.Controllers.Purchases;

[Authorize]
public class BillsController : Controller
{
    private readonly IBillService billService;

    public BillsController(IBillService billService)
    {
        this.billService = billService;
    }

    public async Task<IActionResult> Index(string? search = null, string? status = null)
    {
        var bills = await billService.GetAllBillsAsync(search, status);
        ViewBag.Search = search;
        ViewBag.Status = status;
        return View("~/Views/Purchases/Bills/Index.cshtml", bills);
    }

    public async Task<IActionResult> Details(int id)
    {
        var bill = await billService.GetBillByIdAsync(id);
        if (bill == null) return NotFound();
        return View("~/Views/Purchases/Bills/Details.cshtml", bill);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        var model = await billService.GetBillFormModelAsync(null);
        return View("~/Views/Purchases/Bills/Form.cshtml", model);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Edit(int id)
    {
        var model = await billService.GetBillFormModelAsync(id);
        if (model.BillId == null) return NotFound();
        return View("~/Views/Purchases/Bills/Form.cshtml", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(BillFormViewModel model)
    {
        if (!model.BillId.HasValue || User.IsInRole("Admin") || User.IsInRole("Accountant"))
        {
            // New bills: all roles; Editing: Admin/Accountant only
        }
        else
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var formModel = await billService.GetBillFormModelAsync(model.BillId);
            model.Currencies = formModel.Currencies;
            model.Categories = formModel.Categories;
            model.Contacts = formModel.Contacts;
            model.Accounts = formModel.Accounts;
            model.StatusOptions = formModel.StatusOptions;
            return View("~/Views/Purchases/Bills/Form.cshtml", model);
        }

        var (billId, errors) = await billService.SaveBillAsync(model);
        if (errors.Length > 0)
        {
            foreach (var error in errors)
                ModelState.AddModelError(string.Empty, error);
            var formModel = await billService.GetBillFormModelAsync(model.BillId);
            model.Currencies = formModel.Currencies;
            model.Categories = formModel.Categories;
            model.Contacts = formModel.Contacts;
            model.Accounts = formModel.Accounts;
            model.StatusOptions = formModel.StatusOptions;
            return View("~/Views/Purchases/Bills/Form.cshtml", model);
        }

        TempData["SuccessMessage"] = model.BillId.HasValue ? "Bill updated successfully." : "Bill created successfully.";
        return RedirectToAction(nameof(Details), new { id = billId });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await billService.DeleteBillAsync(id);
        if (!success) return NotFound();
        TempData["SuccessMessage"] = "Bill deleted successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Print(int id)
    {
        var bill = await billService.GetBillForPrintAsync(id);
        if (bill == null) return NotFound();
        return View("~/Views/Purchases/Bills/Print.cshtml", bill);
    }

    [HttpGet]
    public async Task<IActionResult> ExportPdf(int id)
    {
        var bill = await billService.GetBillForPrintAsync(id);
        if (bill == null) return NotFound();
        return View("~/Views/Purchases/Bills/Print.cshtml", bill);
    }

    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approvals()
    {
        var bills = await billService.GetAllBillsAsync(null, "Draft");
        return View("~/Views/Purchases/Bills/Approvals.cshtml", bills);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveBill(int id)
    {
        var (success, errors) = await billService.ApproveBillAsync(id);
        if (!success)
        {
            TempData["ErrorMessage"] = errors[0];
            return RedirectToAction(nameof(Approvals));
        }
        TempData["SuccessMessage"] = "Bill approved successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectBill(int id, string? reason)
    {
        var (success, errors) = await billService.RejectBillAsync(id, reason);
        if (!success)
        {
            TempData["ErrorMessage"] = errors[0];
            return RedirectToAction(nameof(Approvals));
        }
        TempData["SuccessMessage"] = "Bill rejected.";
        return RedirectToAction(nameof(Approvals));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> RecordPayment(int billId, decimal amount, DateTime paymentDate, string? notes)
    {
        var (success, errors) = await billService.RecordPaymentAsync(billId, amount, paymentDate, notes);
        if (!success)
        {
            TempData["ErrorMessage"] = errors[0];
        }
        else
        {
            TempData["SuccessMessage"] = $"Payment of {amount:N2} recorded successfully.";
        }
        return RedirectToAction(nameof(Details), new { id = billId });
    }
}
