USE Accounting;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE SCHEMA sales;
GO
CREATE SCHEMA purchases;
GO
CREATE SCHEMA accounting;
GO
CREATE SCHEMA people;
GO
CREATE SCHEMA system;
GO


-- currencies
CREATE TABLE accounting.currencies (
    currency_code       NVARCHAR(3) NOT NULL
        CONSTRAINT PK_currencies PRIMARY KEY CLUSTERED,
    name                NVARCHAR(255) NOT NULL,
    rate                DECIMAL(19,6) NOT NULL,
    [precision]         INT NOT NULL DEFAULT 2,
    symbol              NVARCHAR(10) NULL,
    symbol_first        BIT NOT NULL DEFAULT 1,
    decimal_mark        NVARCHAR(1) NULL DEFAULT N'.',
    thousands_separator NVARCHAR(1) NULL DEFAULT N',',
    enabled             BIT NOT NULL DEFAULT 1,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL
);
CREATE UNIQUE NONCLUSTERED INDEX UQ_currencies_code_active
    ON accounting.currencies (currency_code)
    WHERE deleted_at IS NULL;

-- contacts
CREATE TABLE people.contacts (
    contact_id          INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_contacts PRIMARY KEY CLUSTERED,
    type                NVARCHAR(10) NOT NULL CHECK (type IN ('customer','vendor')),
    name                NVARCHAR(255) NOT NULL,
    email               NVARCHAR(255) NULL,
    phone               NVARCHAR(50) NULL,
    address             NVARCHAR(255) NULL,
    currency_code       NVARCHAR(3) NOT NULL,
    enabled             BIT NOT NULL DEFAULT 1,
    reference           NVARCHAR(255) NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_contacts_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code)
);
CREATE NONCLUSTERED INDEX IX_contacts_type ON people.contacts (type);
CREATE UNIQUE NONCLUSTERED INDEX UQ_contacts_type_email_active
    ON people.contacts (type, email)
    WHERE deleted_at IS NULL AND email IS NOT NULL;

-- chart of accounts
CREATE TABLE accounting.accounts (
    account_id          INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_accounts PRIMARY KEY CLUSTERED,
    name                NVARCHAR(255) NOT NULL,
    account_number      NVARCHAR(255) NOT NULL,
    type                NVARCHAR(20) NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
    currency_code       NVARCHAR(3) NOT NULL,
    opening_balance     DECIMAL(19,4) NOT NULL,
    enabled             BIT NOT NULL DEFAULT 1,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_accounts_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code)
);
CREATE UNIQUE NONCLUSTERED INDEX UQ_accounts_number_active
    ON accounting.accounts (account_number)
    WHERE deleted_at IS NULL;

-- categories 
CREATE TABLE accounting.categories (
    category_id         INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_categories PRIMARY KEY CLUSTERED,
    name                NVARCHAR(255) NOT NULL,
    type                NVARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
    enabled             BIT NOT NULL DEFAULT 1,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL
);

-- journal entries
CREATE TABLE accounting.journal_entries (
    journal_entry_id    INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_journal_entries PRIMARY KEY CLUSTERED,
    journal_number      NVARCHAR(255) NOT NULL,
    entry_date          DATETIME2 NOT NULL,
    description         NVARCHAR(255) NULL,
    reference           NVARCHAR(255) NULL,
    currency_code       NVARCHAR(3) NOT NULL,
    currency_rate       DECIMAL(19,6) NOT NULL DEFAULT 1,
    status              NVARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted')),
    source_type         NVARCHAR(50) NULL,
    source_id           INT NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_journal_entries_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code)
);
CREATE UNIQUE NONCLUSTERED INDEX UQ_journal_entries_number_active
    ON accounting.journal_entries (journal_number)
    WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX IX_journal_entries_currency_code ON accounting.journal_entries (currency_code);

-- journal items
CREATE TABLE accounting.journal_items (
    journal_item_id     INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_journal_items PRIMARY KEY CLUSTERED,
    journal_entry_id    INT NOT NULL,
    account_id          INT NOT NULL,
    debit               DECIMAL(19,4) NOT NULL DEFAULT 0,
    credit              DECIMAL(19,4) NOT NULL DEFAULT 0,
    description         NVARCHAR(255) NULL,
    contact_id          INT NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_journal_items_journal FOREIGN KEY (journal_entry_id) REFERENCES accounting.journal_entries (journal_entry_id),
    CONSTRAINT FK_journal_items_account FOREIGN KEY (account_id) REFERENCES accounting.accounts (account_id),
    CONSTRAINT CK_journal_items_dr_cr CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);
CREATE NONCLUSTERED INDEX IX_journal_items_journal_entry_id ON accounting.journal_items (journal_entry_id);

