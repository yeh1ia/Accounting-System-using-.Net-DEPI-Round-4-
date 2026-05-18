using System.ComponentModel.DataAnnotations;

namespace Accounting.Data.ViewModels.Auth;

public class LoginViewModel
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = null!;

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }
}