# Accounting System - Full Documentation

> **Project:** Accounting System using .NET (DEPI Round 4)
> **Framework:** ASP.NET Core MVC (.NET 10.0)
> **Database:** SQLite (Entity Framework Core)
> **Architecture:** 3-Layer (Data / Services / Web)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Solution Structure](#2-solution-structure)
3. [Getting Started](#3-getting-started)
4. [Architecture & Design Patterns](#4-architecture--design-patterns)
5. [Domain Models](#5-domain-models)
6. [Identity & Authentication](#6-identity--authentication)
7. [Database Context & Configuration](#7-database-context--configuration)
8. [Service Layer](#8-service-layer)
9. [Controllers & Routing](#9-controllers--routing)
10. [Views & UI](#10-views--ui)
11. [ViewModels](#11-viewmodels)
12. [Business Logic & Workflows](#12-business-logic--workflows)
13. [Role-Based Access Control](#13-role-based-access-control)
14. [Configuration & Settings](#14-configuration--settings)
15. [Static Assets & Frontend](#15-static-assets--frontend)
16. [Seed Data](#16-seed-data)
17. [API Reference (Controller Actions)](#17-api-reference-controller-actions)

---

## 1. Project Overview

The Accounting System is a web-based application built with ASP.NET Core MVC that provides core accounting functionality including:

- **Bill Management** -- Create, edit, approve, reject, and track purchase bills
- **Payment Tracking** -- Record payments and automatically update bill statuses
- **Chart of Accounts** -- Manage accounts across Asset, Liability, Equity, Income, and Expense types
- **Multi-Currency Support** -- Track transactions in USD, EUR, GBP, and EGP
- **User Management** -- Role-based access control with Admin, Accountant, and User roles
- **Dashboard** -- Real-time financial overview with key metrics
- **Double-Entry Bookkeeping** -- Journal entry support for proper accounting records
- **Audit Trail** -- Full history of status changes and soft-delete support

---

## 2. Solution Structure

```
N-AccountingSystem/
|
|-- AccountingSystem.slnx                    # Solution file
|
|-- Accounting.Data/                          # Data Access Layer
|   |-- Accounting.Data.csproj
|   |-- Data/
|   |   +-- AppDbContext.cs                   # EF Core DbContext
|   |-- Domain/
|   |   |-- AuditableEntity.cs               # Base class (CreatedAt, UpdatedAt, DeletedAt)
|   |   |-- Enums.cs                         # All enumerations
|   |   |-- Item.cs                          # Inventory item entity
|   |   |-- Accounting/
|   |   |   |-- Account.cs                   # Chart of Accounts entity
|   |   |   |-- Currency.cs                  # Currency entity
|   |   |   +-- JournalEntry.cs              # Journal entry + items
|   |   |-- People/
|   |   |   +-- Contact.cs                   # Customer/Vendor entity
|   |   |-- Purchases/
|   |   |   +-- Bill.cs                      # Bill, BillItem, BillPayment, BillStatusLog
|   |   +-- Sales/
|   |       +-- Invoice.cs                   # Invoice, InvoiceItem, InvoicePayment, InvoiceStatusLog
|   |-- Identity/
|   |   |-- ApplicationUser.cs               # Custom Identity user
|   |   +-- IdentitySeed.cs                  # Database seeding
|   +-- ViewModels/
|       |-- SelectOption.cs                  # Generic dropdown option
|       |-- Auth/                            # Login, Register, ChangePassword, VerifyEmail
|       |-- Dashboard/                       # DashboardStats
|       |-- Accounting/                      # AccountFormViewModel
|       |-- Purchases/                       # Bill-related ViewModels
|       +-- Administration/                  # User management ViewModels
|
|-- Accounting.Services/                     # Business Logic Layer
|   |-- Accounting.Services.csproj
|   |-- Interfaces/
|   |   |-- IAccountService.cs
|   |   |-- IBillService.cs
|   |   |-- IDashboardService.cs
|   |   +-- IUserService.cs
|   |-- AccountService.cs
|   |-- BillService.cs
|   |-- DashboardService.cs
|   +-- UserService.cs
|
+-- AccountingSystem/                        # Web Presentation Layer
    |-- Accounting.Web.csproj
    |-- Program.cs                           # App startup & DI configuration
    |-- GlobalUsings.cs
    |-- appsettings.json
    |-- Properties/launchSettings.json
    |-- Models/
    |   +-- ErrorViewModel.cs
    |-- Controllers/
    |   |-- HomeController.cs                # Root routing & error pages
    |   |-- Auth/AccountController.cs        # Login, Register, Logout
    |   |-- Dashboard/DashboardController.cs # Dashboard stats
    |   |-- Accounting/AccountsController.cs # Chart of Accounts CRUD
    |   |-- Purchases/BillsController.cs     # Bills CRUD + workflows
    |   +-- Administration/UsersController.cs# User management
    |-- Views/
    |   |-- _ViewImports.cshtml
    |   |-- _ViewStart.cshtml
    |   |-- Shared/
    |   |   |-- _Layout.cshtml               # Main layout (navbar + footer)
    |   |   |-- _AccountLayout.cshtml        # Auth pages layout
    |   |   |-- _LoginPartial.cshtml         # User dropdown partial
    |   |   |-- _ValidationScriptsPartial.cshtml
    |   |   +-- Error.cshtml
    |   |-- Home/           (Index, Privacy)
    |   |-- Account/        (Login, Register, ChangePassword, VerifyEmail)
    |   |-- Dashboard/      (Index)
    |   |-- Accounting/Accounts/ (Index, Form)
    |   |-- Purchases/Bills/    (Index, Form, Details, Print, Approvals)
    |   +-- Administration/Users/ (Index, Form)
    +-- wwwroot/
        |-- css/site.css
        |-- css/account.css
        |-- js/site.js
        |-- Images/account-background.jpg
        +-- lib/ (bootstrap, jquery, jquery-validation)
```

---

## 3. Getting Started

### Prerequisites

- .NET 10.0 SDK
- A code editor (Visual Studio, VS Code, or Rider)

### Running the Application

```bash
cd N-AccountingSystem/AccountingSystem
dotnet run
```

The app launches on `http://localhost:5211` (or `https://localhost:7205`).

On first run in Development mode, the database is automatically created and seeded with default data.

### Default Admin Credentials

| Field    | Value          |
|----------|----------------|
| Email    | admin@admin.com |
| Password | Admin@123       |

---

## 4. Architecture & Design Patterns

### 3-Layer Architecture

| Layer                | Project              | Responsibility                            |
|----------------------|----------------------|-------------------------------------------|
| **Data Access**      | Accounting.Data      | Entities, DbContext, ViewModels, Identity  |
| **Business Logic**   | Accounting.Services  | Service interfaces & implementations      |
| **Presentation**     | AccountingSystem     | Controllers, Views, Static assets         |



---

## 5. Domain Models

### Base Class -- AuditableEntity

All major entities inherit from this base class:

| Property    | Type       | Description                              |
|-------------|------------|------------------------------------------|
| CreatedAt   | DateTime   | Record creation timestamp                |
| UpdatedAt   | DateTime   | Last modification timestamp              |
| DeletedAt   | DateTime?  | Soft-delete timestamp (null = active)    |
| IsDeleted   | bool       | Computed: `DeletedAt != null`            |

### Enumerations

```csharp
AccountType      : Asset, Liability, Equity, Income, Expense
CategoryType     : Income, Expense
ContactType      : Customer, Vendor
JournalEntryStatus : Draft, Posted
DocumentStatus   : Draft, Sent, Partial, Paid, Cancelled
DiscountType     : Percent, Fixed
```

### Entity Reference

#### Account

| Property       | Type          | Description                         |
|----------------|---------------|-------------------------------------|
| AccountId      | int (PK)      | Auto-generated ID                   |
| AccountNumber  | string        | Unique account code (e.g. "1001")   |
| Name           | string        | Account name (e.g. "Cash")          |
| Type           | AccountType   | Asset, Liability, Equity, etc.      |
| OpeningBalance | decimal       | Starting balance                    |
| Enabled        | bool          | Whether the account is active       |
| Currency       | Currency (FK) | Associated currency                 |

#### Currency

| Property           | Type    | Description                          |
|--------------------|---------|--------------------------------------|
| Name               | string (PK) | Currency code (e.g. "USD")       |
| Symbol             | string? | Display symbol (e.g. "$")            |
| Rate               | decimal | Exchange rate relative to base       |
| DecimalPlaces      | int     | Number of decimal places             |
| SymbolFirst        | bool    | Symbol before or after the amount    |
| DecimalMark        | string? | Decimal separator character          |
| ThousandsSeparator | string? | Thousands separator character        |
| Enabled            | bool    | Whether the currency is active       |

#### Contact

| Property   | Type          | Description                      |
|------------|---------------|----------------------------------|
| ContactId  | int (PK)      | Auto-generated ID                |
| Type       | ContactType   | Customer or Vendor               |
| Name       | string        | Contact name                     |
| Email      | string?       | Email address                    |
| Phone      | string?       | Phone number                     |
| Address    | string?       | Physical address                 |
| Enabled    | bool          | Whether the contact is active    |
| Currency   | Currency (FK) | Preferred currency               |

#### Bill

| Property       | Type            | Description                          |
|----------------|-----------------|--------------------------------------|
| BillId         | int (PK)        | Auto-generated ID                    |
| BillNumber     | string          | Unique number (BILL-yyyyMMdd-XXXX)   |
| OrderNumber    | string?         | Optional external reference          |
| Status         | DocumentStatus  | Current workflow status              |
| BilledAt       | DateTime        | Bill date                            |
| DueAt          | DateTime        | Payment due date                     |
| Amount         | decimal         | Total bill amount                    |
| ContactId      | int (FK)        | Vendor reference                     |
| ContactName    | string          | Snapshot of vendor name at creation  |
| ContactEmail   | string?         | Snapshot of vendor email             |
| ContactPhone   | string?         | Snapshot of vendor phone             |
| ContactAddress | string?         | Snapshot of vendor address           |
| CategoryId     | int (FK)        | Bill category                        |
| Notes          | string?         | Internal notes                       |
| Footer         | string?         | Footer text for printed bills        |
| ParentId       | int? (FK)       | Parent bill (for debit notes)        |
| **AmountPaid** | decimal         | Computed: Sum of all payments        |
| **AmountDue**  | decimal         | Computed: Amount - AmountPaid        |

**Related Collections:** Items, Payments, StatusLogs, DebitNotes

#### BillItem

| Property     | Type          | Description                                |
|--------------|---------------|--------------------------------------------|
| BillItemId   | int (PK)      | Auto-generated ID                          |
| BillId       | int (FK)      | Parent bill                                |
| ItemId       | int? (FK)     | Optional inventory item reference          |
| Description  | string        | Line item description                      |
| Quantity     | decimal       | Quantity                                   |
| Price        | decimal       | Unit price                                 |
| Total        | decimal       | Calculated total after discount            |
| DiscountRate | decimal       | Discount amount                            |
| DiscountType | DiscountType  | Percent or Fixed                           |
| AccountId    | int (FK)      | Expense/asset account for this line        |

**Total Calculation:**
- Percent discount: `Quantity * Price * (1 - DiscountRate / 100)`
- Fixed discount: `Quantity * Price - DiscountRate`

#### BillPayment

| Property        | Type      | Description                        |
|-----------------|-----------|------------------------------------|
| BillPaymentId   | int (PK)  | Auto-generated ID                  |
| BillId          | int (FK)  | Associated bill                    |
| JournalEntryId  | int? (FK) | Optional journal entry reference   |
| Amount          | decimal   | Payment amount                     |
| PaymentDate     | DateTime  | Date of payment                    |
| Notes           | string?   | Payment notes                      |
| CreatedAt       | DateTime  | Record creation timestamp          |

#### BillStatusLog

| Property         | Type            | Description                     |
|------------------|-----------------|---------------------------------|
| BillStatusLogId  | int (PK)        | Auto-generated ID               |
| BillId           | int (FK)        | Associated bill                 |
| Status           | DocumentStatus  | Status at this point            |
| Description      | string?         | Description of the change       |
| Notify           | bool            | Whether to notify               |
| CreatedAt        | DateTime        | When the status changed         |

#### Invoice (Sales -- mirrors Bill structure)

Same structure as Bill but for sales invoices. Includes: InvoiceItem, InvoicePayment, InvoiceStatusLog.

#### JournalEntry

| Property       | Type                | Description                     |
|----------------|---------------------|---------------------------------|
| JournalEntryId | int (PK)            | Auto-generated ID               |
| JournalNumber  | string              | Unique journal number           |
| EntryDate      | DateTime            | Date of entry                   |
| Description    | string?             | Entry description               |
| Reference      | string?             | External reference              |
| Status         | JournalEntryStatus  | Draft or Posted                 |
| SourceType     | string?             | Origin type (Bill, Invoice)     |
| SourceId       | int?                | Origin record ID                |
| Currency       | Currency (FK)       | Transaction currency            |

**Methods:**
- `IsBalanced()` -- Verifies total debits equal total credits
- `IsEditable()` -- Returns true if status is Draft

#### JournalItem

| Property      | Type      | Description                         |
|---------------|-----------|-------------------------------------|
| JournalItemId | int (PK)  | Auto-generated ID                   |
| JournalEntryId| int (FK)  | Parent journal entry                |
| AccountId     | int (FK)  | Account being debited/credited      |
| Debit         | decimal   | Debit amount (0 if credit)          |
| Credit        | decimal   | Credit amount (0 if debit)          |
| Description   | string?   | Line description                    |
| ContactId     | int? (FK) | Optional contact reference          |

**Validation:** `IsValid()` -- Ensures only debit OR credit is set, not both.

#### Item (Inventory)

| Property                 | Type      | Description                         |
|--------------------------|-----------|-------------------------------------|
| ItemId                   | int (PK)  | Auto-generated ID                   |
| ItemCode                 | string    | SKU or item code                    |
| ItemName                 | string    | Display name                        |
| Description              | string?   | Item description                    |
| DefaultSalePrice         | decimal   | Default selling price               |
| DefaultPurchasePrice     | decimal   | Default purchase price              |
| DefaultIncomeAccountId   | int? (FK) | Default income account              |
| DefaultExpenseAccountId  | int? (FK) | Default expense account             |
| Enabled                  | bool      | Whether the item is active          |

---

## 6. Identity & Authentication

### ApplicationUser

Extends ASP.NET Core `IdentityUser` with:

| Property | Type   | Description         |
|----------|--------|---------------------|
| FullName | string | User's display name |

### Roles

| Role       | Description                                         |
|------------|-----------------------------------------------------|
| Admin      | Full access: user management,Bill editing, approvals, all CRUD   |
| Accountant | payment recording, chart of accounts  |
| User       | Bill creation, viewing bills and dashboard           |

### Password Policy

| Requirement       | Value |
|-------------------|-------|
| Minimum Length     | 6     |
| Require Digit     | Yes   |
| Require Lowercase | Yes   |
| Require Uppercase | Yes   |
| Unique Email      | Yes   |

### Lockout Policy

| Setting                 | Value      |
|-------------------------|------------|
| Max Failed Attempts     | 5          |
| Lockout Duration        | 15 minutes |
| Lockout for New Users   | Yes        |

### Authentication Flow

1. User navigates to any page
2. Unauthenticated users are redirected to `/Account/Login`
3. On successful login, a cookie is set (with optional "Remember Me")
4. Authenticated users accessing `/` are redirected to the Dashboard

---

## 7. Database Context & Configuration

### Provider

**SQLite** with connection string: `Data Source=accounting.db`

### DbSets

```csharp
// Accounting
Accounts, Currencies, JournalEntries, JournalItems

// Sales
Invoices, InvoiceItems, InvoicePayments, InvoiceStatusLogs

// Purchases
Bills, BillItems, BillPayments, BillStatusLogs

// People & Inventory
Contacts, Items, Categories, Settings

// Identity (inherited from IdentityDbContext)
Users, Roles, UserRoles, UserClaims, RoleClaims, UserLogins, UserTokens
```

### Global Configuration

- **Delete Behavior:** `Restrict` on all foreign keys -- prevents cascade deletes to maintain data integrity
- **Database Creation:** `EnsureCreatedAsync()` on startup in Development environment

---

## 8. Service Layer

### IAccountService / AccountService

| Method                  | Returns                              | Description                              |
|-------------------------|--------------------------------------|------------------------------------------|
| GetAllAccountsAsync()   | IEnumerable\<SelectOption\>          | Lists all enabled, non-deleted accounts  |
| GetAccountFormModelAsync(id?) | AccountFormViewModel            | Loads form with dropdowns; populates existing account if id provided |
| SaveAccountAsync(model) | (bool Success, int AccountId, string[] Errors) | Creates or updates account; validates unique account number |
| DeleteAccountAsync(id)  | bool                                 | Soft-deletes the account                 |

### IBillService / BillService

| Method                     | Returns                              | Description                                   |
|----------------------------|--------------------------------------|-----------------------------------------------|
| GetAllBillsAsync(search?, status?) | IEnumerable\<BillListItem\>  | Lists bills with search/filter, ordered by date descending |
| GetBillByIdAsync(id)       | BillDetailViewModel?                 | Full bill detail with items, payments, history |
| GetBillFormModelAsync(id?) | BillFormViewModel                    | Form with dropdowns; loads existing bill if id provided |
| SaveBillAsync(model)       | (int BillId, string[] Errors)        | Creates/updates bill in a transaction; auto-creates payment if status is Paid |
| DeleteBillAsync(id)        | bool                                 | Soft-deletes the bill                         |
| ApproveBillAsync(id)       | (bool Success, string[] Errors)      | Changes status from Draft to Sent             |
| RejectBillAsync(id, reason?) | (bool Success, string[] Errors)    | Cancels bill with optional reason             |
| GetBillForPrintAsync(id)   | BillDetailViewModel?                 | Returns bill data for print view              |
| RecordPaymentAsync(billId, amount, date, notes?) | (bool Success, string[] Errors) | Records payment; auto-updates status to Partial/Paid |

### IDashboardService / DashboardService

| Method          | Returns        | Description                                    |
|-----------------|----------------|------------------------------------------------|
| GetStatsAsync() | DashboardStats | Aggregated financial metrics and bill counts   |

### IUserService / UserService

| Method                  | Returns                              | Description                              |
|-------------------------|--------------------------------------|------------------------------------------|
| GetAllUsersAsync()      | IEnumerable\<UserListItem\>          | Lists all users with roles and lock status |
| GetUserByIdAsync(id)    | UserFormViewModel?                   | Loads user data and assigned role         |
| CreateUserAsync(model)  | (bool Success, string[] Errors)      | Creates user with password and role       |
| UpdateUserAsync(model)  | (bool Success, string[] Errors)      | Updates user info, role, optional password |
| DeleteUserAsync(id)     | bool                                 | Permanently deletes the user              |
| ToggleLockAsync(id)     | bool                                 | Locks/unlocks user account (100-year lockout) |
| GetAvailableRolesAsync()| IEnumerable\<SelectOption\>          | Returns Admin, Accountant, User roles     |

---

## 9. Controllers & Routing

### Route Convention

Default route pattern: `{controller=Home}/{action=Index}/{id?}`

### HomeController

| Action          | Verb | Auth     | Route                      | Description                          |
|-----------------|------|----------|----------------------------|--------------------------------------|
| Index           | GET  | None     | /                          | Redirects to Dashboard or Login      |
| DashBoard       | GET  | Required | /Home/DashBoard            | Redirects to Dashboard/Index         |
| Privacy         | GET  | Required | /Home/Privacy              | Privacy policy page                  |
| Error           | GET  | None     | /Home/Error                | Generic error page                   |
| StatusCode      | GET  | None     | /Home/StatusCode/{code}    | Custom error page (404, 403, etc.)   |
| AccessDenied    | GET  | None     | /Home/AccessDenied         | 403 error page                       |

### AccountController (Auth)

| Action          | Verb     | Auth     | Route                      | Description                      |
|-----------------|----------|----------|----------------------------|----------------------------------|
| Login           | GET/POST | None     | /Account/Login             | User login with lockout support  |
| Register        | GET/POST | None     | /Account/Register          | New user registration (User role)|
| VerifyEmail     | GET/POST | None     | /Account/VerifyEmail       | Email verification step          |
| ChangePassword  | GET/POST | None     | /Account/ChangePassword    | Password reset                   |
| Logout          | POST     | Required | /Account/Logout            | Signs out the user               |

### DashboardController

| Action | Verb | Auth     | Route            | Description              |
|--------|------|----------|------------------|--------------------------|
| Index  | GET  | Required | /Dashboard       | Financial overview page  |

### AccountsController (Chart of Accounts)

| Action | Verb | Auth              | Route                | Description                |
|--------|------|-------------------|----------------------|----------------------------|
| Index  | GET  | Admin, Accountant | /Accounts            | List all accounts          |
| Create | GET  | Admin, Accountant | /Accounts/Create     | New account form           |
| Edit   | GET  | Admin, Accountant | /Accounts/Edit/{id}  | Edit account form          |
| Save   | POST | Admin, Accountant | /Accounts/Save       | Create or update account   |
| Delete | POST | Admin, Accountant | /Accounts/Delete     | Soft-delete account        |

### BillsController

| Action         | Verb | Auth              | Route                       | Description                  |
|----------------|------|-------------------|-----------------------------|------------------------------|
| Index          | GET  | Required          | /Bills                      | List bills with filters      |
| Details        | GET  | Required          | /Bills/Details/{id}         | Bill detail view             |
| Create         | GET  | Required          | /Bills/Create               | New bill form                |
| Edit           | GET  | Admin, Accountant | /Bills/Edit/{id}            | Edit existing bill           |
| Save           | POST | Required*         | /Bills/Save                 | Create/update bill           |
| Delete         | POST | Admin, Accountant | /Bills/Delete               | Soft-delete bill             |
| Print          | GET  | Required          | /Bills/Print/{id}           | Printable bill view          |
| ExportPdf      | GET  | Required          | /Bills/ExportPdf/{id}       | Print view for PDF export    |
| Approvals      | GET  | Admin             | /Bills/Approvals            | Draft bills awaiting approval|
| ApproveBill    | POST | Admin             | /Bills/ApproveBill          | Approve a draft bill         |
| RejectBill     | POST | Admin             | /Bills/RejectBill           | Reject/cancel a bill         |
| RecordPayment  | POST | Admin, Accountant | /Bills/RecordPayment        | Record a payment             |

*New bills: any authenticated user. Editing: Admin/Accountant only.

### UsersController

| Action      | Verb | Auth  | Route                   | Description                 |
|-------------|------|-------|-------------------------|-----------------------------|
| Index       | GET  | Admin | /Users                  | List all users              |
| Create      | GET  | Admin | /Users/Create           | New user form               |
| Create      | POST | Admin | /Users/Create           | Create user with role       |
| Edit        | GET  | Admin | /Users/Edit/{id}        | Edit user form              |
| Edit        | POST | Admin | /Users/Edit             | Update user and role        |
| Delete      | POST | Admin | /Users/Delete           | Delete user permanently     |
| ToggleLock  | POST | Admin | /Users/ToggleLock       | Lock/unlock user account    |

---

## 10. Views & UI

### Layouts

| Layout              | Used By                  | Description                              |
|---------------------|--------------------------|------------------------------------------|
| _Layout.cshtml      | Dashboard, Bills, Accounts, Users, Home | Main layout with navbar and footer |
| _AccountLayout.cshtml | Login, Register, ChangePassword, VerifyEmail | Minimal auth layout (no navbar) |

### Main Layout (_Layout.cshtml)

- **Navbar:** Dark primary theme with AccountingSystem branding
- **Navigation Items:**
  - Home (all users)
  - Dashboard (all users)
  - Purchases dropdown: Bills List, New Bill, Approvals (Admin only)
  - Chart of Accounts dropdown (Admin/Accountant): Accounts List, New Account
  - Administration dropdown (Admin only): Users Management, New User
- **User Menu:** (_LoginPartial) Shows full name, role badge, and logout button
- **Footer:** Copyright notice

### Auth Pages (Login, Register)

- Split-screen layout: background image on left (50%), form card on right (50%)
- Responsive: image hidden on screens below 992px
- Styled card with shadow, icons, and password toggle buttons

### Dashboard

- **Stats Row:** Total Bills, Accounts, Pending Approvals, Users (4 cards)
- **Financial Row:** Total Billed, Total Paid, Total Due (3 cards)
- **Status Row:** Draft, Sent, Paid, Overdue bill counts (4 cards)
- **Quick Actions:** 6 buttons for common operations
- **Sidebar:** Quick links + current user account card

### Bills Pages

| View       | Description                                                         |
|------------|---------------------------------------------------------------------|
| Index      | Searchable, filterable table with status badges and action buttons  |
| Form       | Dynamic line items with add/remove rows, discount calculations      |
| Details    | Full bill view with items, payments list, status history, payment form |
| Print      | Print-optimized layout with company header and bill details         |
| Approvals  | Admin-only list of Draft bills with approve/reject modals           |

### Accounts Pages

| View  | Description                                             |
|-------|---------------------------------------------------------|
| Index | Table of accounts with number, name, and edit button    |
| Form  | Account number, name, type, balance, currency, enabled  |

### Users Pages

| View  | Description                                                      |
|-------|------------------------------------------------------------------|
| Index | Table with name, email, role, lock status, and action buttons    |
| Form  | Name, email, phone, role dropdown, password fields               |

---

## 11. ViewModels

### Authentication

| ViewModel              | Fields                                           |
|------------------------|--------------------------------------------------|
| LoginViewModel         | Email (required), Password (required), RememberMe |
| RegisterViewModel      | Name, Email, Password (6-40 chars), ConfirmPassword |
| ChangePasswordViewModel| Email, NewPassword, ConfirmNewPassword            |
| VerifyEmailViewModel   | Email                                             |

### Dashboard

| ViewModel      | Fields                                                                    |
|----------------|---------------------------------------------------------------------------|
| DashboardStats | TotalBills, TotalAccounts, PendingApprovals, TotalUsers, TotalBillsAmount, TotalPaidAmount, TotalDueAmount, DraftBills, SentBills, PaidBills, OverdueBills |

### Purchases

| ViewModel            | Fields                                                              |
|----------------------|---------------------------------------------------------------------|
| BillFormViewModel    | BillId?, BillNumber, OrderNumber?, Status, BilledAt, DueAt, ContactId, CategoryId, CurrencyName, Notes?, Footer?, LineItems, + dropdown lists |
| BillLineItem         | BillItemId, ItemId?, Description, Quantity, Price, DiscountRate, DiscountType, AccountId, Total (computed) |
| BillDetailViewModel  | Full bill details + Items list + Payments list + StatusHistory list  |
| BillListItem         | Summary fields for index table display                              |
| BillApprovalViewModel| Bill details + PendingNotes for approval workflow                   |

### Accounting

| ViewModel            | Fields                                                     |
|----------------------|------------------------------------------------------------|
| AccountFormViewModel | AccountId?, AccountNumber, Name, Type, OpeningBalance, CurrencyName, Enabled, + dropdown lists |

### Administration

| ViewModel         | Fields                                                        |
|-------------------|---------------------------------------------------------------|
| UserFormViewModel | Id?, FullName, Email, PhoneNumber?, SelectedRole, Password?, ConfirmPassword?, + AvailableRoles |
| UserListItem      | Id, FullName, Email, PhoneNumber, Roles, AccessFailedCount, LockoutEnabled, LockoutEnd, IsLocked |

---

## 12. Business Logic & Workflows

### Bill Lifecycle

```
                    +-- [Admin Approves] --> Sent --+
                    |                               |
  Created --> Draft-+                               +--> Partial --> Paid
                    |                               |     (payment)   (full payment)
                    +-- [Admin Rejects] --> Cancelled
                    |
                    +-- [User sets Paid] --> Paid (auto-creates payment record)
```

**Status Transitions:**

| From    | To        | Triggered By                        | Who Can Do It     |
|---------|-----------|-------------------------------------|-------------------|
| Draft   | Sent      | Admin approves the bill             | Admin             |
| Draft   | Cancelled | Admin rejects the bill              | Admin             |
| Draft   | Paid      | User creates bill with Paid status  | Any authenticated |
| Sent    | Partial   | Partial payment recorded            | Admin, Accountant |
| Sent    | Paid      | Full payment recorded               | Admin, Accountant |
| Partial | Paid      | Remaining balance paid              | Admin, Accountant |

### Payment Recording

1. Validate: amount > 0, amount <= amount due, bill not cancelled/paid
2. Create BillPayment record
3. If total paid >= bill amount: set status to **Paid**
4. Otherwise: set status to **Partial**
5. Log status change in BillStatusLog

### Amount Calculations

```
Line Item Total:
  Percent Discount: Quantity * Price * (1 - DiscountRate / 100)
  Fixed Discount:   Quantity * Price - DiscountRate
  Minimum: 0 (no negative totals)

Bill Amount:    Sum of all non-deleted line item totals
Amount Paid:    Sum of all payment amounts
Amount Due:     Bill Amount - Amount Paid
```

### Dashboard Calculations

```
Total Billed:  Sum of all bill amounts
Total Paid:    For Paid bills: full Amount; otherwise: sum of payments
Total Due:     For Paid/Cancelled bills: 0; otherwise: Amount - Paid
Overdue:       Bills not Paid or Cancelled where DueAt < today
```

---

## 13. Role-Based Access Control

### Permission Matrix

| Feature                   | Admin | Accountant | User |
|---------------------------|-------|------------|------|
| View Dashboard            | Yes   | Yes        | Yes  |
| Create Bill               | Yes   | Yes        | Yes  |
| View Bills                | Yes   | Yes        | Yes  |
| Edit Bill                 | Yes   | Yes        | No   |
| Delete Bill               | Yes   | Yes        | No   |
| Approve/Reject Bill       | Yes   | No         | No   |
| Record Payment            | Yes   | Yes        | No   |
| Print Bill                | Yes   | Yes        | Yes  |
| View Chart of Accounts    | Yes   | Yes        | No   |
| Create/Edit/Delete Account| Yes   | Yes        | No   |
| View User Management      | Yes   | No         | No   |
| Create/Edit/Delete User   | Yes   | No         | No   |
| Lock/Unlock User          | Yes   | No         | No   |

### Navigation Visibility

- **Purchases > Approvals:** Admin only
- **Chart of Accounts menu:** Admin and Accountant only
- **Administration menu:** Admin only

---

## 14. Configuration & Settings

### Program.cs Configuration

```csharp
// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=accounting.db"));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
});

// Cookie paths
options.LoginPath = "/Account/Login";
options.AccessDeniedPath = "/Home/AccessDenied";

// Services (Scoped lifetime)
IUserService      -> UserService
IBillService      -> BillService
IAccountService   -> AccountService
IDashboardService -> DashboardService
```

### Middleware Pipeline

```
ExceptionHandler -> StatusCodePages -> HSTS (prod) -> StaticFiles
  -> Routing -> Authentication -> Authorization -> MapControllerRoute
```

### Launch Settings

| Profile | URL                                           |
|---------|-----------------------------------------------|
| http    | http://localhost:5211                          |
| https   | https://localhost:7205, http://localhost:5211  |

---

## 15. Static Assets & Frontend

### CSS

| File         | Purpose                                              |
|--------------|------------------------------------------------------|
| site.css     | Base site styles, Bootstrap overrides                |
| account.css  | Auth page split-screen layout, form cards, responsive rules |

### JavaScript

| File    | Purpose                                 |
|---------|-----------------------------------------|
| site.js | Placeholder for custom site scripts     |

### Client Libraries

| Library                          | Version | Purpose                     |
|----------------------------------|---------|-----------------------------|
| Bootstrap                        | 5.x     | CSS framework & components  |
| Bootstrap Icons                  | 1.11.3  | Icon library (CDN)          |
| jQuery                           | 3.x     | DOM manipulation            |
| jQuery Validation                | --      | Client-side form validation |
| jQuery Validation Unobtrusive    | --      | ASP.NET MVC validation glue |

### Images

| File                     | Usage                                |
|--------------------------|--------------------------------------|
| account-background.jpg   | Login/Register page background image |

---

## 16. Seed Data

On first run in Development mode, the following data is automatically created:

### Roles
Admin, Accountant, User

### Default Admin
- **Email:** admin@admin.com
- **Password:** Admin@123
- **Role:** Admin

### Currencies

| Code | Symbol | Rate  |
|------|--------|-------|
| USD  | $      | 1.00  |
| EUR  | EUR      | 0.92  |
| GBP  | GBP      | 0.79  |
| EGP  | E£     | 48.50 |

### Chart of Accounts

| Number | Name                | Type      |
|--------|---------------------|-----------|
| 1001   | Cash                | Asset     |
| 1002   | Bank Account        | Asset     |
| 1003   | Accounts Receivable | Asset     |
| 2001   | Accounts Payable    | Liability |
| 2002   | Notes Payable       | Liability |
| 3001   | Owner's Capital     | Equity    |
| 3002   | Retained Earnings   | Equity    |
| 4001   | Sales Revenue       | Income    |
| 4002   | Service Revenue     | Income    |
| 5001   | Rent Expense        | Expense   |
| 5002   | Utilities Expense   | Expense   |
| 5003   | Office Supplies     | Expense   |
| 5004   | Salaries Expense    | Expense   |
| 5005   | Cost of Goods Sold  | Expense   |

### Categories

| Name              | Type    |
|-------------------|---------|
| Office Supplies   | Expense |
| Utilities         | Expense |
| Rent              | Expense |
| Salaries & Wages  | Expense |
| Equipment         | Expense |
| Marketing         | Expense |
| Sales             | Income  |
| Services          | Income  |

### Vendors (Contacts)

| Name              | Email                    | Phone             |
|-------------------|--------------------------|-------------------|
| Office Depot      | orders@officedepot.com   | +1 800 463 3768   |
| Tech Supplies Co. | sales@techsupplies.com   | +1 800 555 1234   |
| Amazon Business   | business@amazon.com      | +1 888 232 9111   |
| Local Electric Co.| billing@localelectric.com| +1 555 0100       |

---

## 17. API Reference (Controller Actions)

### Authentication Endpoints

```
GET  /Account/Login              -- Login form
POST /Account/Login              -- Authenticate user
GET  /Account/Register           -- Registration form
POST /Account/Register           -- Create new user
GET  /Account/VerifyEmail        -- Email verification form
POST /Account/VerifyEmail        -- Verify email
GET  /Account/ChangePassword     -- Password reset form
POST /Account/ChangePassword     -- Reset password
POST /Account/Logout             -- Sign out
```

### Dashboard Endpoints

```
GET  /Dashboard                  -- Dashboard with financial stats
```

### Bill Endpoints

```
GET  /Bills                      -- List bills (?search=&status=)
GET  /Bills/Details/{id}         -- Bill detail view
GET  /Bills/Create               -- New bill form
GET  /Bills/Edit/{id}            -- Edit bill form (Admin/Accountant)
POST /Bills/Save                 -- Create or update bill
POST /Bills/Delete               -- Soft-delete bill (Admin/Accountant)
GET  /Bills/Print/{id}           -- Printable bill view
GET  /Bills/ExportPdf/{id}       -- PDF export view
GET  /Bills/Approvals            -- Pending approvals list (Admin)
POST /Bills/ApproveBill          -- Approve bill (Admin)
POST /Bills/RejectBill           -- Reject bill (Admin)
POST /Bills/RecordPayment        -- Record payment (Admin/Accountant)
```

### Account Endpoints

```
GET  /Accounts                   -- List accounts (Admin/Accountant)
GET  /Accounts/Create            -- New account form
GET  /Accounts/Edit/{id}         -- Edit account form
POST /Accounts/Save              -- Create or update account
POST /Accounts/Delete            -- Soft-delete account
```

### User Management Endpoints

```
GET  /Users                      -- List users (Admin)
GET  /Users/Create               -- New user form
POST /Users/Create               -- Create user
GET  /Users/Edit/{id}            -- Edit user form
POST /Users/Edit                 -- Update user
POST /Users/Delete               -- Delete user
POST /Users/ToggleLock           -- Lock/unlock user
```

### Error Endpoints

```
GET  /Home/Error                 -- Generic error page
GET  /Home/StatusCode/{code}     -- Custom error page (404, 403, etc.)
GET  /Home/AccessDenied          -- Access denied page
```
