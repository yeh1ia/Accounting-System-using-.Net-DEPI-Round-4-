/* ============================================================
   js/CurrencyManager.js
   Manages the Currencies module.
   Pages: currencies, currency-form
   ============================================================ */

class CurrencyManager {

    static _currentId = null;

    /* ── SEED defaults ────────────────────────────────────── */

    static seedDefaults() {
        // Only seed if no currencies exist yet
        if (StorageManager.getAll('cur_').length > 0) return;

        const defaults = [
            { id: 1, code: 'USD', name: 'US Dollar',       symbol: '$',   rate: 1.000000, isBase: true,  status: 'active' },
            { id: 2, code: 'EUR', name: 'Euro',             symbol: '€',   rate: 0.920000, isBase: false, status: 'active' },
            { id: 3, code: 'GBP', name: 'British Pound',   symbol: '£',   rate: 0.790000, isBase: false, status: 'active' },
            { id: 4, code: 'EGP', name: 'Egyptian Pound',  symbol: 'ج.م', rate: 30.50000, isBase: false, status: 'active' },
        ];
        defaults.forEach(c => {
            c.createdAt = new Date().toISOString();
            StorageManager.save('cur_' + c.id, c);
        });
    }

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('currencyForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        document.getElementById('currencyFormTitle').textContent = 'Create Currency';
        UIManager.navigateTo('currency-form');
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveCurrency(event) {
        event.preventDefault();

        const code   = document.getElementById('curCode')?.value?.trim().toUpperCase();
        const name   = document.getElementById('curName')?.value?.trim();
        const symbol = document.getElementById('curSymbol')?.value?.trim();
        const rate   = parseFloat(document.getElementById('curRate')?.value);
        const isBase = document.getElementById('curIsBase')?.checked || false;

        if (!Validator.validateRequired(code))   { Validator.showError('Currency code is required.'); return; }
        if (!Validator.validateRequired(name))   { Validator.showError('Currency name is required.'); return; }
        if (!Validator.validateRequired(symbol)) { Validator.showError('Symbol is required.'); return; }
        if (!Validator.validatePositive(rate))   { Validator.showError('Exchange rate must be greater than 0.'); return; }

        const form   = document.getElementById('currencyForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        // If setting as base, clear other base flags
        if (isBase) {
            StorageManager.getAll('cur_').forEach(c => {
                if (c.id !== id && c.isBase) {
                    c.isBase = false;
                    StorageManager.save('cur_' + c.id, c);
                }
            });
        }

        const currency = {
            id, code, name, symbol, rate, isBase,
            status: 'active',
            createdAt: editId ? StorageManager.load('cur_' + editId)?.createdAt || new Date().toISOString()
                              : new Date().toISOString()
        };

        StorageManager.save('cur_' + id, currency);
        Validator.showSuccess(editId ? 'Currency updated!' : 'Currency saved successfully!');
        UIManager.navigateTo('currencies');
        this.loadCurrencies();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadCurrencies() {
        const curs = StorageManager.getAll('cur_').sort((a, b) => a.code.localeCompare(b.code));
        this._renderTable(curs);
    }

    static _renderTable(curs) {
        const tbody = document.getElementById('currencyTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (curs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No currencies yet.</td></tr>';
            return;
        }

        curs.forEach(cur => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${cur.code}</strong>${cur.isBase ? ' <span class="badge badge-info" style="margin-left:6px;">Base</span>' : ''}</td>
                    <td>${cur.name}</td>
                    <td>${cur.symbol}</td>
                    <td class="text-right">${parseFloat(cur.rate).toFixed(6)}</td>
                    <td><span class="badge badge-success">${cur.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-warning btn-sm" onclick="CurrencyManager.editCurrency(${cur.id})">Edit</button>
                            <button class="btn btn-danger btn-sm"  onclick="CurrencyManager.deleteCurrency(${cur.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editCurrency(id) {
        const cur = StorageManager.load('cur_' + id);
        if (!cur) { Validator.showError('Currency not found.'); return; }

        this._currentId = id;

        const form = document.getElementById('currencyForm');
        if (form) form.dataset.editId = cur.id;

        document.getElementById('curCode').value   = cur.code;
        document.getElementById('curName').value   = cur.name;
        document.getElementById('curSymbol').value = cur.symbol;
        document.getElementById('curRate').value   = cur.rate;
        document.getElementById('curIsBase').checked = cur.isBase || false;

        document.getElementById('currencyFormTitle').textContent = 'Edit Currency';
        UIManager.navigateTo('currency-form');
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteCurrency(id) {
        const cur = StorageManager.load('cur_' + id);
        if (cur?.isBase) { Validator.showError('Cannot delete the base currency.'); return; }

        Validator.confirm('Delete this currency?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('cur_' + id);
            Validator.showSuccess('Currency deleted.');
            this.loadCurrencies();
        });
    }
}
