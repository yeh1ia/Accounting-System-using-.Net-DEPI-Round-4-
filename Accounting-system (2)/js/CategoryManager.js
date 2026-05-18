/* ============================================================
   js/CategoryManager.js
   Manages the Categories module.
   Pages: categories, category-form
   ============================================================ */

class CategoryManager {

    static _currentId = null;

    /* ── FORM ─────────────────────────────────────────────── */

    static openForm() {
        const form = document.getElementById('categoryForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        document.getElementById('categoryFormTitle').textContent = 'Create Category';
        UIManager.navigateTo('category-form');
    }

    /* ── SAVE ─────────────────────────────────────────────── */

    static saveCategory(event) {
        event.preventDefault();

        const name        = document.getElementById('catName')?.value?.trim();
        const type        = document.getElementById('catType')?.value;
        const glAccount   = document.getElementById('catGlAccount')?.value?.trim();
        const description = document.getElementById('catDescription')?.value?.trim();

        if (!Validator.validateRequired(name))      { Validator.showError('Category name is required.'); return; }
        if (!Validator.validateRequired(type))      { Validator.showError('Category type is required.'); return; }
        if (!Validator.validateRequired(glAccount)) { Validator.showError('GL Account is required.'); return; }

        const form   = document.getElementById('categoryForm');
        const editId = form?.dataset?.editId ? parseInt(form.dataset.editId) : null;
        const id     = editId || Date.now();

        const category = {
            id, name, type, glAccount, description,
            status: 'active',
            createdAt: editId ? StorageManager.load('cat_' + editId)?.createdAt || new Date().toISOString()
                              : new Date().toISOString()
        };

        StorageManager.save('cat_' + id, category);
        Validator.showSuccess(editId ? 'Category updated!' : 'Category saved successfully!');
        UIManager.navigateTo('categories');
        this.loadCategories();
    }

    /* ── LIST ─────────────────────────────────────────────── */

    static loadCategories() {
        const cats = StorageManager.getAll('cat_').sort((a, b) => a.name.localeCompare(b.name));
        this._renderTable(cats);
    }

    static _renderTable(cats) {
        const tbody = document.getElementById('categoryTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (cats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No categories yet. Click "+ New Category" to create one.</td></tr>';
            return;
        }

        const typeCls = {
            revenue:   'badge-success',
            expense:   'badge-danger',
            asset:     'badge-primary',
            liability: 'badge-warning',
            equity:    'badge-info'
        };

        cats.forEach(cat => {
            const cls = typeCls[cat.type] || 'badge-primary';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${cat.name}</strong></td>
                    <td><span class="badge ${cls}">${cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}</span></td>
                    <td>${cat.glAccount}</td>
                    <td><span class="badge badge-success">${cat.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-warning btn-sm" onclick="CategoryManager.editCategory(${cat.id})">Edit</button>
                            <button class="btn btn-danger btn-sm"  onclick="CategoryManager.deleteCategory(${cat.id})">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    }

    /* ── EDIT ─────────────────────────────────────────────── */

    static editCategory(id) {
        const cat = StorageManager.load('cat_' + id);
        if (!cat) { Validator.showError('Category not found.'); return; }

        this._currentId = id;

        const form = document.getElementById('categoryForm');
        if (form) form.dataset.editId = cat.id;

        document.getElementById('catName').value        = cat.name;
        document.getElementById('catType').value        = cat.type;
        document.getElementById('catGlAccount').value   = cat.glAccount;
        document.getElementById('catDescription').value = cat.description || '';

        document.getElementById('categoryFormTitle').textContent = 'Edit Category';
        UIManager.navigateTo('category-form');
    }

    /* ── DELETE ───────────────────────────────────────────── */

    static deleteCategory(id) {
        Validator.confirm('Delete this category?').then(confirmed => {
            if (!confirmed) return;
            StorageManager.delete('cat_' + id);
            Validator.showSuccess('Category deleted.');
            this.loadCategories();
        });
    }
}
