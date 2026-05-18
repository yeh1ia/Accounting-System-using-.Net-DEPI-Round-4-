/* ============================================================
   js/ReportManager.js
   Generates financial reports from localStorage data.
   Covers: Trial Balance, Income Statement, Balance Sheet,
           Transaction Reports, Custom Report Builder
   ============================================================ */

class ReportManager {

    /* ── DASHBOARD SUMMARY ────────────────────────────────── */

    static loadDashboard() {
        const invoices = StorageManager.getAll('inv_');
        const txns     = StorageManager.getAll('txn_');
        const entries  = StorageManager.getAll('je_');

        const totalRevenue  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
        const totalReceivable = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total - (i.amountPaid || 0)), 0);
        const totalTxns     = txns.reduce((s, t) => s + t.amount, 0);
        const postedEntries = entries.filter(e => e.status === 'posted').length;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        set('rptTotalRevenue',      '$' + totalRevenue.toFixed(2));
        set('rptTotalReceivable',   '$' + totalReceivable.toFixed(2));
        set('rptTotalTransactions', '$' + totalTxns.toFixed(2));
        set('rptPostedEntries',     postedEntries);
    }

    /* ── TRIAL BALANCE ────────────────────────────────────── */

    static generateTrialBalance() {
        const entries = StorageManager.getAll('je_').filter(e => e.status === 'posted');

        // Aggregate by account
        const accountMap = {};
        entries.forEach(entry => {
            (entry.lines || []).forEach(line => {
                if (!accountMap[line.account]) {
                    accountMap[line.account] = { debit: 0, credit: 0 };
                }
                accountMap[line.account].debit  += line.debit;
                accountMap[line.account].credit += line.credit;
            });
        });

        const tbody = document.getElementById('tbBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let totalDebit = 0, totalCredit = 0;

        Object.entries(accountMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([account, bal]) => {
            const netDebit  = Math.max(bal.debit  - bal.credit, 0);
            const netCredit = Math.max(bal.credit - bal.debit,  0);
            totalDebit  += netDebit;
            totalCredit += netCredit;

            tbody.innerHTML += `
                <tr>
                    <td>${account}</td>
                    <td class="text-right">${netDebit  > 0 ? '$' + netDebit.toFixed(2)  : '—'}</td>
                    <td class="text-right">${netCredit > 0 ? '$' + netCredit.toFixed(2) : '—'}</td>
                </tr>`;
        });

        if (Object.keys(accountMap).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No posted journal entries found.</td></tr>';
        }

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('tbTotalDebit',  '$' + totalDebit.toFixed(2));
        set('tbTotalCredit', '$' + totalCredit.toFixed(2));

        const statusEl = document.getElementById('tbBalanceStatus');
        if (statusEl) {
            const balanced = Math.abs(totalDebit - totalCredit) < 0.005;
            statusEl.textContent = balanced ? '✓ Balanced' : '✗ Not Balanced';
            statusEl.className   = 'balance-status ' + (balanced ? 'balance-success' : 'balance-error');
        }

        Validator.showSuccess('Trial Balance generated.');
    }

    /* ── INCOME STATEMENT ─────────────────────────────────── */

    static generateIncomeStatement() {
        const startDate = document.getElementById('isStartDate')?.value;
        const endDate   = document.getElementById('isEndDate')?.value;

        const invoices = StorageManager.getAll('inv_').filter(inv => {
            if (startDate && inv.date < startDate) return false;
            if (endDate   && inv.date > endDate)   return false;
            return true;
        });

        const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);

        // Revenue lines from invoices grouped by customer
        const revenueByCustomer = {};
        invoices.forEach(inv => {
            revenueByCustomer[inv.customer] = (revenueByCustomer[inv.customer] || 0) + inv.total;
        });

        const revBody = document.getElementById('isRevenueBody');
        const expBody = document.getElementById('isExpenseBody');

        if (revBody) {
            revBody.innerHTML = '';
            if (Object.keys(revenueByCustomer).length === 0) {
                revBody.innerHTML = '<tr><td colspan="2" class="text-muted" style="padding-left:30px;">No revenue data</td></tr>';
            } else {
                Object.entries(revenueByCustomer).forEach(([customer, amount]) => {
                    revBody.innerHTML += `
                        <tr>
                            <td style="padding-left:30px;">${customer}</td>
                            <td class="text-right">$${amount.toFixed(2)}</td>
                        </tr>`;
                });
            }
        }

        // Expense lines from posted journal entries (accounts starting with 5)
        const entries = StorageManager.getAll('je_').filter(e => {
            if (e.status !== 'posted') return false;
            if (startDate && e.date < startDate) return false;
            if (endDate   && e.date > endDate)   return false;
            return true;
        });

        const expenseMap = {};
        entries.forEach(entry => {
            (entry.lines || []).forEach(line => {
                if (line.account.startsWith('5') && line.debit > 0) {
                    expenseMap[line.account] = (expenseMap[line.account] || 0) + line.debit;
                }
            });
        });

        let totalExpenses = 0;
        if (expBody) {
            expBody.innerHTML = '';
            if (Object.keys(expenseMap).length === 0) {
                expBody.innerHTML = '<tr><td colspan="2" class="text-muted" style="padding-left:30px;">No expense data</td></tr>';
            } else {
                Object.entries(expenseMap).forEach(([account, amount]) => {
                    totalExpenses += amount;
                    expBody.innerHTML += `
                        <tr>
                            <td style="padding-left:30px;">${account}</td>
                            <td class="text-right">$${amount.toFixed(2)}</td>
                        </tr>`;
                });
            }
        }

        const netIncome = totalRevenue - totalExpenses;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('isTotalRevenue',  '$' + totalRevenue.toFixed(2));
        set('isTotalExpenses', '$' + totalExpenses.toFixed(2));
        set('isNetIncome',     '$' + netIncome.toFixed(2));

        const netEl = document.getElementById('isNetIncome');
        if (netEl) netEl.style.color = netIncome >= 0 ? 'var(--success)' : 'var(--danger)';

        Validator.showSuccess('Income Statement generated.');
    }

    /* ── BALANCE SHEET ────────────────────────────────────── */

    static generateBalanceSheet() {
        const entries = StorageManager.getAll('je_').filter(e => e.status === 'posted');

        const accountMap = {};
        entries.forEach(entry => {
            (entry.lines || []).forEach(line => {
                if (!accountMap[line.account]) accountMap[line.account] = { debit: 0, credit: 0 };
                accountMap[line.account].debit  += line.debit;
                accountMap[line.account].credit += line.credit;
            });
        });

        // Assets: accounts starting with 1 (debit-normal)
        // Liabilities: accounts starting with 2 (credit-normal)
        // Equity: accounts starting with 3 (credit-normal)
        let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;

        const assetBody = document.getElementById('bsAssetBody');
        const liabBody  = document.getElementById('bsLiabilityBody');
        const eqBody    = document.getElementById('bsEquityBody');

        if (assetBody) assetBody.innerHTML = '';
        if (liabBody)  liabBody.innerHTML  = '';
        if (eqBody)    eqBody.innerHTML    = '';

        Object.entries(accountMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([account, bal]) => {
            const netDebit  = bal.debit  - bal.credit;
            const netCredit = bal.credit - bal.debit;

            if (account.startsWith('1') && assetBody) {
                const val = Math.max(netDebit, 0);
                totalAssets += val;
                assetBody.innerHTML += `
                    <tr><td style="padding-left:30px;">${account}</td><td class="text-right">$${val.toFixed(2)}</td></tr>`;
            } else if (account.startsWith('2') && liabBody) {
                const val = Math.max(netCredit, 0);
                totalLiabilities += val;
                liabBody.innerHTML += `
                    <tr><td style="padding-left:30px;">${account}</td><td class="text-right">$${val.toFixed(2)}</td></tr>`;
            } else if (account.startsWith('3') && eqBody) {
                const val = Math.max(netCredit, 0);
                totalEquity += val;
                eqBody.innerHTML += `
                    <tr><td style="padding-left:30px;">${account}</td><td class="text-right">$${val.toFixed(2)}</td></tr>`;
            }
        });

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('bsTotalAssets',      '$' + totalAssets.toFixed(2));
        set('bsTotalLiabilities', '$' + totalLiabilities.toFixed(2));
        set('bsTotalEquity',      '$' + totalEquity.toFixed(2));
        set('bsTotalLiabEquity',  '$' + (totalLiabilities + totalEquity).toFixed(2));

        Validator.showSuccess('Balance Sheet generated.');
    }

    /* ── TRANSACTION REPORT ───────────────────────────────── */

    static generateTransactionReport() {
        const startDate = document.getElementById('trStartDate')?.value;
        const endDate   = document.getElementById('trEndDate')?.value;
        const type      = document.getElementById('trType')?.value;

        const txns = StorageManager.getAll('txn_').filter(t => {
            if (startDate && t.date < startDate) return false;
            if (endDate   && t.date > endDate)   return false;
            if (type && t.type !== type)          return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        const tbody = document.getElementById('trBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (txns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transactions match the filter.</td></tr>';
            return;
        }

        const typeBadges = { transfer: 'badge-primary', payment: 'badge-danger', receipt: 'badge-success', deposit: 'badge-info', withdrawal: 'badge-warning' };

        txns.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td>${t.date}</td>
                    <td><span class="badge ${typeBadges[t.type] || 'badge-primary'}">${t.type}</span></td>
                    <td>TXN-${t.id}</td>
                    <td>${t.description}</td>
                    <td>${t.fromAccount}</td>
                    <td>${t.toAccount}</td>
                    <td class="text-right">$${t.amount.toFixed(2)}</td>
                </tr>`;
        });

        const total = txns.reduce((s, t) => s + t.amount, 0);
        const el = document.getElementById('trTotalAmount');
        if (el) el.textContent = '$' + total.toFixed(2);

        Validator.showSuccess(`${txns.length} transaction(s) found.`);
    }

    /* ── CUSTOM REPORT ────────────────────────────────────── */

    static generateCustomReport() {
        const name      = document.getElementById('crName')?.value?.trim();
        const type      = document.getElementById('crType')?.value;
        const startDate = document.getElementById('crStartDate')?.value;
        const endDate   = document.getElementById('crEndDate')?.value;

        if (!Validator.validateRequired(name)) { Validator.showError('Report name is required.'); return; }
        if (!Validator.validateRequired(type)) { Validator.showError('Report type is required.'); return; }

        // Save to custom report history
        const report = {
            id: Date.now(),
            name, type, startDate, endDate,
            generatedAt: new Date().toISOString()
        };
        StorageManager.save('cr_' + report.id, report);

        // Redirect to appropriate statement
        if (type === 'income') {
            if (startDate) document.getElementById('isStartDate').value = startDate;
            if (endDate)   document.getElementById('isEndDate').value   = endDate;
            UIManager.navigateTo('financial-statements');
            // activate income tab
            document.querySelectorAll('#financial-statements .tab-btn').forEach((b, i) => {
                b.classList.toggle('active', i === 1);
            });
            document.querySelectorAll('#financial-statements .tab-content').forEach((t, i) => {
                t.classList.toggle('active', i === 1);
            });
            ReportManager.generateIncomeStatement();
        } else if (type === 'balance') {
            UIManager.navigateTo('financial-statements');
            document.querySelectorAll('#financial-statements .tab-btn').forEach((b, i) => {
                b.classList.toggle('active', i === 2);
            });
            document.querySelectorAll('#financial-statements .tab-content').forEach((t, i) => {
                t.classList.toggle('active', i === 2);
            });
            ReportManager.generateBalanceSheet();
        } else if (type === 'trial-balance') {
            UIManager.navigateTo('financial-statements');
            document.querySelectorAll('#financial-statements .tab-btn').forEach((b, i) => {
                b.classList.toggle('active', i === 0);
            });
            document.querySelectorAll('#financial-statements .tab-content').forEach((t, i) => {
                t.classList.toggle('active', i === 0);
            });
            ReportManager.generateTrialBalance();
        } else {
            Validator.showSuccess(`Custom report "${name}" generated!`);
        }

        this.loadSavedReports();
    }

    static loadSavedReports() {
        const reports = StorageManager.getAll('cr_').sort((a, b) => b.id - a.id);
        const tbody = document.getElementById('savedReportsTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No saved reports yet.</td></tr>';
            return;
        }

        reports.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.name}</td>
                    <td>${r.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                    <td>${r.generatedAt.split('T')[0]}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="ReportManager.deleteReport(${r.id})">Delete</button>
                    </td>
                </tr>`;
        });
    }

    static deleteReport(id) {
        StorageManager.delete('cr_' + id);
        this.loadSavedReports();
        Validator.showSuccess('Report deleted.');
    }
}
