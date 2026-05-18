namespace Accounting.Data.ViewModels.Administration;

public class UserListItem
{
    public string Id { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public int AccessFailedCount { get; set; }
    public bool LockoutEnabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public bool IsLocked => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
}