-- transactions
CREATE TABLE accounting.transactions (
    transaction_id      INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_transactions PRIMARY KEY CLUSTERED,
    type                NVARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
    paid_at             DATETIME2 NOT NULL,
    amount              DECIMAL(19,4) NOT NULL,
    currency_code       NVARCHAR(3) NOT NULL,
    currency_rate       DECIMAL(19,6) NOT NULL,
    account_id          INT NOT NULL,
    source_type         NVARCHAR(20) NULL,
    source_id           INT NULL,
    contact_id          INT NULL,
    category_id         INT NOT NULL,
    description         NVARCHAR(255) NULL,
    payment_method      NVARCHAR(50) NOT NULL,
    reference           NVARCHAR(255) NULL,
    parent_id           INT NULL,
    reconciled          BIT NOT NULL DEFAULT 0,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_transactions_account  FOREIGN KEY (account_id)  REFERENCES accounting.accounts (account_id),
    CONSTRAINT FK_transactions_category FOREIGN KEY (category_id) REFERENCES accounting.categories (category_id),
    CONSTRAINT FK_transactions_contact  FOREIGN KEY (contact_id)  REFERENCES people.contacts (contact_id),
    CONSTRAINT FK_transactions_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code),
    CONSTRAINT FK_transactions_parent   FOREIGN KEY (parent_id)   REFERENCES accounting.transactions (transaction_id)
);

CREATE NONCLUSTERED INDEX IX_transactions_source_type_id
    ON accounting.transactions (source_type, source_id)
    WHERE source_type IS NOT NULL AND source_id IS NOT NULL;

-- invoices
CREATE TABLE sales.invoices (
    invoice_id                  INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_invoices PRIMARY KEY CLUSTERED,
    invoice_number              NVARCHAR(255) NOT NULL,
    order_number                NVARCHAR(255) NULL,
    status                      NVARCHAR(20) NOT NULL CHECK (status IN ('draft','sent','viewed','paid','cancelled')),
    invoiced_at                 DATETIME2 NOT NULL,
    due_at                      DATETIME2 NOT NULL,
    amount                      DECIMAL(19,4) NOT NULL,
    currency_code               NVARCHAR(3) NOT NULL,
    currency_rate               DECIMAL(19,6) NOT NULL,
    category_id                 INT NOT NULL,
    contact_id                  INT NOT NULL,
    contact_snapshot_name       NVARCHAR(255) NOT NULL,
    contact_snapshot_email      NVARCHAR(255) NULL,
    contact_snapshot_phone      NVARCHAR(50) NULL,
    contact_snapshot_address    NVARCHAR(255) NULL,
    notes                       NVARCHAR(MAX) NULL,
    footer                      NVARCHAR(MAX) NULL,
    parent_id                   INT NULL,
    created_at                  DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at                  DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at                  DATETIME2 NULL,
    CONSTRAINT FK_invoices_category FOREIGN KEY (category_id) REFERENCES accounting.categories (category_id),
    CONSTRAINT FK_invoices_contact  FOREIGN KEY (contact_id)  REFERENCES people.contacts (contact_id),
    CONSTRAINT FK_invoices_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code),
    CONSTRAINT FK_invoices_parent   FOREIGN KEY (parent_id)   REFERENCES sales.invoices (invoice_id)
);
CREATE UNIQUE NONCLUSTERED INDEX UQ_invoices_invoice_number_active
    ON sales.invoices (invoice_number)
    WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX IX_invoices_contact_id    ON sales.invoices (contact_id);
CREATE NONCLUSTERED INDEX IX_invoices_category_id   ON sales.invoices (category_id);
CREATE NONCLUSTERED INDEX IX_invoices_currency_code ON sales.invoices (currency_code);

-- invoice items
CREATE TABLE sales.invoice_items (
    invoice_item_id     INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_invoice_items PRIMARY KEY CLUSTERED,
    invoice_id          INT NOT NULL,
    name                NVARCHAR(255) NOT NULL,
    quantity            DECIMAL(19,4) NOT NULL,
    price               DECIMAL(19,4) NOT NULL,
    total               DECIMAL(19,4) NOT NULL,
    discount_rate       DECIMAL(19,4) NOT NULL DEFAULT 0,
    discount_type       NVARCHAR(10) NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
    account_id          INT NOT NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES sales.invoices (invoice_id),
    CONSTRAINT FK_invoice_items_account FOREIGN KEY (account_id) REFERENCES accounting.accounts (account_id)
);
CREATE NONCLUSTERED INDEX IX_invoice_items_invoice_id ON sales.invoice_items (invoice_id);

-- invoice status log
CREATE TABLE sales.invoice_status_log (
    invoice_status_log_id   INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_invoice_status_log PRIMARY KEY CLUSTERED,
    invoice_id              INT NOT NULL,
    status                  NVARCHAR(20) NOT NULL,
    notify                  BIT NOT NULL DEFAULT 0,
    description             NVARCHAR(255) NULL,
    created_at              DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at              DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at              DATETIME2 NULL,
    CONSTRAINT FK_invoice_status_log_invoice FOREIGN KEY (invoice_id) REFERENCES sales.invoices (invoice_id)
);
CREATE NONCLUSTERED INDEX IX_invoice_status_log_invoice_id ON sales.invoice_status_log (invoice_id);

