using Accounting.Data.Domain;
using Accounting.Data.Domain.Accounting;
using Accounting.Data.Domain.People;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Accounting.Data.Identity
{
    public class IdentitySeed
    {
        public static async Task SeedDatabase(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<IdentitySeed>>();

            try
            {
                logger.LogInformation("Ensuring database is created...");
                await context.Database.EnsureCreatedAsync();

                // Seed Roles
                logger.LogInformation("Seeding roles...");
                await AddRoleAsync(roleManager, "Admin");
                await AddRoleAsync(roleManager, "Accountant");
                await AddRoleAsync(roleManager, "User");

                // Seed Admin user
                logger.LogInformation("Seeding admin user...");
                var adminEmail = "admin@admin.com";
                if (await userManager.FindByEmailAsync(adminEmail) == null)
                {
                    var adminUser = new ApplicationUser
                    {
                        FullName = "System Admin",
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true,
                        SecurityStamp = Guid.NewGuid().ToString(),
                    };
                    var result = await userManager.CreateAsync(adminUser, "Admin@123");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation("Admin user created.");
                    }
                    else
                    {
                        logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }

                // Seed default Currency
                if (!context.Currencies.Any())
                {
                    context.Currencies.AddRange(
                        new Currency { Name = "USD", Symbol = "$", Rate = 1m, DecimalPlaces = 2, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Currency { Name = "EUR", Symbol = "€", Rate = 0.92m, DecimalPlaces = 2, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Currency { Name = "GBP", Symbol = "£", Rate = 0.79m, DecimalPlaces = 2, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Currency { Name = "EGP", Symbol = "E£", Rate = 48.5m, DecimalPlaces = 2, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                    );
                    await context.SaveChangesAsync();
                    logger.LogInformation("Currencies seeded.");
                }

                // Seed Chart of Accounts
                if (!context.Accounts.Any())
                {
                    var usd = await context.Currencies.FindAsync("USD");
                    var accounts = new List<Account>
                    {
                        // Assets
                        new() { AccountNumber = "1001", Name = "Cash", Type = AccountType.Asset, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "1002", Name = "Bank Account", Type = AccountType.Asset, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "1003", Name = "Accounts Receivable", Type = AccountType.Asset, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        // Liabilities
                        new() { AccountNumber = "2001", Name = "Accounts Payable", Type = AccountType.Liability, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "2002", Name = "Notes Payable", Type = AccountType.Liability, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        // Equity
                        new() { AccountNumber = "3001", Name = "Owner's Capital", Type = AccountType.Equity, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "3002", Name = "Retained Earnings", Type = AccountType.Equity, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        // Income
                        new() { AccountNumber = "4001", Name = "Sales Revenue", Type = AccountType.Income, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "4002", Name = "Service Revenue", Type = AccountType.Income, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        // Expenses
                        new() { AccountNumber = "5001", Name = "Rent Expense", Type = AccountType.Expense, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "5002", Name = "Utilities Expense", Type = AccountType.Expense, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "5003", Name = "Office Supplies", Type = AccountType.Expense, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "5004", Name = "Salaries Expense", Type = AccountType.Expense, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new() { AccountNumber = "5005", Name = "Cost of Goods Sold", Type = AccountType.Expense, OpeningBalance = 0, Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    };
                    context.Accounts.AddRange(accounts);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Accounts seeded.");
                }

                // Seed Categories
                if (!context.Categories.Any())
                {
                    context.Categories.AddRange(
                        new Category { Name = "Office Supplies", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Utilities", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Rent", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Salaries & Wages", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Equipment", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Marketing", Type = CategoryType.Expense, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Sales", Type = CategoryType.Income, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Category { Name = "Services", Type = CategoryType.Income, Enabled = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                    );
                    await context.SaveChangesAsync();
                    logger.LogInformation("Categories seeded.");
                }

                // Seed Vendors (Contacts)
                if (!context.Contacts.Any())
                {
                    var usd = await context.Currencies.FindAsync("USD");
                    context.Contacts.AddRange(
                        new Contact { Name = "Office Depot", Type = ContactType.Vendor, Email = "orders@officedepot.com", Phone = "+1 800 463 3768", Address = "6600 N Military Trail, Boca Raton, FL 33496", Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Contact { Name = "Tech Supplies Co.", Type = ContactType.Vendor, Email = "sales@techsupplies.com", Phone = "+1 800 555 1234", Address = "123 Tech Blvd, Austin, TX 78701", Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Contact { Name = "Amazon Business", Type = ContactType.Vendor, Email = "business@amazon.com", Phone = "+1 888 232 9111", Address = "410 Terry Ave N, Seattle, WA 98109", Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new Contact { Name = "Local Electric Co.", Type = ContactType.Vendor, Email = "billing@localelectric.com", Phone = "+1 555 0100", Address = "456 Main St, Cairo, Egypt", Enabled = true, Currency = usd!, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                    );
                    await context.SaveChangesAsync();
                    logger.LogInformation("Vendors (Contacts) seeded.");
                }

                logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
            }
        }

        private static async Task AddRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to create role '{roleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }
    }
}