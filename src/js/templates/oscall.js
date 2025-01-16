const oscall = (method, ...arguments) => {
    function construct_listener(resolve) {
        dom.addEventListener("oscall", (e) => {
            if (e.detail.to !== "%APP_ID") return;
            console.log("[App] OS Response:", e.detail.response);
            dom.removeEventListener("oscall", construct_listener);
            resolve(e.detail.response);
        });
    }
    return new Promise((resolve) => {
        console.log("[App] Sent OS call:", { method: method, args: arguments, from: "%APP_ID" });
        construct_listener(resolve);
        const event = new CustomEvent("oscall", { detail: { method: method, args: arguments, from: "%APP_ID" } });
        dom.dispatchEvent(event);
    });
}
