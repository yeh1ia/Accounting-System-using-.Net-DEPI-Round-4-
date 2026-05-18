/* ============================================================
   js/JournalEntryManager.js
   Manages the General Ledger Journal Entry module.
   Pages covered: journal-entries, journal-entry-detail, journal-entry-form
   ============================================================ */

class JournalEntryManager {

    static _currentId = null;

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('journalEntryForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }

        const seq    = StorageManager.nextId('je_seq');
        const year   = new Date().getFullYear();
        const refNo  = `JE-${year}-${String(seq).padStart(6, '0')}`;

        const refEl  = document.getElementById('jeRefNumber');
        const dateEl = document.getElementById('jeEntryDate');
        if (refEl)  refEl.value = refNo;
        if (dateEl) dateEl.valueAsDate = new Date();

        const tbody = document.getElementById('jeLineItems');
        if (tbody) {
            tbody.innerHTML = '';
            this._appendLine(tbody);
        }

        this.updateTotals();
        UIManager.navigateTo('journal-entry-form');
    }

    static _appendLine(tbody, line = {}) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${line.account || ''}" placeholder="Account" class="form-control je-account"></td>
            <td><input type="text" value="${line.desc    || ''}" placeholder="Description" class="form-control je-desc"></td>
            <td><input type="number" value="${line.debit  || ''}" placeholder="0.00" step="0.01" min="0" class="form-control je-debit"  oninput="JournalEntryManager.updateTotals()"></td>
            <td><input type="number" value="${line.credit || ''}" placeholder="0.00" step="0.01" min="0" class="form-control je-credit" oninput="JournalEntryManager.updateTotals()"></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="JournalEntryManager.removeLine(this)">✕</button></td>
        `;
        tbody.appendChild(row);
    }

    static addLine() {
        const tbody = document.getElementById('jeLineItems');
        if (tbody) this._appendLine(tbody);
    }

    static removeLine(btn) {
        btn.closest('tr').remove();
        this.updateTotals();
    }

    static updateTotals() {
        let totalDebits = 0, totalCredits = 0;

        document.querySelectorAll('#jeLineItems .je-debit').forEach(inp => {
            totalDebits  += parseFloat(inp.value) || 0;
        });
        document.querySelectorAll('#jeLineItems .je-credit').forEach(inp => {
            totalCredits += parseFloat(inp.value) || 0;
        });

        const debEl  = document.getElementById('jeTotalDebits');
        const creEl  = document.getElementById('jeTotalCredits');
        const balEl  = document.getElementById('jeBalanceStatus');

        if (debEl) debEl.textContent = '$' + totalDebits.toFixed(2);
        if (creEl) creEl.textContent = '$' + totalCredits.toFixed(2);

        if (balEl) {
            const balanced = Math.abs(totalDebits - totalCredits) < 0.005;
            balEl.textContent = balanced ? '✓ BALANCED' : '✗ NOT BALANCED';
            balEl.className   = 'balance-status ' + (balanced ? 'balance-success' : 'balance-error');
        }
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveEntry(event) {
        event.preventDefault();

        const refNumber   = document.getElementById('jeRefNumber')?.value?.trim();
        const date        = document.getElementById('jeEntryDate')?.value;
        const description = document.getElementById('jeDescription')?.value?.trim();

        const lines = [];
        document.querySelectorAll('#jeLineItems tr').forEach(row => {
            const account = row.querySelector('.je-account')?.value?.trim();
            const desc    = row.querySelector('.je-desc')?.value?.trim();
            const debit   = parseFloat(row.querySelector('.je-debit')?.value)  || 0;
            const credit  = parseFloat(row.querySelector('.je-credit')?.value) || 0;

            if (account && (debit > 0 || credit > 0)) {
                lines.push({ account, desc, debit, credit });
            }
        });

        if (!Validator.validateRequired(description)) {
            Validator.showError('Description is required.');
            return;
        }
        if (lines.length < 2) {
            Validator.showError('A journal entry needs at least 2 line items.');
            return;
        }

        const totalDebits  = lines.reduce((s, l) => s + l.debit, 0);
        const totalCredits = lines.reduce((s, l) => s + l.credit, 0);

        if (Math.abs(totalDebits - totalCredits) >= 0.005) {
            Validator.showError('Entry is not balanced. Debits must equal Credits.');
            return;
        }

        const form   = document.getElementById('journalEntryForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        const entry = {
            id,
            refNumber,
            date,
            description,
            status: editId ? (StorageManager.load('je_' + editId)?.status || 'draft') : 'draft',
            lines,
            totalDebits,
            totalCredits,
            createdAt: editId ? (StorageManager.load('je_' + editId)?.createdAt || new Date().toISOString())
                              : new Date().toISOString()
        };

        StorageManager.save('je_' + entry.id, entry);
        Validator.showSuccess(editId ? 'Journal entry updated!' : 'Journal entry saved successfully!');
        UIManager.navigateTo('journal-entries');
        this.loadEntries();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadEntries() {
        const entries = StorageManager.getAll('je_').sort((a, b) => b.id - a.id);
        this._renderTable(entries);
    }

    static _renderTable(entries) {
        const tbody = document.getElementById('journalTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No journal entries yet. Click "+ New Entry" to create one.</td></tr>';
            return;
        }

        entries.forEach(entry => {
            const debits  = entry.lines?.reduce((s, l) => s + l.debit,  0) ?? 0;
            const credits = entry.lines?.reduce((s, l) => s + l.credit, 0) ?? 0;
            const badgeCls = entry.status === 'posted' ? 'badge-success' : 'badge-warning';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${entry.refNumber}</strong></td>
                <td>${entry.date}</td>
                <td>${entry.description}</td>
                <td class="text-right">$${debits.toFixed(2)}</td>
                <td class="text-right">$${credits.toFixed(2)}</td>
                <td><span class="badge ${badgeCls}">${entry.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-secondary btn-sm" onclick="JournalEntryManager.showDetail(${entry.id})">View</button>
                        <button class="btn btn-warning btn-sm"   onclick="JournalEntryManager.editEntry(${entry.id})">Edit</button>
                        <button class="btn btn-danger btn-sm"    onclick="JournalEntryManager.deleteEntry(${entry.id})">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /* ── FILTER ───────────────────────────────────────────── */

    static filterEntries() {
        const search = document.getElementById('journalSearch')?.value?.toLowerCase() || '';
        const status = document.getElementById('journalStatus')?.value || '';

        const entries = StorageManager.getAll('je_').filter(e =>
            (e.description.toLowerCase().includes(search) || e.refNumber.toLowerCase().includes(search)) &&
            (status === '' || e.status === status)
        );

        this._renderTable(entries);
    }

    /* ── DETAIL ───────────────────────────────────────────── */

    static showDetail(id) {
        const entry = StorageManager.load('je_' + id);
        if (!entry) { Validator.showError('Entry not found.'); return; }

        this._currentId = id;

        document.getElementById('detailJERefNo').textContent  = entry.refNumber;
        document.getElementById('detailJEDate').textContent   = entry.date;
        document.getElementById('detailJEDesc').textContent   = entry.description;

        const statusEl = document.getElementById('detailJEStatus');
        statusEl.textContent = entry.status;
        statusEl.className   = 'badge ' + (entry.status === 'posted' ? 'badge-success' : 'badge-warning');

        let totalD = 0, totalC = 0;
        const linesBody = document.getElementById('detailJELines');
        linesBody.innerHTML = '';

        entry.lines.forEach(line => {
            totalD += line.debit;
            totalC += line.credit;
            linesBody.innerHTML += `
                <tr>
                    <td>${line.account}${line.desc ? ' — ' + line.desc : ''}</td>
                    <td class="text-right">$${line.debit.toFixed(2)}</td>
                    <td class="text-right">$${line.credit.toFixed(2)}</td>
                </tr>`;
        });

        document.getElementById('detailJETotalDebits').textContent  = '$' + totalD.toFixed(2);
        document.getElementById('detailJETotalCredits').textContent = '$' + totalC.toFixed(2);

        UIManager.navigateTo('journal-entry-detail');
    }

    static postCurrentEntry() {
        if (!this._currentId) return;
        const entry = StorageManager.load('je_' + this._currentId);
        if (!entry) return;

        entry.status = 'posted';
        StorageManager.save('je_' + entry.id, entry);
        Validator.showSuccess('Entry posted successfully!');
        this.showDetail(entry.id);
        this.loadEntries();
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editEntry(id) {
        const entry = StorageManager.load('je_' + id);
        if (!entry) { Validator.showError('Entry not found.'); return; }

        this._currentId = id;

        document.getElementById('jeRefNumber').value   = entry.refNumber;
        document.getElementById('jeEntryDate').value   = entry.date;
        document.getElementById('jeDescription').value = entry.description;

        document.getElementById('journalEntryForm').dataset.editId = id;

        const tbody = document.getElementById('jeLineItems');
        tbody.innerHTML = '';
        entry.lines.forEach(line => this._appendLine(tbody, line));

        this.updateTotals();
        UIManager.navigateTo('journal-entry-form');
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteEntry(id) {
        Validator.confirm('Delete this journal entry? This cannot be undone.').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('je_' + id);
            Validator.showSuccess('Journal entry deleted.');
            this.loadEntries();
        });
    }
}
