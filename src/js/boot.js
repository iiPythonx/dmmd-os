// Copyright (c) 2025 iiPython

// Handle application creation
window.roots = {};

function uuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}
function focus(id) {
    for (const tasklet of document.querySelectorAll("button[window-id]")) {
        tasklet.classList.remove("active");
        document.querySelector(`article[window-id = "${tasklet.getAttribute('window-id')}"]`).style.zIndex = "4";
    }
    document.querySelector(`article[window-id = "${id}"]`).style.zIndex = "5";
    document.querySelector(`button[window-id = "${id}"]`).classList.add("active");
}
function kill_app(id) {
    for (const i of document.querySelectorAll(`[window-id = "${id}"]`)) i.remove();
    if (window.roots[id]) delete window.roots[id];
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

    // Create tasklet
    app.style.zIndex = "5";
    for (const tasklet of document.querySelectorAll("button[window-id]")) {
        tasklet.classList.remove("active");
        document.querySelector(`article[window-id = "${tasklet.getAttribute('window-id')}"]`).style.zIndex = "4";
    }

    const tasklet = document.createElement("button");
    tasklet.classList.add("active");
    tasklet.innerHTML = `<img src = "${icon}"> ${title}`;
    tasklet.setAttribute("window-id", id);
    tasklet.addEventListener("click", () => {
        if (app.classList.contains("hidden")) {
            app.classList.remove("hidden");
            return focus(id);
        }
        if (app.style.zIndex === "4") return focus(id);
        tasklet.classList.toggle("active");
        app.classList.toggle("hidden");
    });
    document.getElementById("tasklets").appendChild(tasklet);

    // Bring us to focus
    app.addEventListener("click", () => {
        if (!app.classList.contains("hidden") && document.contains(app)) focus(id);
    });

    // Minimize and close
    app.querySelector("button").addEventListener("click", (e) => {
        tasklet.classList.remove("active");
        app.classList.toggle("hidden");
    });
    app.querySelector("button:last-child").addEventListener("click", () => kill_app(id));

    // Handle dragging
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

    // Create shadow DOM
    const root = app.querySelector("div").attachShadow({ mode: "open" });
    root.innerHTML = content;
    window.roots[id] = root;

    // Insert shared app CSS
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`{% include 'css/apps.css' %}`);
    root.adoptedStyleSheets = [sheet];

    // Append to desktop
    document.querySelector("main").appendChild(app);
    document.getElementById("start").classList.add("hidden");

    // Load JS
    for (const script of root.querySelectorAll("script")) {
        const new_script = document.createElement("script");
        new_script.textContent = script.textContent.replace(/\%OS_ROOT/g, id);
        script.remove();
        root.appendChild(new_script);
    }

    // Position it in the center
    app.style.top = `calc(50% - (${window.getComputedStyle(app).height} / 2))`;
    app.style.left = `calc(50% - (${window.getComputedStyle(app).width} / 2))`;
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
