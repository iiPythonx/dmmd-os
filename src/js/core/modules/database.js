// Copyright (c) 2025 iiPython

const DATABASE_BACKENDS = ["localstorage", "indexeddb", "dmmd"];

class Database {
    constructor() {
        this.type = +localStorage.getItem("db_type");
        if (!this.type) {
            this.type = 1;
            localStorage.setItem("db_type", "1");
        }

        // Handle specific drivers
        if (this.type === 2) {
            const idb = window.indexedDB.open("iiPythonOS", 1);
            idb.onerror = (event) => {
                console.error("Connection to IndexedDB failed", event);
            };
            idb.onsuccess = (event) => {
                this.db = event.target.result;
                this.db.onerror = (e) => console.error(`IndexedDB error: ${e.target.error?.message}`);
                if (this.on_db_loaded) {
                    this.on_db_loaded(this);
                    delete this.on_db_loaded;
                }
            };
            idb.onupgradeneeded = (event) => {
                event.target.result.createObjectStore("data", { keyPath: "key" });
            };

            // Rewrite methods
            this.set = (key, value) => {
                const store = this.db.transaction(["data"], "readwrite").objectStore("data");
                return store.put({ key: key, value: value });
            }
            this.get = (key) => {
                return new Promise((resolve) => {
                    function process(that) {
                        const req = that.db.transaction(["data"], "readwrite").objectStore("data").get(key);
                        req.onsuccess = (e) => resolve(e.target.result?.value);
                    }
                    if (this.db) process(this);
                    else this.on_db_loaded = process;
                })
            }
        }
    }

    // Get/set from database (default, localStorage)
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    async get(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    // Get/set the backend type
    set_backend(backend) {
        localStorage.setItem("db_type", (DATABASE_BACKENDS.indexOf(backend) + 1).toString());
    }

    get_backend() {
        return DATABASE_BACKENDS[this.type - 1];
    }
}

const db = new Database();
