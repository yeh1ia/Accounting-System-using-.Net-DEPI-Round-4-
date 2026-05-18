using Accounting.Services.Interfaces;
using Accounting.Data.ViewModels.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountingSystem.Controllers.Accounting;

[Authorize(Roles = "Admin,Accountant")]
public class AccountsController : Controller
{
    private readonly IAccountService accountService;

    public AccountsController(IAccountService accountService)
    {
        this.accountService = accountService;
    }

    public async Task<IActionResult> Index()
    {
        var accounts = await accountService.GetAllAccountsAsync();
        return View("~/Views/Accounting/Accounts/Index.cshtml", accounts);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        var model = await accountService.GetAccountFormModelAsync(null);
        return View("~/Views/Accounting/Accounts/Form.cshtml", model);
    }

    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        var model = await accountService.GetAccountFormModelAsync(id);
        if (model.AccountId == null) return NotFound();
        return View("~/Views/Accounting/Accounts/Form.cshtml", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(AccountFormViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var formModel = await accountService.GetAccountFormModelAsync(model.AccountId);
            model.Currencies = formModel.Currencies;
            model.TypeOptions = formModel.TypeOptions;
            return View("~/Views/Accounting/Accounts/Form.cshtml", model);
        }

        var (success, accountId, errors) = await accountService.SaveAccountAsync(model);
        if (!success)
        {
            foreach (var error in errors)
                ModelState.AddModelError(string.Empty, error);
            var formModel = await accountService.GetAccountFormModelAsync(model.AccountId);
            model.Currencies = formModel.Currencies;
            model.TypeOptions = formModel.TypeOptions;
            return View("~/Views/Accounting/Accounts/Form.cshtml", model);
        }

        TempData["SuccessMessage"] = model.AccountId.HasValue ? "Account updated successfully." : "Account created successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await accountService.DeleteAccountAsync(id);
        if (!success) return NotFound();
        TempData["SuccessMessage"] = "Account deleted successfully.";
        return RedirectToAction(nameof(Index));
    }
}