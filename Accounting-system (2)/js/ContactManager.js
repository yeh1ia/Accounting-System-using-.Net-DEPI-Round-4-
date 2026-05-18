/* ============================================================
   js/ContactManager.js
   Manages the Contacts / CRM module.
   Pages: contacts, contact-detail, contact-form
   ============================================================ */

class ContactManager {

    static _currentId = null;

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        document.getElementById('contactFormTitle').textContent = 'Create Contact';
        UIManager.navigateTo('contact-form');
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveContact(event) {
        event.preventDefault();

        const name    = document.getElementById('ctName')?.value?.trim();
        const type    = document.getElementById('ctType')?.value;
        const email   = document.getElementById('ctEmail')?.value?.trim();
        const phone   = document.getElementById('ctPhone')?.value?.trim();
        const address = document.getElementById('ctAddress')?.value?.trim();
        const city    = document.getElementById('ctCity')?.value?.trim();
        const state   = document.getElementById('ctState')?.value?.trim();
        const postal  = document.getElementById('ctPostal')?.value?.trim();
        const country = document.getElementById('ctCountry')?.value?.trim();
        const notes   = document.getElementById('ctNotes')?.value?.trim();

        if (!Validator.validateRequired(name))  { Validator.showError('Contact name is required.'); return; }
        if (!Validator.validateRequired(email)) { Validator.showError('Email is required.'); return; }
        if (!Validator.validateEmail(email))    { Validator.showError('Please enter a valid email address.'); return; }

        const form   = document.getElementById('contactForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        const contact = {
            id, name, type, email, phone, address, city, state, postal, country, notes,
            status: 'active',
            createdAt: editId ? StorageManager.load('ct_' + editId)?.createdAt || new Date().toISOString()
                              : new Date().toISOString()
        };

        StorageManager.save('ct_' + id, contact);
        Validator.showSuccess(editId ? 'Contact updated!' : 'Contact saved successfully!');
        UIManager.navigateTo('contacts');
        this.loadContacts();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadContacts() {
        const contacts = StorageManager.getAll('ct_').sort((a, b) => a.name.localeCompare(b.name));
        this._renderTable(contacts);
    }

    static _renderTable(contacts) {
        const tbody = document.getElementById('contactTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No contacts yet. Click "+ New Contact" to create one.</td></tr>';
            return;
        }

        const typeCls = { customer: 'badge-success', vendor: 'badge-info', employee: 'badge-warning', partner: 'badge-primary' };

        contacts.forEach(ct => {
            const cls = typeCls[ct.type] || 'badge-primary';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${ct.name}</strong></td>
                    <td><span class="badge ${cls}">${ct.type}</span></td>
                    <td>${ct.email}</td>
                    <td>${ct.phone || '—'}</td>
                    <td>${ct.city ? ct.city + (ct.state ? ', ' + ct.state : '') : '—'}</td>
                    <td><span class="badge badge-success">${ct.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-secondary btn-sm" onclick="ContactManager.showDetail(${ct.id})">View</button>
                            <button class="btn btn-warning btn-sm"   onclick="ContactManager.editContact(${ct.id})">Edit</button>
                            <button class="btn btn-danger btn-sm"    onclick="ContactManager.deleteContact(${ct.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── FILTER ───────────────────────────────────────────── */

    static filterContacts() {
        const search = document.getElementById('contactSearch')?.value?.toLowerCase() || '';
        const type   = document.getElementById('contactType')?.value || '';

        const contacts = StorageManager.getAll('ct_').filter(c =>
            (c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search)) &&
            (type === '' || c.type === type)
        );

        this._renderTable(contacts);
    }

    /* ── DETAIL ───────────────────────────────────────────── */

    static showDetail(id) {
        const ct = StorageManager.load('ct_' + id);
        if (!ct) { Validator.showError('Contact not found.'); return; }

        this._currentId = id;

        document.getElementById('detailCtName').textContent    = ct.name;
        document.getElementById('detailCtType').textContent    = ct.type;
        document.getElementById('detailCtEmail').textContent   = ct.email;
        document.getElementById('detailCtPhone').textContent   = ct.phone || '—';
        document.getElementById('detailCtAddress').textContent = [ct.address, ct.city, ct.state, ct.postal, ct.country].filter(Boolean).join(', ') || '—';
        document.getElementById('detailCtNotes').textContent   = ct.notes || '—';

        const statusEl = document.getElementById('detailCtStatus');
        statusEl.textContent = ct.status;
        statusEl.className   = 'badge badge-success';

        UIManager.navigateTo('contact-detail');
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editContact(id) {
        const ct = StorageManager.load('ct_' + id);
        if (!ct) { Validator.showError('Contact not found.'); return; }

        this._currentId = id;

        const form = document.getElementById('contactForm');
        if (form) form.dataset.editId = ct.id;

        document.getElementById('ctName').value    = ct.name;
        document.getElementById('ctType').value    = ct.type;
        document.getElementById('ctEmail').value   = ct.email;
        document.getElementById('ctPhone').value   = ct.phone || '';
        document.getElementById('ctAddress').value = ct.address || '';
        document.getElementById('ctCity').value    = ct.city || '';
        document.getElementById('ctState').value   = ct.state || '';
        document.getElementById('ctPostal').value  = ct.postal || '';
        document.getElementById('ctCountry').value = ct.country || '';
        document.getElementById('ctNotes').value   = ct.notes || '';

        document.getElementById('contactFormTitle').textContent = 'Edit Contact';
        UIManager.navigateTo('contact-form');
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteContact(id) {
        Validator.confirm('Delete this contact?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('ct_' + id);
            Validator.showSuccess('Contact deleted.');
            this.loadContacts();
        });
    }
}
