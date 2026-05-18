using Accounting.Data;
using Accounting.Data.Domain;
using Accounting.Data.Domain.Accounting;
using Accounting.Data.Domain.Purchases;
using Accounting.Data.ViewModels;
using Accounting.Data.ViewModels.Purchases;
using Microsoft.EntityFrameworkCore;

namespace Accounting.Services;

public class BillService : Interfaces.IBillService
{
    private readonly AppDbContext ctx;
    private readonly Func<DateTime, string> billNumberGenerator;

    public BillService(AppDbContext ctx)
    {
        this.ctx = ctx;
        this.billNumberGenerator = GenerateBillNumber;
    }

    private static string GenerateBillNumber(DateTime date)
    {
        return $"BILL-{date:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
    }

    public async Task<IEnumerable<BillListItem>> GetAllBillsAsync(string? search = null, string? status = null)
    {
        var query = ctx.Bills
            .AsNoTracking()
            .Include(b => b.Contact)
            .Include(b => b.Category)
            .Include(b => b.Currency)
            .Include(b => b.Payments)
            .Where(b => b.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b =>
                b.BillNumber.Contains(search) ||
                b.ContactName.Contains(search) ||
                (b.OrderNumber != null && b.OrderNumber.Contains(search)));

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DocumentStatus>(status, true, out var s))
            query = query.Where(b => b.Status == s);

        var bills = await query.OrderByDescending(b => b.BilledAt).ToListAsync();

