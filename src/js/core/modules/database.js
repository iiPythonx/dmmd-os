// Copyright (c) 2025 iiPython

const DATABASE_BACKENDS = ["localstorage", "indexeddb", "dmmd"];

class Database {
    constructor() {
        this.type = +this.get_core("db_type");
        if (window.parent !== window) this.type = 3;  // If we're in an iframe, assume DmmD

        if (!this.type) {
            this.type = 1;
            this.set_core("db_type", "1");
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
        } else if (this.type === 3) {

            // DmmD API goes here
            // TODO: all of it

            this.set = (key, value) => null;
            this.get = async (key) => null;
        }
    }

    // Get/set from database (default, localStorage)
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    async get(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    // Get/set for core data
    set_core(key, value) {
        if (window.parent !== window) return;  // No DmmD API yet
        localStorage.setItem(key, value);
    }
    get_core(key) {
        if (window.parent !== window) return null;  // Same as above.
        return localStorage.getItem(key);
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
