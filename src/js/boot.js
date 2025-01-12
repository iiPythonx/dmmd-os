// Copyright (c) 2025 iiPython

// Handle application creation
function uuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}
function create_application(title, icon, content) {
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
    app.querySelector("button:last-child").addEventListener("click", () => {
        app.remove();
        tasklet.remove();
    });

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
}

// Start menu structure
const start_menu_struct = [
    {
        name: "Programs",
        icon: "{% include 'icons/programs.ico' %}",
        exec: [
            {
                name: "Notepad",
                icon: "",
                exec: "notepad"
            },
            {
                name: "Calculator",
                icon: "",
                exec: "calc"
            },
            {
                name: "Games",
                icon: "",
                exec: [
                    {
                        name: "Minesweeper",
                        icon: "",
                        exec: "minesweeper"
                    }
                ]
            }
        ]
    },
    {
        name: "Favorites",
        icon: "{% include 'icons/favorites.ico' %}",
        exec: "favorites"
    },
    {
        name: "Documents",
        icon: "{% include 'icons/documents.ico' %}",
        exec: "documents"
    },
    {
        name: "Settings",
        icon: "{% include 'icons/settings.ico' %}",
        exec: [
            {
                name: "Control Panel",
                icon: ""
            },
            {
                name: "Taskbar & Start Menu...",
                icon: ""
            }
        ]
    },
    {
        name: "Find",
        icon: "{% include 'icons/find.ico' %}",
        exec: "find"
    },
    {
        name: "Help",
        icon: "{% include 'icons/help.ico' %}",
        exec: "help"
    },
    {
        name: "Run",
        icon: "{% include 'icons/run.ico' %}",
        exec: "run"
    }
];

create_application(
    "Untitled - Notepad",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAFVBMVEUAAAAAgIAA//+AgIDAwMAAAAD///8J9+zXAAAAAXRSTlMAQObYZgAAAAFiS0dEBmFmuH0AAAAHdElNRQfiBhoALTAhTzgxAAAAX0lEQVQI1y2NwQ2AMAzEglgAkDoAVdmABYga3jwaRuj+I+C2+GXdXRQRmVYQ2E5YmqhqCjQJLkcOdzWjaUmwMcnFxmR/kUhiav/ktj7RQtIflMqVQ46IzBW6ZGjSy+cDW4gWFTJLDN4AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjZUMDA6NDU6NDgtMDQ6MDBhJQfuAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI2VDAwOjQ1OjQ4LTA0OjAwEHi/UgAAAABJRU5ErkJggg==",
    `
        <style>
            textarea {
                width: calc(100% - 4px);
                height: 100%;
                color: black;
                border: none;
                resize: none;
                overflow: auto;
                outline: none;
            }
        </style>
        <textarea>The quick brown iiPython jumps over the lazy DmmD.</textarea>
    `
);

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
