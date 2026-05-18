/* ============================================================
   js/app.js
   Application bootstrap — runs on DOMContentLoaded.
   Wires up global helpers used by inline HTML onclick handlers.
   ============================================================ */

/* ── Global shims for onclick="navigateTo(...)" in HTML ────── */
function navigateTo(pageId) { UIManager.navigateTo(pageId); }
function switchTab(tabId, btn) { UIManager.switchTab(tabId, btn); }

/* ── DOMContentLoaded ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* 1. Restore dark mode preference */
    DarkModeManager.init();

    /* 2. Seed default currencies if first run */
    CurrencyManager.seedDefaults();

    /* 3. Navigate to dashboard */
    UIManager.navigateTo('dashboard');

    /* 4. Load all list data so tables are ready */
    JournalEntryManager.loadEntries();
    TransactionManager.loadTransactions();
    InvoiceManager.loadInvoices();
    RecurringInvoiceManager.loadRecurring();
    ContactManager.loadContacts();
    CategoryManager.loadCategories();
    CurrencyManager.loadCurrencies();
    ReportManager.loadDashboard();
    ReportManager.loadSavedReports();

    /* 5. Wire sidebar nav links */
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', () => {
            const page = link.getAttribute('data-page');
            UIManager.navigateTo(page);

            // Reload list data when entering a list page
            const reloaders = {
                'journal-entries':   () => JournalEntryManager.loadEntries(),
                'transactions':      () => TransactionManager.loadTransactions(),
                'invoices':          () => InvoiceManager.loadInvoices(),
                'recurring-invoices':() => RecurringInvoiceManager.loadRecurring(),
                'contacts':          () => ContactManager.loadContacts(),
                'categories':        () => CategoryManager.loadCategories(),
                'currencies':        () => CurrencyManager.loadCurrencies(),
                'reports-dashboard': () => ReportManager.loadDashboard(),
                'custom-reports':    () => ReportManager.loadSavedReports(),
            };
            if (reloaders[page]) reloaders[page]();
        });
    });

    /* 6. Wire live-search / filter inputs */
    document.getElementById('journalSearch')?.addEventListener('input',    () => JournalEntryManager.filterEntries());
    document.getElementById('journalStatus')?.addEventListener('change',   () => JournalEntryManager.filterEntries());
    document.getElementById('transactionSearch')?.addEventListener('input', () => TransactionManager.filterTransactions());
    document.getElementById('transactionType')?.addEventListener('change',  () => TransactionManager.filterTransactions());
    document.getElementById('invoiceSearch')?.addEventListener('input',    () => InvoiceManager.filterInvoices());
    document.getElementById('invoiceStatus')?.addEventListener('change',   () => InvoiceManager.filterInvoices());
    document.getElementById('contactSearch')?.addEventListener('input',    () => ContactManager.filterContacts());
    document.getElementById('contactType')?.addEventListener('change',     () => ContactManager.filterContacts());

    /* 7. Wire form submissions */
    document.getElementById('journalEntryForm')?.addEventListener('submit',   e => JournalEntryManager.saveEntry(e));
    document.getElementById('transactionForm')?.addEventListener('submit',    e => TransactionManager.saveTransaction(e));
    document.getElementById('invoiceForm')?.addEventListener('submit',        e => InvoiceManager.saveInvoice(e));
    document.getElementById('recurringForm')?.addEventListener('submit',      e => RecurringInvoiceManager.saveRecurring(e));
    document.getElementById('contactForm')?.addEventListener('submit',        e => ContactManager.saveContact(e));
    document.getElementById('categoryForm')?.addEventListener('submit',       e => CategoryManager.saveCategory(e));
    document.getElementById('currencyForm')?.addEventListener('submit',       e => CurrencyManager.saveCurrency(e));

    /* 8. Wire report generation buttons */
    document.getElementById('btnGenerateTB')?.addEventListener('click',   () => ReportManager.generateTrialBalance());
    document.getElementById('btnGenerateIS')?.addEventListener('click',   () => ReportManager.generateIncomeStatement());
    document.getElementById('btnGenerateBS')?.addEventListener('click',   () => ReportManager.generateBalanceSheet());
    document.getElementById('btnGenerateTR')?.addEventListener('click',   () => ReportManager.generateTransactionReport());
    document.getElementById('btnGenerateCR')?.addEventListener('click',   () => ReportManager.generateCustomReport());

    /* 9. Wire recurring modal close on backdrop click */
    document.getElementById('recurringModal')?.addEventListener('click', e => {
        if (e.target.id === 'recurringModal') RecurringInvoiceManager.closeModal();
    });
});
