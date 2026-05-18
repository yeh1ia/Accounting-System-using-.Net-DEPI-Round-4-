using Accounting.Data.Domain;
using Accounting.Data.Domain.Accounting;
using Accounting.Data.Domain.People;
using Accounting.Data.Domain.Purchases;
using Accounting.Data.Domain.Sales;
using Accounting.Data.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Accounting.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<Currency> Currencies { get; set; } = null!;
        public DbSet<JournalEntry> JournalEntries { get; set; } = null!;
        public DbSet<JournalItem> JournalItems { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;
        public DbSet<InvoicePayment> InvoicePayments { get; set; } = null!;
        public DbSet<InvoiceStatusLog> InvoiceStatusLogs { get; set; } = null!;
        public DbSet<Bill> Bills { get; set; } = null!;
        public DbSet<BillItem> BillItems { get; set; } = null!;
        public DbSet<BillPayment> BillPayments { get; set; } = null!;
        public DbSet<BillStatusLog> BillStatusLogs { get; set; } = null!;
        public DbSet<Contact> Contacts { get; set; } = null!;
        public DbSet<Item> Items { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Setting> Settings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Disable cascade delete for all foreign keys to avoid SQL Server multiple cascade paths
            foreach (var foreignKey in modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys()))
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}