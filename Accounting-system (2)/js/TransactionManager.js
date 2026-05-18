/* ============================================================
   js/TransactionManager.js
   Manages the Transactions module.
   Pages: transactions, transaction-detail, transaction-form
   ============================================================ */

class TransactionManager {

    static _currentId = null;

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        const dateEl = document.getElementById('txnDate');
        if (dateEl) dateEl.valueAsDate = new Date();

        UIManager.navigateTo('transaction-form');
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveTransaction(event) {
        event.preventDefault();

        const date        = document.getElementById('txnDate')?.value;
        const type        = document.getElementById('txnType')?.value;
        const fromAccount = document.getElementById('txnFromAccount')?.value?.trim();
        const toAccount   = document.getElementById('txnToAccount')?.value?.trim();
        const amount      = parseFloat(document.getElementById('txnAmount')?.value);
        const currency    = document.getElementById('txnCurrency')?.value;
        const description = document.getElementById('txnDescription')?.value?.trim();

        if (!Validator.validateRequired(fromAccount)) { Validator.showError('From Account is required.'); return; }
        if (!Validator.validateRequired(toAccount))   { Validator.showError('To Account is required.');   return; }
        if (!Validator.validatePositive(amount))       { Validator.showError('Amount must be greater than 0.'); return; }

        const form    = document.getElementById('transactionForm');
        const editId  = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id      = editId || Date.now();

        const transaction = {
            id, date, type, fromAccount, toAccount,
            amount, currency, description,
            status: 'completed',
            createdAt: editId ? StorageManager.load('txn_' + editId)?.createdAt || new Date().toISOString()
                              : new Date().toISOString()
        };

        StorageManager.save('txn_' + id, transaction);
        Validator.showSuccess(editId ? 'Transaction updated!' : 'Transaction saved successfully!');
        UIManager.navigateTo('transactions');
        this.loadTransactions();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadTransactions() {
        const txns = StorageManager.getAll('txn_').sort((a, b) => new Date(b.date) - new Date(a.date));
        this._renderTable(txns);
    }

    static _renderTable(txns) {
        const tbody = document.getElementById('transactionTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (txns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transactions yet.</td></tr>';
            return;
        }

        txns.forEach(txn => {
            const typeBadges = {
                transfer:   'badge-primary',
                payment:    'badge-danger',
                receipt:    'badge-success',
                deposit:    'badge-info',
                withdrawal: 'badge-warning'
            };

            tbody.innerHTML += `
                <tr>
                    <td>${txn.date}</td>
                    <td><strong>TXN-${txn.id}</strong></td>
                    <td><span class="badge ${typeBadges[txn.type] || 'badge-primary'}">${txn.type}</span></td>
                    <td>${txn.description}</td>
                    <td class="text-right">$${txn.amount.toFixed(2)}</td>
                    <td><span class="badge badge-success">${txn.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-secondary btn-sm" onclick="TransactionManager.showDetail(${txn.id})">View</button>
                            <button class="btn btn-warning btn-sm"   onclick="TransactionManager.editTransaction(${txn.id})">Edit</button>
                            <button class="btn btn-danger btn-sm"    onclick="TransactionManager.deleteTransaction(${txn.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── FILTER ───────────────────────────────────────────── */

    static filterTransactions() {
        const search = document.getElementById('transactionSearch')?.value?.toLowerCase() || '';
        const type   = document.getElementById('transactionType')?.value || '';

        const txns = StorageManager.getAll('txn_').filter(t =>
            (t.description.toLowerCase().includes(search) ||
             t.fromAccount.toLowerCase().includes(search) ||
             ('TXN-' + t.id).toLowerCase().includes(search)) &&
            (type === '' || t.type === type)
        );

        this._renderTable(txns);
    }

    /* ── DETAIL ───────────────────────────────────────────── */

    static showDetail(id) {
        const txn = StorageManager.load('txn_' + id);
        if (!txn) { Validator.showError('Transaction not found.'); return; }

        this._currentId = id;

        document.getElementById('detailTxnNumber').textContent      = 'TXN-' + txn.id;
        document.getElementById('detailTxnDate').textContent        = txn.date;
        document.getElementById('detailTxnType').textContent        = txn.type;
        document.getElementById('detailTxnAmount').textContent      = '$' + txn.amount.toFixed(2);
        document.getElementById('detailTxnStatus').textContent      = txn.status;
        document.getElementById('detailTxnFromAccount').textContent = txn.fromAccount;
        document.getElementById('detailTxnToAccount').textContent   = txn.toAccount;
        document.getElementById('detailTxnDescription').textContent = txn.description;

        UIManager.navigateTo('transaction-detail');
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editTransaction(id) {
        const txn = id ? StorageManager.load('txn_' + id) : StorageManager.load('txn_' + this._currentId);
        if (!txn) { Validator.showError('Transaction not found.'); return; }

        const form = document.getElementById('transactionForm');
        if (form) form.dataset.editId = txn.id;

        document.getElementById('txnDate').value         = txn.date;
        document.getElementById('txnType').value         = txn.type;
        document.getElementById('txnFromAccount').value  = txn.fromAccount;
        document.getElementById('txnToAccount').value    = txn.toAccount;
        document.getElementById('txnAmount').value       = txn.amount;
        document.getElementById('txnCurrency').value     = txn.currency;
        document.getElementById('txnDescription').value  = txn.description;

        UIManager.navigateTo('transaction-form');
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteTransaction(id) {
        Validator.confirm('Delete this transaction?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('txn_' + id);
            Validator.showSuccess('Transaction deleted.');
            this.loadTransactions();
        });
    }
}
