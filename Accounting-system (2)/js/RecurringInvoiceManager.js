/* ============================================================
   js/RecurringInvoiceManager.js
   Manages Recurring Invoice templates.
   Page: recurring-invoices
   ============================================================ */

class RecurringInvoiceManager {

    static _currentId = null;

    /* ── MODAL OPEN ───────────────────────────────────────── */

    static openForm(id = null) {
        const modal = document.getElementById('recurringModal');
        if (!modal) return;

        document.getElementById('recurringForm')?.reset();

        if (id) {
            const rec = StorageManager.load('rec_' + id);
            if (!rec) return;
            this._currentId = id;

            document.getElementById('recName').value      = rec.name;
            document.getElementById('recCustomer').value  = rec.customer;
            document.getElementById('recFrequency').value = rec.frequency;
            document.getElementById('recAmount').value    = rec.amount;
            document.getElementById('recCurrency').value  = rec.currency;
            document.getElementById('recStartDate').value = rec.startDate;
            document.getElementById('recDescription').value = rec.description || '';

            document.getElementById('recurringModalTitle').textContent = 'Edit Recurring Invoice';
            document.getElementById('recurringForm').dataset.editId = id;
        } else {
            this._currentId = null;
            const dateEl = document.getElementById('recStartDate');
            if (dateEl) dateEl.valueAsDate = new Date();
            document.getElementById('recurringModalTitle').textContent = 'New Recurring Invoice Template';
            delete document.getElementById('recurringForm').dataset.editId;
        }

        modal.classList.add('active');
    }

    static closeModal() {
        const modal = document.getElementById('recurringModal');
        if (modal) modal.classList.remove('active');
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveRecurring(event) {
        event.preventDefault();

        const name        = document.getElementById('recName')?.value?.trim();
        const customer    = document.getElementById('recCustomer')?.value?.trim();
        const frequency   = document.getElementById('recFrequency')?.value;
        const amount      = parseFloat(document.getElementById('recAmount')?.value);
        const currency    = document.getElementById('recCurrency')?.value;
        const startDate   = document.getElementById('recStartDate')?.value;
        const description = document.getElementById('recDescription')?.value?.trim();

        if (!Validator.validateRequired(name))     { Validator.showError('Template name is required.'); return; }
        if (!Validator.validateRequired(customer)) { Validator.showError('Customer is required.');      return; }
        if (!Validator.validatePositive(amount))   { Validator.showError('Amount must be greater than 0.'); return; }

        const form   = document.getElementById('recurringForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        // Calculate next invoice date from startDate + frequency
        const nextDate = this._calcNextDate(startDate, frequency);

        const rec = {
            id, name, customer, frequency, amount, currency,
            startDate, nextDate, description,
            status: editId ? StorageManager.load('rec_' + editId)?.status || 'active' : 'active',
            createdAt: editId ? StorageManager.load('rec_' + editId)?.createdAt || new Date().toISOString()
                              : new Date().toISOString()
        };

        StorageManager.save('rec_' + id, rec);
        Validator.showSuccess(editId ? 'Template updated!' : 'Recurring template created!');
        this.closeModal();
        this.loadRecurring();
    }

    static _calcNextDate(startDate, frequency) {
        if (!startDate) return '';
        const d = new Date(startDate);
        switch (frequency) {
            case 'weekly':    d.setDate(d.getDate() + 7);    break;
            case 'monthly':   d.setMonth(d.getMonth() + 1);  break;
            case 'quarterly': d.setMonth(d.getMonth() + 3);  break;
            case 'yearly':    d.setFullYear(d.getFullYear() + 1); break;
        }
        return d.toISOString().split('T')[0];
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadRecurring() {
        const recs = StorageManager.getAll('rec_').sort((a, b) => b.id - a.id);
        this._renderTable(recs);
    }

    static _renderTable(recs) {
        const tbody = document.getElementById('recurringTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (recs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No recurring templates yet. Click "+ New Template" to create one.</td></tr>';
            return;
        }

        recs.forEach(rec => {
            const statusCls = rec.status === 'active' ? 'badge-success' : 'badge-warning';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${rec.name}</strong></td>
                    <td>${rec.customer}</td>
                    <td>${rec.frequency.charAt(0).toUpperCase() + rec.frequency.slice(1)}</td>
                    <td class="text-right">$${parseFloat(rec.amount).toFixed(2)}</td>
                    <td>${rec.nextDate || '—'}</td>
                    <td><span class="badge ${statusCls}">${rec.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-warning btn-sm" onclick="RecurringInvoiceManager.openForm(${rec.id})">Edit</button>
                            <button class="btn btn-${rec.status === 'active' ? 'secondary' : 'success'} btn-sm"
                                    onclick="RecurringInvoiceManager.toggleStatus(${rec.id})">
                                ${rec.status === 'active' ? 'Pause' : 'Resume'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="RecurringInvoiceManager.deleteTemplate(${rec.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── TOGGLE STATUS ────────────────────────────────────── */

    static toggleStatus(id) {
        const rec = StorageManager.load('rec_' + id);
        if (!rec) return;
        rec.status = rec.status === 'active' ? 'paused' : 'active';
        StorageManager.save('rec_' + id, rec);
        Validator.showSuccess(`Template ${rec.status === 'active' ? 'resumed' : 'paused'}.`);
        this.loadRecurring();
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteTemplate(id) {
        Validator.confirm('Delete this recurring template?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('rec_' + id);
            Validator.showSuccess('Template deleted.');
            this.loadRecurring();
        });
    }
}
