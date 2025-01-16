// Copyright (c) 2025 iiPython
// This file contains the public OS API, usable from within an app's JS environment.

// Start listening
function attach_api_to_shadow_dom(shadow_dom) {
    shadow_dom.addEventListener("oscall", async (e) => {
        const app = document.querySelector(`article[window-id = "${e.detail?.from}"]`);
        if (!app) return;

        // Triple check :3
        console.log(`[OS] Call received from "${e.detail.from}":`, e.detail);
        if (!(e.detail.method && e.detail.args && e.detail.args.length !== undefined)) return;
        const args = e.detail.args;

        function respond(data) {
            const event = new CustomEvent("oscall", { detail: { response: data, to: e.detail.from } });
            shadow_dom.dispatchEvent(event)
        }
        
        // Begin matching functions
        switch (e.detail.method) {
            case "db.get":
                if (!args) return;
                respond(JSON.parse(await db.get(args[0])));
                break;
            case "db.set":
                if (args.length !== 2) return;
                respond(db.set(args[0], JSON.stringify(args[1])));
                break;
            case "db.get_backend":
                respond(db.use_indexed ? "indexeddb" : "localstorage");
                break;
            case "db.set_backend":
                if (!args) return;
                db.set_backend(args[0]);
                respond();
                break;
            case "app.run":
                if (!args) return;
                exe.launch(args[0]);
                respond();
                break;
            case "app.error":
                if (!args.length === 2) return;
                window_api.error(...args);
                respond();
                break;
            case "app.kill":
                window_api.kill(e.detail.from);
                break;
            case "app.list_all":
                respond(exe.executables);
                break;
        }
    }, false);
}
