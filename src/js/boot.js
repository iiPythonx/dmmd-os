// Copyright (c) 2025 iiPython

// Handle application creation
function uuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}
function kill_app(id) {
    for (const i of document.querySelectorAll(`[window-id = "${id}"]`)) i.remove();
}
function create_application(title, icon, content, size) {
    const id = uuid();

    const app = document.createElement("article");
    app.innerHTML = `
        <header>
            <img src = "${icon}">
            <h4>${title}</h4>
            <button><span>_</span></button>
            <button><span>x</span></button>
        </header>
        <div></div>
    `;
    app.setAttribute("window-id", id);

    if (size) {
        const [x, y] = size.split("x");
        app.style.width = `${x}px`, app.style.height = `${y}px`;
    }

    const tasklet = document.createElement("button");
    tasklet.classList.add("active");
    tasklet.innerHTML = `<img src = "${icon}"> ${title}`;
    tasklet.setAttribute("window-id", id);
    tasklet.addEventListener("click", () => {
        tasklet.classList.toggle("active");
        app.classList.toggle("hidden");
    });
    document.getElementById("tasklets").appendChild(tasklet);

    app.querySelector("button").addEventListener("click", () => {
        tasklet.classList.toggle("active");
        app.classList.toggle("hidden");
    });
    app.querySelector("button:last-child").addEventListener("click", () => kill_app(id));

    app.querySelector("header").addEventListener("mousedown", (e) => {
        const offsetX = e.clientX - parseInt(window.getComputedStyle(app).left);
        const offsetY = e.clientY - parseInt(window.getComputedStyle(app).top);
        function move(e) {
            app.style.top = (e.clientY - offsetY) + "px";
            app.style.left = (e.clientX - offsetX) + "px";
        }
        function reset() {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", reset);
        }
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", reset);
    });

    const root = app.querySelector("div").attachShadow({ mode: "open" });
    root.innerHTML = content;

    document.querySelector("main").appendChild(app);
    document.getElementById("start").classList.add("hidden");
}

// Connect start menu
document.querySelector("footer > button").addEventListener("click", () => {
    document.getElementById("start").classList.toggle("hidden");
});

// Connect clock
const update_clock = () => {
    const d = new Date();
    h = d.getHours();
    m = d.getMinutes().toString().padStart(2, "0");
    document.getElementById("clock").innerText = `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}
setInterval(update_clock, 1000);
update_clock();
