// Copyright (c) 2025 iiPython
// This file contains the public OS API, usable from within an app's JS environment.

// API definition
const api = {
    file: {
        target: file_api,  // Exposed from files.js
        methods: ["list", "read", "write"]
    },
    db: {
        target: db,  // Exposed from database.js
        methods: ["set", "get", "set_backend", "get_backend"]
    },
    app: {
        target: {
            "run": (_, executable) => exe.launch(executable),
            "error": (_, title, message) => window_api.error(title, message),
            "kill": (app) => window_api.kill(app.getAttribute("window-id")),
            "list_all": (_) => exe.executables,
            "allow_overflow": (app, value) => app.style.overflow = value ? "visible" : "auto"
        },
        methods: ["run", "error", "kill", "list_all", "allow_overflow"],
        attach_app: true
    }
}

// Start listening
function attach_api_to_shadow_dom(shadow_dom) {
    shadow_dom.addEventListener("oscall", async (e) => {
        const app = document.querySelector(`article[window-id = "${e.detail?.from}"]`);
        if (!app) return;

        // Triple check :3
        if (!(e.detail.method && e.detail.args && e.detail.args.length !== undefined)) return;
        const args = e.detail.args;

        function respond(data) {
            const event = new CustomEvent("oscall", { detail: { response: data, to: e.detail.from } });
            shadow_dom.dispatchEvent(event)
        }
        
        // Begin matching functions
        const [module, method, ...idc] = e.detail.method.split(".");
        if (!(api[module] && api[module].methods.includes(method))) return respond(false);
        let result = api[module].target[method](...(api[module].attach_app ? [app, ...args] : args));
        if (result instanceof Promise) result = await result;
        respond(result);
    }, false);
}