        return bills.Select(b => new BillListItem
        {
            BillId = b.BillId,
            BillNumber = b.BillNumber,
            OrderNumber = b.OrderNumber,
            Status = b.Status,
            BilledAt = b.BilledAt,
            DueAt = b.DueAt,
            Amount = b.Amount,
            AmountPaid = b.AmountPaid,
            ContactName = b.ContactName,
            CategoryName = b.Category.Name,
            CurrencySymbol = b.Currency.Symbol ?? b.Currency.Name
        });
    }

    public async Task<BillDetailViewModel?> GetBillByIdAsync(int id)
    {
        var b = await ctx.Bills
            .AsNoTracking()
            .Include(b => b.Contact)
            .Include(b => b.Category)
            .Include(b => b.Currency)
            .Include(b => b.Items).ThenInclude(i => i.Account)
            .Include(b => b.Payments)
            .Include(b => b.StatusLogs)
            .FirstOrDefaultAsync(b => b.BillId == id && b.DeletedAt == null);

        if (b == null) return null;

        return MapToDetail(b);
    }

    public async Task<BillFormViewModel> GetBillFormModelAsync(int? id = null)
    {
        var currencies = await ctx.Currencies.Where(c => c.Enabled).AsNoTracking().ToListAsync();
        var categories = await ctx.Categories.Where(c => c.Enabled).AsNoTracking().ToListAsync();
        var contacts = await ctx.Contacts.Where(c => c.Enabled).AsNoTracking().ToListAsync();
        var accounts = await ctx.Accounts.Where(a => a.Enabled).AsNoTracking().ToListAsync();
        var statuses = Enum.GetValues<DocumentStatus>();

        var model = new BillFormViewModel
        {
            BillNumber = billNumberGenerator(DateTime.Today),
            BilledAt = DateTime.Today,
            DueAt = DateTime.Today.AddDays(30),
            CurrencyName = "USD",
            Currencies = currencies.Select(c => new SelectOption { Value = c.Name, Text = $"{c.Name} ({c.Symbol})" }),
            Categories = categories.Select(c => new SelectOption { Value = c.CategoryId.ToString(), Text = c.Name }),
            Contacts = contacts.Select(c => new SelectOption { Value = c.ContactId.ToString(), Text = c.Name }),
            Accounts = accounts.Select(a => new SelectOption { Value = a.AccountId.ToString(), Text = $"{a.AccountNumber} - {a.Name}" }),
            StatusOptions = statuses.Select(s => new SelectOption { Value = s.ToString(), Text = s.ToString() }),
            LineItems = new List<BillLineItem>
            {
                new() { Quantity = 1, Price = 0, AccountId = accounts.FirstOrDefault()?.AccountId ?? 0 }
            }
        };

        if (id.HasValue)
        {
            var bill = await ctx.Bills
                .Include(b => b.Items)
                .Include(b => b.Currency)
                .FirstOrDefaultAsync(b => b.BillId == id.Value && b.DeletedAt == null);

            if (bill != null)
            {
                model.BillId = bill.BillId;
                model.BillNumber = bill.BillNumber;
                model.OrderNumber = bill.OrderNumber;
                model.Status = bill.Status;
                model.BilledAt = bill.BilledAt;
                model.DueAt = bill.DueAt;
                model.ContactId = bill.ContactId;
                model.CategoryId = bill.CategoryId;
                model.CurrencyName = bill.Currency?.Name ?? "USD";
                model.Notes = bill.Notes;
                model.Footer = bill.Footer;
                model.LineItems = bill.Items.Select(i => new BillLineItem
                {
                    BillItemId = i.BillItemId,
                    ItemId = i.ItemId,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    DiscountRate = i.DiscountRate,
                    DiscountType = i.DiscountType,
                    AccountId = i.AccountId
                }).ToList();
            }
        }

        return model;
    }

    public async Task<(int BillId, string[] Errors)> SaveBillAsync(BillFormViewModel model)
    {
        if (model.LineItems.Count == 0)
            return (0, new[] { "At least one line item is required." });

        await using var transaction = await ctx.Database.BeginTransactionAsync();
        try
        {
            Bill bill;
            if (model.BillId.HasValue)
            {
                var existingBill = await ctx.Bills
                    .Include(b => b.Items)
                    .FirstOrDefaultAsync(b => b.BillId == model.BillId.Value && b.DeletedAt == null);
                if (existingBill == null)
                    return (0, new[] { "Bill not found." });
                bill = existingBill;
            }
            else
            {
                bill = new Bill { BillNumber = model.BillNumber };
                ctx.Bills.Add(bill);
            }

            bill.OrderNumber = model.OrderNumber;
            bill.Status = model.Status;
            bill.BilledAt = model.BilledAt;
            bill.DueAt = model.DueAt;
            bill.CategoryId = model.CategoryId;
            bill.Notes = model.Notes;
            bill.Footer = model.Footer;

            // Set contact info
            var contact = await ctx.Contacts.FindAsync(model.ContactId);
            if (contact == null) return (0, new[] { "Contact not found." });
            bill.ContactId = contact.ContactId;
            bill.ContactName = contact.Name;
            bill.ContactEmail = contact.Email;
            bill.ContactPhone = contact.Phone;
            bill.ContactAddress = contact.Address;

            // Set currency
            var currency = await ctx.Currencies.FindAsync(model.CurrencyName);
            if (currency == null) return (0, new[] { "Currency not found." });
            bill.Currency = currency;

            // Update line items
            bill.Items.Clear();
            foreach (var item in model.LineItems.Where(i => !string.IsNullOrWhiteSpace(i.Description)))
            {
                var bi = new BillItem
                {
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    DiscountRate = item.DiscountRate,
                    DiscountType = item.DiscountType,
                    AccountId = item.AccountId,
                    ItemId = item.ItemId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                bi.RecalculateTotal();
                bill.Items.Add(bi);
            }

            bill.RecalculateAmount();

            // When status is set to Paid, ensure a payment record exists for the full amount
            if (bill.Status == DocumentStatus.Paid && bill.AmountPaid < bill.Amount)
            {
                var remaining = bill.Amount - bill.AmountPaid;
                bill.Payments.Add(new BillPayment
                {
                    Amount = remaining,
                    PaymentDate = bill.BilledAt,
                    Notes = "Full payment recorded",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Log status change
            var existingLog = bill.StatusLogs.LastOrDefault();
            if (existingLog == null || existingLog.Status != bill.Status)
            {
                bill.StatusLogs.Add(new BillStatusLog
                {
                    Status = bill.Status,
                    CreatedAt = DateTime.UtcNow,
                    Description = model.BillId.HasValue ? "Bill updated" : "Bill created"
                });
            }

            bill.UpdatedAt = DateTime.UtcNow;
            if (!model.BillId.HasValue) bill.CreatedAt = DateTime.UtcNow;

            await ctx.SaveChangesAsync();
            await transaction.CommitAsync();
            return (bill.BillId, Array.Empty<string>());
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteBillAsync(int id)
    {
        var bill = await ctx.Bills.FirstOrDefaultAsync(b => b.BillId == id && b.DeletedAt == null);
        if (bill == null) return false;
        bill.DeletedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return true;
    }

    public async Task<(bool Success, string[] Errors)> ApproveBillAsync(int id)
    {
        var bill = await ctx.Bills.FirstOrDefaultAsync(b => b.BillId == id && b.DeletedAt == null);
        if (bill == null) return (false, new[] { "Bill not found." });

        if (bill.Status == DocumentStatus.Paid)
            return (false, new[] { "Cannot approve a bill that is already paid." });
        if (bill.Status == DocumentStatus.Cancelled)
            return (false, new[] { "Cannot approve a cancelled bill." });
        if (bill.Status == DocumentStatus.Sent)
            return (false, new[] { "Bill has already been sent." });

        bill.Status = DocumentStatus.Sent;
        bill.UpdatedAt = DateTime.UtcNow;
        bill.StatusLogs.Add(new BillStatusLog
        {
            Status = DocumentStatus.Sent,
            CreatedAt = DateTime.UtcNow,
            Description = "Bill approved"
        });
        await ctx.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> RejectBillAsync(int id, string? reason)
    {
        var bill = await ctx.Bills.FirstOrDefaultAsync(b => b.BillId == id && b.DeletedAt == null);
        if (bill == null) return (false, new[] { "Bill not found." });

        if (bill.Status == DocumentStatus.Cancelled)
            return (false, new[] { "Bill is already cancelled." });

        bill.Status = DocumentStatus.Cancelled;
        bill.UpdatedAt = DateTime.UtcNow;
        bill.StatusLogs.Add(new BillStatusLog
        {
            Status = DocumentStatus.Cancelled,
            CreatedAt = DateTime.UtcNow,
            Description = reason ?? "Bill rejected"
        });
        await ctx.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<BillDetailViewModel?> GetBillForPrintAsync(int id)
        => await GetBillByIdAsync(id);

    public async Task<(bool Success, string[] Errors)> RecordPaymentAsync(int billId, decimal amount, DateTime paymentDate, string? notes)
    {
        var bill = await ctx.Bills
            .Include(b => b.Payments)
            .Include(b => b.StatusLogs)
            .FirstOrDefaultAsync(b => b.BillId == billId && b.DeletedAt == null);

        if (bill == null) return (false, new[] { "Bill not found." });
        if (bill.Status == DocumentStatus.Cancelled) return (false, new[] { "Cannot record payment for a cancelled bill." });
        if (bill.Status == DocumentStatus.Paid) return (false, new[] { "Bill is already fully paid." });
        if (amount <= 0) return (false, new[] { "Payment amount must be greater than zero." });

        var amountDue = bill.Amount - bill.AmountPaid;
        if (amount > amountDue) return (false, new[] { $"Payment amount ({amount:N2}) exceeds amount due ({amountDue:N2})." });

        bill.Payments.Add(new BillPayment
        {
            Amount = amount,
            PaymentDate = paymentDate,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        });

        if (bill.AmountPaid >= bill.Amount)
        {
            bill.Status = DocumentStatus.Paid;
            bill.StatusLogs.Add(new BillStatusLog
            {
                Status = DocumentStatus.Paid,
                CreatedAt = DateTime.UtcNow,
                Description = "Bill fully paid"
            });
        }
        else
        {
            bill.Status = DocumentStatus.Partial;
            bill.StatusLogs.Add(new BillStatusLog
            {
                Status = DocumentStatus.Partial,
                CreatedAt = DateTime.UtcNow,
                Description = $"Payment recorded: {amount:N2}"
            });
        }

        bill.UpdatedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    private static BillDetailViewModel MapToDetail(Bill b) => new()
    {
        BillId = b.BillId,
        BillNumber = b.BillNumber,
        OrderNumber = b.OrderNumber,
        Status = b.Status,
        BilledAt = b.BilledAt,
        DueAt = b.DueAt,
        Amount = b.Amount,
        AmountPaid = b.AmountPaid,
        ContactName = b.ContactName,
        ContactEmail = b.ContactEmail,
        ContactPhone = b.ContactPhone,
        ContactAddress = b.ContactAddress,
        CurrencyName = b.Currency?.Name ?? "",
        CurrencySymbol = b.Currency?.Symbol ?? b.Currency?.Name ?? "",
        CategoryName = b.Category?.Name ?? "",
        Notes = b.Notes,
        Footer = b.Footer,
        Items = b.Items.Where(i => i.DeletedAt == null).Select(i => new BillItemRow
        {
            BillItemId = i.BillItemId,
            Description = i.Description,
            Quantity = i.Quantity,
            Price = i.Price,
            DiscountRate = i.DiscountRate,
            DiscountType = i.DiscountType,
            Total = i.Total,
            AccountName = i.Account?.Name ?? ""
        }).ToList(),
        Payments = b.Payments.Select(p => new BillPaymentRow
        {
            BillPaymentId = p.BillPaymentId,
            Amount = p.Amount,
            PaymentDate = p.PaymentDate,
            Notes = p.Notes
        }).ToList(),
        StatusHistory = b.StatusLogs.OrderBy(s => s.CreatedAt).Select(s => new BillStatusRow
        {
            Status = s.Status,
            Description = s.Description,
            CreatedAt = s.CreatedAt
        }).ToList(),
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt
    };
}