/* ============================================================
   js/UIManager.js
   Handles SPA navigation, page title updates, and tab switching.
   ============================================================ */

class UIManager {

    static PAGE_TITLES = {
        'dashboard':             '📈 Dashboard',
        'journal-entries':       '📖 Journal Entries',
        'journal-entry-form':    '✏️ Create Journal Entry',
        'journal-entry-detail':  '🔍 Journal Entry Detail',
        'transactions':          '💳 Transactions',
        'transaction-form':      '✏️ Create Transaction',
        'transaction-detail':    '🔍 Transaction Detail',
        'invoices':              '🧾 Invoices',
        'invoice-form':          '✏️ Create Invoice',
        'invoice-detail':        '🔍 Invoice Detail',
        'invoice-print':         '🖨️ Invoice Print / PDF',
        'recurring-invoices':    '🔄 Recurring Invoices',
        'contacts':              '👥 Contacts',
        'contact-form':          '✏️ Create Contact',
        'contact-detail':        '🔍 Contact Detail',
        'categories':            '🏷️ Categories',
        'category-form':         '✏️ Create Category',
        'currencies':            '💱 Currencies',
        'currency-form':         '✏️ Create Currency',
        'reports-dashboard':     '📊 Reports Dashboard',
        'financial-statements':  '📑 Financial Statements',
        'transaction-reports':   '📋 Transaction Reports',
        'custom-reports':        '🔧 Custom Report Builder',
    };

    /**
     * Navigate to a page by its element ID.
     */
    static navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const target = document.getElementById(pageId);
        if (target) {
            target.classList.add('active');
        } else {
            console.warn(`UIManager.navigateTo: page "${pageId}" not found`);
        }

        this._updateTitle(pageId);

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });

        const content = document.querySelector('.page-content');
        if (content) content.scrollTop = 0;
    }

    /** Set the header title */
    static _updateTitle(pageId) {
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = this.PAGE_TITLES[pageId] || 'Page';
        }
    }

    /**
     * Switch active tab within a tabbed section.
     */
    static switchTab(tabContentId, btnEl) {
        const tabsParent = btnEl.closest('.card') || document.body;
        tabsParent.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tabsParent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        const target = document.getElementById(tabContentId);
        if (target) target.classList.add('active');
        btnEl.classList.add('active');
    }

    static showLoading() {
        const el = document.getElementById('loadingOverlay');
        if (el) el.style.display = 'flex';
    }

    static hideLoading() {
        const el = document.getElementById('loadingOverlay');
        if (el) el.style.display = 'none';
    }
}
