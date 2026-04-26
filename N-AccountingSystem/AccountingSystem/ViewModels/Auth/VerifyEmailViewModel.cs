using System.ComponentModel.DataAnnotations;

namespace Accounting.Data.ViewModels.Auth
{
    public class VerifyEmailViewModel
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        public string Email { get; set; }
    }
}