-- invoice settlements
CREATE TABLE sales.invoice_settlements (
    id               INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_invoice_settlements PRIMARY KEY CLUSTERED,
    invoice_id       INT NOT NULL,
    transaction_id   INT NOT NULL,
    amount           DECIMAL(19,4) NOT NULL,
    created_at       DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_settlement_invoice     FOREIGN KEY (invoice_id)     REFERENCES sales.invoices (invoice_id),
    CONSTRAINT FK_settlement_transaction FOREIGN KEY (transaction_id) REFERENCES accounting.transactions (transaction_id)
);

-- bills
CREATE TABLE purchases.bills (
    bill_id                     INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_bills PRIMARY KEY CLUSTERED,
    bill_number                 NVARCHAR(255) NOT NULL,
    order_number                NVARCHAR(255) NULL,
    status                      NVARCHAR(20) NOT NULL CHECK (status IN ('draft','sent','viewed','paid','cancelled')),
    billed_at                   DATETIME2 NOT NULL,
    due_at                      DATETIME2 NOT NULL,
    amount                      DECIMAL(19,4) NOT NULL,
    currency_code               NVARCHAR(3) NOT NULL,
    currency_rate               DECIMAL(19,6) NOT NULL,
    category_id                 INT NOT NULL,
    contact_id                  INT NOT NULL,
    contact_snapshot_name       NVARCHAR(255) NOT NULL,
    contact_snapshot_email      NVARCHAR(255) NULL,
    contact_snapshot_phone      NVARCHAR(50) NULL,
    contact_snapshot_address    NVARCHAR(255) NULL,
    notes                       NVARCHAR(MAX) NULL,
    parent_id                   INT NULL,
    created_at                  DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at                  DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at                  DATETIME2 NULL,
    CONSTRAINT FK_bills_category FOREIGN KEY (category_id) REFERENCES accounting.categories (category_id),
    CONSTRAINT FK_bills_contact  FOREIGN KEY (contact_id)  REFERENCES people.contacts (contact_id),
    CONSTRAINT FK_bills_currency FOREIGN KEY (currency_code) REFERENCES accounting.currencies (currency_code),
    CONSTRAINT FK_bills_parent   FOREIGN KEY (parent_id)   REFERENCES purchases.bills (bill_id)
);
CREATE UNIQUE NONCLUSTERED INDEX UQ_bills_bill_number_active
    ON purchases.bills (bill_number)
    WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX IX_bills_contact_id    ON purchases.bills (contact_id);
CREATE NONCLUSTERED INDEX IX_bills_category_id   ON purchases.bills (category_id);
CREATE NONCLUSTERED INDEX IX_bills_currency_code ON purchases.bills (currency_code);

-- bill items
CREATE TABLE purchases.bill_items (
    bill_item_id        INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_bill_items PRIMARY KEY CLUSTERED,
    bill_id             INT NOT NULL,
    name                NVARCHAR(255) NOT NULL,
    quantity            DECIMAL(19,4) NOT NULL,
    price               DECIMAL(19,4) NOT NULL,
    total               DECIMAL(19,4) NOT NULL,
    discount_rate       DECIMAL(19,4) NOT NULL DEFAULT 0,
    discount_type       NVARCHAR(10) NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
    account_id          INT NOT NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_bill_items_bill    FOREIGN KEY (bill_id)    REFERENCES purchases.bills (bill_id),
    CONSTRAINT FK_bill_items_account FOREIGN KEY (account_id) REFERENCES accounting.accounts (account_id)
);
CREATE NONCLUSTERED INDEX IX_bill_items_bill_id ON purchases.bill_items (bill_id);

-- bill status log
CREATE TABLE purchases.bill_status_log (
    bill_status_log_id  INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_bill_status_log PRIMARY KEY CLUSTERED,
    bill_id             INT NOT NULL,
    status              NVARCHAR(20) NOT NULL,
    notify              BIT NOT NULL DEFAULT 0,
    description         NVARCHAR(255) NULL,
    created_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    updated_at          DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    deleted_at          DATETIME2 NULL,
    CONSTRAINT FK_bill_status_log_bill FOREIGN KEY (bill_id) REFERENCES purchases.bills (bill_id)
);
CREATE NONCLUSTERED INDEX IX_bill_status_log_bill_id ON purchases.bill_status_log (bill_id);

-- settings
CREATE TABLE system.settings (
    setting_id          INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_settings PRIMARY KEY CLUSTERED,
    [key]               NVARCHAR(255) NOT NULL,
    [value]             NVARCHAR(MAX) NULL,
    CONSTRAINT UQ_settings_key UNIQUE ([key])
);

GO