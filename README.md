# Accounting-System-using-.Net-DEPI-Round-4

# .NET Accounting System

A comprehensive web-based accounting system built with .NET, featuring a modern layered architecture designed for enterprise-grade financial management.

## 🏗️ Architecture Overview

This application follows a clean, layered architecture pattern to ensure maintainability, scalability, and separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (Web App)               │
│        Blazor/ASP.NET MVC - Web Interface              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│           API Layer (ASP.NET Core Web API)              │
│    Controllers | Authentication/JWT | Validation        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│        Business Logic Layer (Core Application)          │
│  GL | AP | AR | Bank Rec | Fixed Assets | Inventory    │
│  Reports | Tax | Budgeting | Audit | Multi-Currency    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│      Data Access Layer (Entity Framework Core)          │
│   Repository Pattern | Unit of Work | DbContext         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│           SQL Server / PostgreSQL                        │
└─────────────────────────────────────────────────────────┘

Supporting Libraries:
├── Reporting Library (.NET) - QuestPDF/iTextSharp + CsvHelper
├── External Integrations - Payment Gateways, Banking APIs
└── Security & Authentication - JWT + Identity Server
```

## ✨ Features

### Core Accounting Modules

#### General Ledger
- **Chart of Accounts** - Hierarchical account structure with customizable account types
- **Journal Entries** - Manual and automated posting capabilities
- **Account Reconciliation** - Period-end closing and reconciliation workflows

#### Accounts Payable (AP)
- **Vendor Management** - Comprehensive vendor database with contact information
- **Invoice Processing** - Purchase order matching and three-way matching
- **Payment Processing** - Batch payments and payment scheduling

#### Accounts Receivable (AR)
- **Customer Management** - Customer profiles with credit limits and terms
- **Invoicing** - Automated invoice generation and customizable templates
- **Collections** - Aging reports and automated payment reminders

#### Bank Reconciliation
- **Transaction Matching** - Automated matching of bank statements
- **Reconciliation Reports** - Detailed reconciliation history and audit trails

#### Fixed Assets
- **Asset Tracking** - Complete asset lifecycle management
- **Depreciation** - Multiple depreciation methods (Straight-line, Declining balance, etc.)
- **Asset Disposal** - Automated gain/loss calculations

#### Inventory
- **Stock Management** - Real-time inventory tracking with multiple locations
- **Valuation Methods** - FIFO, LIFO, and Weighted Average costing
- **Reorder Management** - Automated reorder points and purchase suggestions

### Financial Management

#### Financial Reports
- **Profit & Loss Statement** - Comprehensive income statements with drill-down capability
- **Balance Sheet** - Real-time balance sheet with comparative periods
- **Cash Flow Statement** - Operating, investing, and financing activities
- **Custom Reports** - Flexible report builder with PDF and CSV export options

#### Tax Management
- **VAT/Sales Tax** - Automated tax calculations and compliance reporting
- **Tax Returns** - Period-based tax return preparation
- **Multi-jurisdiction** - Support for multiple tax authorities and rates

#### Budgeting
- **Budget Planning** - Annual and departmental budget creation
- **Budget Analysis** - Variance analysis and performance tracking
- **Forecasting** - Rolling forecasts with scenario planning

#### Audit Trail
- **History Tracking** - Complete audit trail for all transactions
- **User Activity Logs** - Detailed logging of all system activities
- **Compliance Reports** - Regulatory compliance and audit reports

#### Multi-Currency
- **Exchange Rates** - Automated exchange rate updates
- **Foreign Currency Transactions** - Multi-currency support for AR/AP
- **Revaluation** - Automatic foreign currency revaluation

## 🛠️ Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **API**: ASP.NET Core Web API with RESTful design
- **ORM**: Entity Framework Core
- **Authentication**: JWT (JSON Web Tokens) with role-based access control
- **Validation**: FluentValidation for business rule enforcement

### Frontend
- **UI Framework**: Blazor / ASP.NET MVC
- **Styling**: Bootstrap 5 / Tailwind CSS
- **JavaScript**: Modern ES6+ for interactive components

### Database
- **Primary**: SQL Server / PostgreSQL
- **Features**: 
  - Tables, Views, and Stored Procedures
  - Automatic Migrations
  - Backup & Recovery strategies

### External Integrations
- **Payment Gateways**: Integration with major payment processors
- **Banking APIs**: Automated bank feed integration
- **Tax Services**: Tax calculation and filing services via APIs
- **Email/SMS**: Notification services for alerts and reminders

### Security & Authentication
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Identity Server**: Centralized authentication and authorization
- **Data Encryption**: Sensitive data encryption at rest and in transit

### Reporting & Analytics
- **QuestPDF / iTextSharp**: PDF report generation library
- **CsvHelper**: CSV file generation and export
- **Custom Report Engine**: Built-in report templates and formatting
- **Export Capabilities**: PDF and CSV export for all financial reports

## 🚀 Getting Started

### Prerequisites

```bash
- .NET 8.0 SDK or later
- SQL Server 2019+ or PostgreSQL 13+
- Node.js 18+ (for frontend assets)
- Visual Studio 2022 or VS Code
```

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/yourusername/dotnet-accounting-system.git](https://github.com/yeh1ia/Accounting-System-using-.Net-DEPI-Round-4-)
cd dotnet-accounting-system
```

2. **Configure the database connection**

