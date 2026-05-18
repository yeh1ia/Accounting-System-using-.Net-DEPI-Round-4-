using Accounting.Data;
using Accounting.Data.Identity;
using Accounting.Services;
using Accounting.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")!));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedAccount = false;
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Home/AccessDenied";
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBillService, BillService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    await IdentitySeed.SeedDatabase(app.Services);
}

app.UseExceptionHandler("/Home/Error");
app.UseStatusCodePagesWithReExecute("/Home/StatusCode/{0}");

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// app.UseHttpsRedirection(); // Disabled for local development — enable with cert in production
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();