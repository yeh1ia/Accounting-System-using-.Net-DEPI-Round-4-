/* ============================================================
   js/DarkModeManager.js
   Manages light / dark theme.
   Persists preference to localStorage.
   Updates the toggle button icon in the sidebar.
   ============================================================ */

class DarkModeManager {

    static STORAGE_KEY = 'accounting_dark_mode';
    static BTN_ID      = 'darkModeBtn';

    /** Call once on DOMContentLoaded to restore saved preference */
    static init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'true') {
            this._apply(true, false);
        } else {
            this._apply(false, false);
        }
    }

    /** Toggle between light and dark */
    static toggle() {
        const isDark = document.body.classList.contains('dark-mode');
        this._apply(!isDark, true);
    }

    /** Internal: apply a specific mode */
    static _apply(dark, animate) {
        if (animate) {
            document.body.style.transition = 'background 0.4s, color 0.4s';
            setTimeout(() => { document.body.style.transition = ''; }, 400);
        }

        if (dark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(this.STORAGE_KEY, 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem(this.STORAGE_KEY, 'false');
        }

        this._updateButton(dark);
    }

    /** Update icon + label on the toggle button */
    static _updateButton(dark) {
        const btn = document.getElementById(this.BTN_ID);
        if (!btn) return;

        const icon  = btn.querySelector('.btn-icon');
        const label = btn.querySelector('.btn-label');

        if (icon)  icon.textContent  = dark ? '☀️' : '🌙';
        if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';

        btn.setAttribute('title', dark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.setAttribute('aria-label', dark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }

    /** Returns true if dark mode is currently active */
    static isDark() {
        return document.body.classList.contains('dark-mode');
    }
}
