using Accounting.Services.Interfaces;
using Accounting.Data.ViewModels.Administration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountingSystem.Controllers.Administration;

[Authorize(Roles = "Admin")]
public class UsersController : Controller
{
    private readonly IUserService userService;

    public UsersController(IUserService userService)
    {
        this.userService = userService;
    }

    public async Task<IActionResult> Index()
    {
        var users = await userService.GetAllUsersAsync();
        return View("~/Views/Administration/Users/Index.cshtml", users);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        var roles = await userService.GetAvailableRolesAsync();
        var model = new UserFormViewModel { AvailableRoles = roles };
        return View("~/Views/Administration/Users/Form.cshtml", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(UserFormViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailableRoles = await userService.GetAvailableRolesAsync();
            return View("~/Views/Administration/Users/Form.cshtml", model);
        }

        var (success, errors) = await userService.CreateUserAsync(model);
        if (!success)
        {
            foreach (var error in errors)
                ModelState.AddModelError(string.Empty, error);
            model.AvailableRoles = await userService.GetAvailableRolesAsync();
            return View("~/Views/Administration/Users/Form.cshtml", model);
        }

        TempData["SuccessMessage"] = "User created successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Edit(string id)
    {
        var model = await userService.GetUserByIdAsync(id);
        if (model == null) return NotFound();
        return View("~/Views/Administration/Users/Form.cshtml", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(UserFormViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailableRoles = await userService.GetAvailableRolesAsync();
            return View("~/Views/Administration/Users/Form.cshtml", model);
        }

        var (success, errors) = await userService.UpdateUserAsync(model);
        if (!success)
        {
            foreach (var error in errors)
                ModelState.AddModelError(string.Empty, error);
            model.AvailableRoles = await userService.GetAvailableRolesAsync();
            return View("~/Views/Administration/Users/Form.cshtml", model);
        }

        TempData["SuccessMessage"] = "User updated successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await userService.DeleteUserAsync(id);
        if (!success) return NotFound();
        TempData["SuccessMessage"] = "User deleted successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleLock(string id)
    {
        await userService.ToggleLockAsync(id);
        TempData["SuccessMessage"] = "User lock status toggled.";
        return RedirectToAction(nameof(Index));
    }
}
