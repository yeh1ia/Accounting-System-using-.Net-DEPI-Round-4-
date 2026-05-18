# Accounting System

An ASP.NET Core MVC accounting system built with .NET 10, following N-Tier Architecture.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- No database server required — uses SQLite (embedded)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd N-AccountingSystem

# Restore dependencies
dotnet restore

# Run the application
dotnet run --project AccountingSystem
```

The application starts at **http://localhost:5211**

On first run in Development mode, the database is automatically created and seeded with sample data.

### Default Admin Credentials

| Field    | Value           |
|----------|-----------------|
| Email    | admin@admin.com |
| Password | Admin@123       |

## Architecture

```
N-AccountingSystem/
├── AccountingSystem/           # Presentation Layer (ASP.NET Core MVC)
│   ├── Controllers/
│   │   ├── Auth/               # Login, Register, Password Reset
│   │   ├── Dashboard/          # Dashboard statistics
│   │   ├── Accounting/         # Chart of Accounts CRUD
│   │   ├── Purchases/          # Bills CRUD, Approvals
│   │   └── Administration/     # User Management
│   ├── Views/                  # Razor Views
│   ├── wwwroot/                # Static files (CSS, JS)
│   └── Program.cs              # DI & Middleware configuration
│
├── Accounting.Services/        # Business Logic Layer
│   ├── Interfaces/             # Service contracts
│   ├── AccountService.cs       # Chart of Accounts logic
│   ├── BillService.cs          # Bill lifecycle management
│   ├── UserService.cs          # User & role management
│   └── DashboardService.cs     # Dashboard statistics
│
└── Accounting.Data/            # Data Access Layer
    ├── Data/AppDbContext.cs     # EF Core DbContext
    ├── Domain/                 # Entity models
    ├── Identity/               # ASP.NET Identity + seed data
    └── ViewModels/             # DTOs / View Models
```

## Roles & Permissions

The system uses Role-Based Access Control (RBAC) with three roles:

| Feature              | Admin | Accountant | User |
|----------------------|-------|------------|------|
| Dashboard            | Yes   | Yes        | Yes  |
| View Bills           | Yes   | Yes        | Yes  |
| Create Bills         | Yes   | Yes        | Yes  |
| Edit Bills           | Yes   | Yes        | No   |
| Delete Bills         | Yes   | Yes        | No   |
| Approve/Reject Bills | Yes   | No         | No   |
| Chart of Accounts    | Yes   | Yes        | No   |
| User Management      | Yes   | No         | No   |
| Lock/Unlock Users    | Yes   | No         | No   |

- **Admin**: Full access to all features including user management and bill approvals
- **Accountant**: Can manage chart of accounts and bills (create, edit, delete)
- **User**: Can only create and view bills

New users who register through the public registration page are automatically assigned the **User** role.

## Workflow

### Bill Lifecycle

1. **Draft** — Bill is created (any authenticated user)
2. **Sent** — Admin approves the bill via the Approvals page
3. **Partial** — Partial payment received
4. **Paid** — Full payment received
5. **Cancelled** — Admin rejects the bill

### User Management (Admin only)

- Create users with specific roles
- Edit user details and change roles
- Lock/unlock user accounts
- Delete users

### Chart of Accounts (Admin & Accountant)

- Create accounts with type (Asset, Liability, Equity, Income, Expense)
- Set opening balances and currencies
- Enable/disable accounts
- Soft-delete accounts

## Technology Stack

- **Framework**: ASP.NET Core MVC (.NET 10)
- **Database**: SQLite via Entity Framework Core 10
- **Authentication**: ASP.NET Core Identity
- **Frontend**: Bootstrap 5, Bootstrap Icons
- **Architecture**: N-Tier (Presentation → Services → Data)

## Security Features

- Role-based access control (RBAC)
- Account lockout after 5 failed login attempts (15 min)
- Anti-forgery tokens on all forms
- Soft-delete pattern (data is never permanently removed)
- Password requirements: 6+ characters, uppercase, lowercase, digit
