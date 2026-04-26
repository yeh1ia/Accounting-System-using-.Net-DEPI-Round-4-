using Accounting.Data;
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
                logger.LogInformation("Ensuring the database is created.");
                await context.Database.EnsureCreatedAsync();


                logger.LogInformation("Seeding roles.");
                await AddRoleAsync(roleManager, "Manager");
                await AddRoleAsync(roleManager, "Accountant");
                await AddRoleAsync(roleManager, "Bookkeeper");


                logger.LogInformation("Seeding manager user.");
                var managerEmail = "manager@manage.com";
                if (await userManager.FindByEmailAsync(managerEmail) == null) 
                {
                    var managerUser = new ApplicationUser
                    {
                        FullName = "Ahmed Ibr",
                        UserName = managerEmail,
                        NormalizedUserName = managerEmail.ToUpper(),
                        Email = managerEmail,
                        NormalizedEmail = managerEmail.ToUpper(),
                        EmailConfirmed = true,
                        SecurityStamp = Guid.NewGuid().ToString(),
                    };

                    var result = await userManager.CreateAsync(managerUser, "Manager@123");
                    if (result.Succeeded)
                    {
                        logger.LogInformation("Assigning Manager role to the manageruser.");
                        await userManager.AddToRoleAsync(managerUser, "Manager");
                    }
                    else
                    {
                        logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e=> e.Description)));
                    }
                }
            }
            catch (Exception ex) 
            {
                logger.LogError(ex, "An Error occurred while seeding the database.");
            }
        }

        private static async Task AddRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to create role '{roleName}' : {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }
    }
}
