// Copyright (c) 2025 iiPython

class Database {
    constructor() {
        this.use_indexed = +localStorage.getItem("use_indexeddb");
        if (this.use_indexed) {
            const idb = window.indexedDB.open("iiPythonOS", 1);
            idb.onerror = (event) => {
                console.error("Connection to IndexedDB failed", event);
            };
            idb.onsuccess = (event) => {
                this.db = event.target.result;
                this.db.onerror = (e) => console.error(`IndexedDB error: ${e.target.error?.message}`);
            };
            idb.onupgradeneeded = (event) => {
                event.target.result.createObjectStore("data", { keyPath: "key" });
            };
        }
    }

    set(key, value) {
        if (this.use_indexed) {
            const store = this.db.transaction(["data"], "readwrite").objectStore("data");
            return store.put({ key: key, value: value });
        }
        localStorage.setItem(key, value);
    }

    get(key) {
        return new Promise((resolve) => {
            if (this.use_indexed) {
                const req = this.db.transaction(["data"], "readwrite").objectStore("data").get(key);
                req.onsuccess = (e) => resolve(e.target.result?.value);
            } else resolve(localStorage.getItem(key));
        });
    }

    set_backend(backend) {
        localStorage.setItem("use_indexeddb", +(backend === "indexeddb"));
    }
}

const db = new Database();