Edit `appsettings.json` in the API project:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AccountingDB;Trusted_Connection=True;"
  }
}
```

3. **Run database migrations**
```bash
cd src/DataAccessLayer
dotnet ef database update
```

4. **Build the solution**
```bash
dotnet build
```

5. **Install reporting libraries** (if not already included)
```bash
# For PDF generation
dotnet add package QuestPDF
# OR
dotnet add package iTextSharp.LGPLv2.Core

# For CSV export
dotnet add package CsvHelper
```

6. **Run the application**
```bash
cd src/PresentationLayer
dotnet run
```

The application will be available at `https://localhost:5001`

### Default Credentials

```
Username: admin@accounting.com
Password: Admin@123
```

**⚠️ Important**: Change the default credentials immediately after first login.

## 📁 Project Structure

```
├── src/
│   ├── PresentationLayer/          # Web UI (Blazor/MVC)
│   │   ├── Controllers/
│   │   ├── Views/
│   │   ├── wwwroot/
│   │   └── Program.cs
│   │
│   ├── ApiLayer/                   # REST API
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Authentication/
│   │   └── Validation/
│   │
│   ├── BusinessLogicLayer/         # Core Application
│   │   ├── Services/
│   │   │   ├── GeneralLedger/
│   │   │   ├── AccountsPayable/
│   │   │   ├── AccountsReceivable/
│   │   │   ├── Banking/
│   │   │   ├── FixedAssets/
│   │   │   ├── Inventory/
│   │   │   ├── Reports/
│   │   │   ├── Tax/
│   │   │   └── Budgeting/
│   │   ├── Models/
│   │   └── Interfaces/
│   │
│   ├── ReportingLibrary/           # Report Generation
│   │   ├── PdfGenerator/
│   │   │   ├── Templates/
│   │   │   ├── FinancialReports/
│   │   │   └── Formatters/
│   │   ├── CsvExporter/
│   │   │   ├── ExportServices/
│   │   │   └── Mappings/
│   │   └── Interfaces/
│   │
│   ├── DataAccessLayer/            # Data Access
│   │   ├── Context/
│   │   ├── Repositories/
│   │   ├── UnitOfWork/
│   │   └── Migrations/
│   │
│   └── DatabaseLayer/              # Database Scripts
│       ├── Tables/
│       ├── Views/
│       ├── StoredProcedures/
│       └── Seeds/
│
├── tests/
│   ├── UnitTests/
│   ├── IntegrationTests/
│   └── E2ETests/
│
└── docs/
    ├── API.md
    ├── UserGuide.md
    └── DeveloperGuide.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Authorization**: Fine-grained permission system
- **Data Encryption**: Sensitive data encrypted using AES-256
- **SQL Injection Protection**: Parameterized queries and ORM security
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Anti-forgery tokens on all forms
- **Audit Logging**: Comprehensive audit trail for compliance
- **Password Policies**: Strong password requirements and periodic rotation

## 📊 API Documentation

RESTful API endpoints are available for third-party integrations:

- **Authentication**: `/api/auth/*`
- **General Ledger**: `/api/gl/*`
- **Accounts Payable**: `/api/ap/*`
- **Accounts Receivable**: `/api/ar/*`
- **Inventory**: `/api/inventory/*`
- **Reports**: `/api/reports/*`

Full API documentation is available at `/swagger` when running in development mode.

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
dotnet test tests/UnitTests/

# Integration tests
dotnet test tests/IntegrationTests/

# All tests
dotnet test
```

## 📈 Performance Optimization

- **Caching**: Redis/Memory caching for frequently accessed data
- **Database Indexing**: Optimized indexes on critical tables
- **Lazy Loading**: Efficient data loading strategies
- **Pagination**: Server-side pagination for large datasets
- **Async Operations**: Asynchronous processing for long-running tasks
- **Query Optimization**: Stored procedures for complex operations

## 🌐 Deployment

### IIS Deployment

1. Publish the application:
```bash
dotnet publish -c Release -o ./publish
```

2. Configure IIS application pool (.NET CLR Version: No Managed Code)
3. Deploy the published files to IIS wwwroot
4. Configure the database connection string in web.config

### Docker Deployment

```bash
docker build -t accounting-system .
docker run -p 8080:80 accounting-system
```

### Cloud Deployment

The application is ready for deployment to:
- Azure App Service
- AWS Elastic Beanstalk
- Google Cloud Platform

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 👥 Team

- Project Lead: [Your Name]
- Backend Development: [Team Member]
- Frontend Development: [Team Member]
- Database Architecture: [Team Member]

## 📞 Support

For support and questions:
- **Email**: support@accountingsystem.com
- **Documentation**: [Wiki](https://github.com/yourusername/dotnet-accounting-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/dotnet-accounting-system/issues)

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Mobile app (Xamarin/MAUI)
- [ ] Advanced AI-powered forecasting
- [ ] Blockchain integration for audit trail
- [ ] Enhanced multi-company support
- [ ] GraphQL API support
- [ ] Real-time collaboration features

### Version 1.5 (In Progress)
- [x] Bank feed automation
- [x] Multi-currency support
- [ ] Advanced reporting dashboards
- [ ] Automated reconciliation

## 📚 Additional Resources

- [User Guide](docs/UserGuide.md)
- [Developer Guide](docs/DeveloperGuide.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DatabaseSchema.md)
- [Deployment Guide](docs/Deployment.md)

---

**Built with ❤️ using .NET Core**

⭐ Star this repository if you find it helpful!
