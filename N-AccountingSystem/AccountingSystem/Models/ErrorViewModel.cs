namespace AccountingSystem.Models;

public class ErrorViewModel
{
    public string? RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    public int StatusCode { get; set; }
    public string Title { get; set; } = "Error";
    public string Message { get; set; } = "An unexpected error occurred.";
}
