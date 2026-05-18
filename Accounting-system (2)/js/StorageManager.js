/* ============================================================
   js/StorageManager.js
   Handles all localStorage read / write / delete operations.
   ============================================================ */

class StorageManager {

    /** Save any serialisable value under a key */
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('StorageManager.save error:', e);
            return false;
        }
    }

    /** Load and parse a value; returns null if missing */
    static load(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('StorageManager.load error:', e);
            return null;
        }
    }

    /** Remove a single key */
    static delete(key) {
        localStorage.removeItem(key);
    }

    /**
     * Return an array of all parsed values whose localStorage key
     * starts with the given prefix.
     */
    static getAll(prefix) {
        const items = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const parsed = JSON.parse(localStorage.getItem(key));
                    items.push(parsed);
                }
            }
        } catch (e) {
            console.error('StorageManager.getAll error:', e);
        }
        return items;
    }

    /** Delete every key that starts with a given prefix */
    static deleteAll(prefix) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) keys.push(key);
        }
        keys.forEach(k => localStorage.removeItem(k));
    }

    /**
     * Return the next auto-increment integer for a given counter key.
     * Each call increments and persists the counter.
     */
    static nextId(counterKey) {
        const current = parseInt(localStorage.getItem(counterKey) || '0', 10);
        const next = current + 1;
        localStorage.setItem(counterKey, String(next));
        return next;
    }
}
