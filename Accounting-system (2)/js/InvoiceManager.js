/* ============================================================
   js/InvoiceManager.js
   Manages the Invoices / Accounts Receivable module.
   Pages: invoices, invoice-detail, invoice-form, invoice-print
   ============================================================ */

class InvoiceManager {

    static _currentId = null;

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('invoiceForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }

        const seq   = StorageManager.nextId('inv_seq');
        const year  = new Date().getFullYear();
        const invNo = `INV-${year}-${String(seq).padStart(6, '0')}`;

        const numEl  = document.getElementById('invNumber');
        const dateEl = document.getElementById('invDate');
        if (numEl)  numEl.value = invNo;
        if (dateEl) dateEl.valueAsDate = new Date();

        const tbody = document.getElementById('invLineItems');
        if (tbody) {
            tbody.innerHTML = '';
            this._appendLine(tbody);
        }

        this.updateTotals();
        UIManager.navigateTo('invoice-form');
    }

    static _appendLine(tbody, line = {}) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text"   value="${line.desc  || ''}" placeholder="Product / Service" class="form-control inv-desc"></td>
            <td><input type="number" value="${line.qty   || ''}" placeholder="1"    min="0" step="1"    class="form-control inv-qty"    oninput="InvoiceManager.updateTotals()"></td>
            <td><input type="number" value="${line.price || ''}" placeholder="0.00" min="0" step="0.01" class="form-control inv-price"  oninput="InvoiceManager.updateTotals()"></td>
            <td><input type="number" value="${line.amount != null ? line.amount.toFixed(2) : ''}" placeholder="0.00" class="form-control inv-amount" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="InvoiceManager.removeLine(this)">✕</button></td>
        `;
        tbody.appendChild(row);
    }

    static addLine() {
        const tbody = document.getElementById('invLineItems');
        if (tbody) this._appendLine(tbody);
    }

    static removeLine(btn) {
        btn.closest('tr').remove();
        this.updateTotals();
    }

    static updateTotals() {
        let subtotal = 0;

        document.querySelectorAll('#invLineItems tr').forEach(row => {
            const qty    = parseFloat(row.querySelector('.inv-qty')?.value)   || 0;
            const price  = parseFloat(row.querySelector('.inv-price')?.value) || 0;
            const amount = qty * price;
            const amtEl  = row.querySelector('.inv-amount');
            if (amtEl) amtEl.value = amount.toFixed(2);
            subtotal += amount;
        });

        const taxRate   = parseFloat(document.getElementById('invTaxRate')?.value) || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        const total     = subtotal + taxAmount;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('invSubtotal',  '$' + subtotal.toFixed(2));
        set('invTaxAmount', '$' + taxAmount.toFixed(2));
        set('invTotal',     '$' + total.toFixed(2));
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveInvoice(event) {
        event.preventDefault();

        const number   = document.getElementById('invNumber')?.value;
        const date     = document.getElementById('invDate')?.value;
        const dueDate  = document.getElementById('invDueDate')?.value;
        const customer = document.getElementById('invCustomer')?.value?.trim();
        const currency = document.getElementById('invCurrency')?.value;
        const notes    = document.getElementById('invNotes')?.value || '';

        if (!Validator.validateRequired(customer)) { Validator.showError('Customer name is required.'); return; }
        if (!Validator.validateRequired(dueDate))  { Validator.showError('Due date is required.'); return; }

        const lines = [];
        document.querySelectorAll('#invLineItems tr').forEach(row => {
            const desc  = row.querySelector('.inv-desc')?.value?.trim();
            const qty   = parseFloat(row.querySelector('.inv-qty')?.value)   || 0;
            const price = parseFloat(row.querySelector('.inv-price')?.value) || 0;
            if (desc && qty > 0 && price > 0) {
                lines.push({ desc, qty, price, amount: qty * price });
            }
        });

        if (lines.length === 0) { Validator.showError('Add at least one line item.'); return; }

        const taxRate  = parseFloat(document.getElementById('invTaxRate')?.value) || 0;
        const subtotal = lines.reduce((s, l) => s + l.amount, 0);
        const tax      = (subtotal * taxRate) / 100;
        const total    = subtotal + tax;

        const form   = document.getElementById('invoiceForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        const invoice = {
            id, number, date, dueDate, customer, currency, notes,
            lines, subtotal, tax, total,
            status:     editId ? StorageManager.load('inv_' + editId)?.status || 'draft' : 'draft',
            amountPaid: editId ? StorageManager.load('inv_' + editId)?.amountPaid || 0 : 0,
            createdAt:  editId ? StorageManager.load('inv_' + editId)?.createdAt  || new Date().toISOString()
                               : new Date().toISOString()
        };

        StorageManager.save('inv_' + id, invoice);
        Validator.showSuccess(editId ? 'Invoice updated!' : 'Invoice saved successfully!');
        UIManager.navigateTo('invoices');
        this.loadInvoices();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadInvoices() {
        const invoices = StorageManager.getAll('inv_').sort((a, b) => b.id - a.id);
        this._renderTable(invoices);
    }

    static _renderTable(invoices) {
        const tbody = document.getElementById('invoiceTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No invoices yet. Click "+ New Invoice" to create one.</td></tr>';
            return;
        }

        invoices.forEach(inv => {
            const statusCls = { paid: 'badge-success', draft: 'badge-warning', sent: 'badge-info', overdue: 'badge-danger' };
            const cls = statusCls[inv.status] || 'badge-warning';

            tbody.innerHTML += `
                <tr>
                    <td><strong>${inv.number}</strong></td>
                    <td>${inv.customer}</td>
                    <td>${inv.date}</td>
                    <td>${inv.dueDate}</td>
                    <td class="text-right">$${inv.total.toFixed(2)}</td>
                    <td class="text-right">$${(inv.amountPaid || 0).toFixed(2)}</td>
                    <td><span class="badge ${cls}">${inv.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-secondary btn-sm" onclick="InvoiceManager.showDetail(${inv.id})">View</button>
                            <button class="btn btn-warning btn-sm"   onclick="InvoiceManager.editInvoice(${inv.id})">Edit</button>
                            <button class="btn btn-info btn-sm"      onclick="InvoiceManager.viewPrint(${inv.id})">🖨️ Print</button>
                            <button class="btn btn-danger btn-sm"    onclick="InvoiceManager.deleteInvoice(${inv.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── FILTER ───────────────────────────────────────────── */

    static filterInvoices() {
        const search = document.getElementById('invoiceSearch')?.value?.toLowerCase() || '';
        const status = document.getElementById('invoiceStatus')?.value || '';

        const invoices = StorageManager.getAll('inv_').filter(inv =>
            (inv.number.toLowerCase().includes(search) || inv.customer.toLowerCase().includes(search)) &&
            (status === '' || inv.status === status)
        );

        this._renderTable(invoices);
    }

    /* ── DETAIL ───────────────────────────────────────────── */

    static showDetail(id) {
        const inv = StorageManager.load('inv_' + id);
        if (!inv) { Validator.showError('Invoice not found.'); return; }

        this._currentId = id;

        document.getElementById('detailInvoiceNumber').textContent   = inv.number;
        document.getElementById('detailInvoiceDate').textContent     = inv.date;
        document.getElementById('detailInvoiceCustomer').textContent = inv.customer;
        document.getElementById('detailInvoiceDueDate').textContent  = inv.dueDate;

        const statusEl = document.getElementById('detailInvoiceStatus');
        const statusCls = { paid: 'badge-success', draft: 'badge-warning', sent: 'badge-info', overdue: 'badge-danger' };
        statusEl.textContent = inv.status;
        statusEl.className   = 'badge ' + (statusCls[inv.status] || 'badge-warning');

        const linesBody = document.getElementById('detailInvoiceLines');
        linesBody.innerHTML = '';
        inv.lines.forEach(line => {
            linesBody.innerHTML += `
                <tr>
                    <td>${line.desc}</td>
                    <td class="text-right">${line.qty}</td>
                    <td class="text-right">$${line.price.toFixed(2)}</td>
                    <td class="text-right">$${line.amount.toFixed(2)}</td>
                </tr>`;
        });

        document.getElementById('detailInvoiceSubtotal').textContent  = '$' + inv.subtotal.toFixed(2);
        document.getElementById('detailInvoiceTax').textContent       = '$' + inv.tax.toFixed(2);
        document.getElementById('detailInvoiceTotal').textContent     = '$' + inv.total.toFixed(2);
        document.getElementById('detailInvoicePaid').textContent      = '$' + (inv.amountPaid || 0).toFixed(2);
        document.getElementById('detailInvoiceBalance').textContent   = '$' + (inv.total - (inv.amountPaid || 0)).toFixed(2);

        UIManager.navigateTo('invoice-detail');
    }

    /* ── PRINT PAGE ───────────────────────────────────────── */

    static viewPrint(id) {
        const inv = id ? StorageManager.load('inv_' + id)
                       : StorageManager.load('inv_' + this._currentId);
        if (!inv) { Validator.showError('Invoice not found.'); return; }

        this._currentId = inv.id;

        const set = (elId, val) => {
            const el = document.getElementById(elId);
            if (el) el.textContent = val;
        };

        set('printInvNumber',    inv.number);
        set('printCustomerName', inv.customer);
        set('printInvDate',      inv.date);
        set('printInvDueDate',   inv.dueDate);
        set('printInvStatus',    inv.status.toUpperCase());

        const tbody = document.getElementById('printInvoiceLines');
        if (tbody) {
            tbody.innerHTML = '';
            inv.lines.forEach((line, i) => {
                tbody.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${line.desc}</td>
                        <td class="text-right">${line.qty}</td>
                        <td class="text-right">$${line.price.toFixed(2)}</td>
                        <td class="text-right">$${line.amount.toFixed(2)}</td>
                    </tr>`;
            });
        }

        set('printSubtotal',   '$' + inv.subtotal.toFixed(2));
        set('printTax',        '$' + inv.tax.toFixed(2));
        set('printTotal',      '$' + inv.total.toFixed(2));
        set('printAmountPaid', '$' + (inv.amountPaid || 0).toFixed(2));
        set('printBalanceDue', '$' + (inv.total - (inv.amountPaid || 0)).toFixed(2));

        const notesEl = document.getElementById('printInvNotes');
        if (notesEl) notesEl.textContent = inv.notes || '';

        UIManager.navigateTo('invoice-print');
    }

    static printInvoice() {
        window.print();
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editInvoice(id) {
        const inv = StorageManager.load('inv_' + id);
        if (!inv) { Validator.showError('Invoice not found.'); return; }

        const form = document.getElementById('invoiceForm');
        if (form) form.dataset.editId = inv.id;

        document.getElementById('invNumber').value   = inv.number;
        document.getElementById('invDate').value     = inv.date;
        document.getElementById('invDueDate').value  = inv.dueDate;
        document.getElementById('invCustomer').value = inv.customer;
        document.getElementById('invCurrency').value = inv.currency;
        document.getElementById('invNotes').value    = inv.notes || '';

        const tbody = document.getElementById('invLineItems');
        tbody.innerHTML = '';
        inv.lines.forEach(line => this._appendLine(tbody, line));

        this.updateTotals();
        UIManager.navigateTo('invoice-form');
    }

    /* ── RECORD PAYMENT ───────────────────────────────────── */

    static recordPayment() {
        const inv = StorageManager.load('inv_' + this._currentId);
        if (!inv) { Validator.showError('No invoice selected.'); return; }

        const balance = inv.total - (inv.amountPaid || 0);
        const amountStr = prompt(`Record payment for ${inv.number}\nCurrent balance: $${balance.toFixed(2)}\n\nEnter payment amount:`);
        if (amountStr === null) return;

        const amount = parseFloat(amountStr);
        if (!Validator.validatePositive(amount)) { Validator.showError('Invalid amount.'); return; }

        inv.amountPaid = (inv.amountPaid || 0) + amount;
        if (inv.amountPaid >= inv.total) { inv.amountPaid = inv.total; inv.status = 'paid'; }
        else inv.status = 'sent';

        StorageManager.save('inv_' + inv.id, inv);
        Validator.showSuccess(`Payment of $${amount.toFixed(2)} recorded!`);
        this.showDetail(inv.id);
        this.loadInvoices();
    }

    /* ── MARK AS SENT ─────────────────────────────────────── */

    static markSent() {
        const inv = StorageManager.load('inv_' + this._currentId);
        if (!inv) { Validator.showError('No invoice selected.'); return; }
        if (inv.status !== 'draft') { Validator.showWarning('Invoice is already sent or paid.'); return; }

        inv.status = 'sent';
        StorageManager.save('inv_' + inv.id, inv);
        Validator.showSuccess('Invoice marked as sent!');
        this.showDetail(inv.id);
        this.loadInvoices();
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteInvoice(id) {
        Validator.confirm('Delete this invoice?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('inv_' + id);
            Validator.showSuccess('Invoice deleted.');
            this.loadInvoices();
        });
    }
}
