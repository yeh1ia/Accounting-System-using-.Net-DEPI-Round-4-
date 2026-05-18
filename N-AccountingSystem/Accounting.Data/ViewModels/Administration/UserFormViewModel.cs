namespace Accounting.Data.ViewModels.Administration;

public class UserFormViewModel
{
    public string? Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string SelectedRole { get; set; } = null!;
    public IEnumerable<SelectOption> AvailableRoles { get; set; } = new List<SelectOption>();
    public string? Password { get; set; }
    public string? ConfirmPassword { get; set; }
    public bool IsEdit => !string.IsNullOrEmpty(Id);
}