using Microsoft.AspNetCore.Identity;

namespace Accounting.Data.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
    }
}
