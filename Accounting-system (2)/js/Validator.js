/* ============================================================
   js/Validator.js
   Input validation helpers + Toast notification system.
   Replaces all alert() / confirm() calls with non-blocking UI.
   ============================================================ */

/* ----------------------------------------------------------
   TOAST  — lightweight non-blocking notification
   ---------------------------------------------------------- */
class Toast {

    static _ensureContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Show a toast message.
     * @param {string} message
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {number} duration   ms before auto-dismiss (default 3000)
     */
    static show(message, type = 'success', duration = 3000) {
        const container = this._ensureContainer();

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-msg">${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.35s ease forwards';
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg)   { this.show(msg, 'error'); }
    static warning(msg) { this.show(msg, 'warning'); }
    static info(msg)    { this.show(msg, 'info'); }
}

/* ----------------------------------------------------------
   VALIDATOR  — input validation helpers
   ---------------------------------------------------------- */
class Validator {

    /** Is the value a valid email address? */
    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    }

    /** Is the value non-empty after trimming? */
    static validateRequired(value) {
        return value !== null && value !== undefined && String(value).trim().length > 0;
    }

    /** Is the value a finite number? */
    static validateNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /** Is the value a parseable date? */
    static validateDate(date) {
        return !isNaN(Date.parse(date));
    }

    /** Is amount > 0? */
    static validatePositive(value) {
        return this.validateNumber(value) && parseFloat(value) > 0;
    }

    /* ---- Toast shortcuts (keeps old call-sites working) ---- */
    static showError(message)   { Toast.error(message); }
    static showSuccess(message) { Toast.success(message); }
    static showWarning(message) { Toast.warning(message); }
    static showInfo(message)    { Toast.info(message); }

    /* ---- Confirm dialog wrapper (returns Promise<boolean>) ---- */
    static confirm(message) {
        return new Promise(resolve => {
            resolve(window.confirm(message));
        });
    }
}
