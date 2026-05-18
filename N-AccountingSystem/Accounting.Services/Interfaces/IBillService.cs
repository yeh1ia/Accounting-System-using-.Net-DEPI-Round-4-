using Accounting.Data.ViewModels.Purchases;

namespace Accounting.Services.Interfaces;

public interface IBillService
{
    Task<IEnumerable<BillListItem>> GetAllBillsAsync(string? search = null, string? status = null);
    Task<BillDetailViewModel?> GetBillByIdAsync(int id);
    Task<BillFormViewModel> GetBillFormModelAsync(int? id = null);
    Task<(int BillId, string[] Errors)> SaveBillAsync(BillFormViewModel model);
    Task<bool> DeleteBillAsync(int id);
    Task<(bool Success, string[] Errors)> ApproveBillAsync(int id);
    Task<(bool Success, string[] Errors)> RejectBillAsync(int id, string? reason);
    Task<BillDetailViewModel?> GetBillForPrintAsync(int id);
    Task<(bool Success, string[] Errors)> RecordPaymentAsync(int billId, decimal amount, DateTime paymentDate, string? notes);
}