const oscall = (method, ...arguments) => {
    function construct_listener(resolve) {
        dom.addEventListener("oscall", (e) => {
            if (e.detail.to !== "%APP_ID") return;
            dom.removeEventListener("oscall", construct_listener);
            resolve(e.detail.response);
        });
    }
    return new Promise((resolve) => {
        construct_listener(resolve);
        const event = new CustomEvent("oscall", { detail: { method: method, args: arguments, from: "%APP_ID" } });
        dom.dispatchEvent(event);
    });
}
