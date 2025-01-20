// Copyright (c) 2025 iiPython
const window_api = {
    focus: (id) => {
        for (const tasklet of document.querySelectorAll("button[window-id]")) {
            tasklet.classList.remove("active");
            document.querySelector(`article[window-id = "${tasklet.getAttribute('window-id')}"]`).style.zIndex = "4";
            document.querySelector(`article[window-id = "${tasklet.getAttribute('window-id')}"] .title-bar`).classList.add("inactive");
        }
        document.querySelector(`article[window-id = "${id}"]`).style.zIndex = "5";
        document.querySelector(`article[window-id = "${id}"] .title-bar`).classList.remove("inactive");
        document.querySelector(`button[window-id = "${id}"]`).classList.add("active");
    },
    kill: (id) => {
        for (const i of document.querySelectorAll(`[window-id = "${id}"]`)) i.remove();
    },
    create: (props) => {
        const { title, icon, html, size, space, resize } = props;
        const id = Math.random().toString(36).substring(2, 8);
        const app = document.createElement("article");
        app.classList.add("window");
        app.innerHTML = `
            <div class = "title-bar">
                <div class = "title-bar-text">
                    <i class = "icon icon-${icon}"></i>
                    ${title}
                </div>
                <div class = "title-bar-controls">
                    <button aria-label = "Minimize">
                    <button aria-label = "Maximize" disabled>
                    <button aria-label = "Close">
                </div>
            </div>
            <div class = "window-body"></div>
        `;
        app.setAttribute("window-id", id);
        
        if (size) {
            const [x, y] = size.split("x");
            app.style.width = `${x}px`, app.style.height = `${y}px`;
        }
        if (resize === "no") app.style.resize = "none";
        
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
        app.querySelector(`button[aria-label = "Minimize"]`).addEventListener("click", () => {
            tasklet.classList.remove("active");
            app.classList.toggle("hidden");
            if (app.classList.contains("hidden")) app.style.zIndex = "4";
        });
        app.querySelector(`button[aria-label = "Close"]`).addEventListener("click", () => window_api.kill(id));
        
        // Handle dragging
        app.querySelector(".title-bar").addEventListener("mousedown", (e) => {
            window_api.focus(id);
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
        const root = app.querySelector(".window-body").attachShadow({ mode: "open" });
        root.innerHTML = html;
        attach_api_to_shadow_dom(root);
        
        const css = new CSSStyleSheet();
        for (const style of [...document.styleSheets].filter(s => s.title === "include")) {
            for (const rule of style.cssRules) css.insertRule(rule.cssText);
        }
        root.adoptedStyleSheets = [css];

        // Load JS
        for (const script of root.querySelectorAll("script")) {
            const new_script = document.createElement("script");
            new_script.textContent = `
                (async () => {
                    const dom = document.querySelector("article[window-id = '${id}'] .window-body").shadowRoot;
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
        if (space) app.querySelector(".window-body").style.margin = `${space}px`;

        // Position it in the center
        app.style.top = `calc(50% - (${window.getComputedStyle(app).height} / 2))`;
        app.style.left = `calc(50% - (${window.getComputedStyle(app).width} / 2))`;
        setTimeout(() => window_api.focus(id), 1);
    },
    error: (title, content) => window_api.create({
        title: title, icon: "error", html: `<p style = "margin: 10px;">${content}</p>`, resize: "no"
    })
};
