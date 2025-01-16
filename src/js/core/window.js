// Copyright (c) 2025 iiPython
const window_api = {
    focus: (id) => {
        for (const tasklet of document.querySelectorAll("button[window-id]")) {
            tasklet.classList.remove("active");
            document.querySelector(`article[window-id = "${tasklet.getAttribute('window-id')}"]`).style.zIndex = "4";
        }
        document.querySelector(`article[window-id = "${id}"]`).style.zIndex = "5";
        document.querySelector(`button[window-id = "${id}"]`).classList.add("active");
    },
    kill: (id) => {
        for (const i of document.querySelectorAll(`[window-id = "${id}"]`)) i.remove();
    },
    create: (title, icon, content, start_size) => {
        const id = Math.random().toString(36).substring(2, 8);
        const app = document.createElement("article");
        app.innerHTML = `
            <header>
                <i class = "icon icon-${icon}"></i>
                <h4>${title}</h4>
                <button><span>_</span></button>
                <button><span>x</span></button>
            </header>
            <div></div>
        `;
        app.setAttribute("window-id", id);
        
        if (start_size) {
            const [x, y] = start_size.split("x");
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
        tasklet.innerHTML = `<i class = "icon icon-${icon}"></i> ${title}`;
        tasklet.setAttribute("window-id", id);
        tasklet.addEventListener("click", () => {
            if (app.classList.contains("hidden")) {
                app.classList.remove("hidden");
                return focus(id);
            }
            if (app.style.zIndex === "4") return window_api.focus(id);
            tasklet.classList.toggle("active");
            app.classList.toggle("hidden");
        });
        document.getElementById("tasklets").appendChild(tasklet);
        
        // Bring us to focus
        app.addEventListener("click", () => {
            if (!app.classList.contains("hidden") && document.contains(app)) window_api.focus(id);
        });
        
        // Minimize and close
        app.querySelector("button").addEventListener("click", () => {
            tasklet.classList.remove("active");
            app.classList.toggle("hidden");
            if (app.classList.contains("hidden")) app.style.zIndex = "4";
        });
        app.querySelector("button:last-child").addEventListener("click", () => window_api.kill(id));
        
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
        attach_api_to_shadow_dom(root);
        
        // Insert shared app CSS
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`{% include 'css/apps.css' %}{% include 'css/icons.css' %}`);
        root.adoptedStyleSheets = [sheet];

        // Load JS
        for (const script of root.querySelectorAll("script")) {
            const new_script = document.createElement("script");
            new_script.textContent = `
                (async () => {
                    const dom = document.querySelector("article[window-id = '${id}'] > div").shadowRoot;
                    {% include "js/templates/oscall.js" %}
                    ${script.textContent}
                })();
            `.replace(/\%APP_ID/g, id);  // Forced IIFE to prevent pollution
            script.remove();
            root.appendChild(new_script);
        }

        // Append to desktop
        document.querySelector("main").appendChild(app);
        document.getElementById("start").classList.add("hidden");
        
        // Position it in the center
        app.style.top = `calc(50% - (${window.getComputedStyle(app).height} / 2))`;
        app.style.left = `calc(50% - (${window.getComputedStyle(app).width} / 2))`;
        setTimeout(() => window_api.focus(id), 1);  // No, idk why I need a timeout but I do
    },
    error: (title, content) => window_api.create(title, "error", `<p style = "margin: 10px;">${content}</p>`)
};
