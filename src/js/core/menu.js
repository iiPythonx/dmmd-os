// Copyright (c) 2025 iiPython

class ExecutableHandler {
    constructor() {
        this.sources = [];
        this.executables = {};
    }

    async load_executables() {
        if (!this.sources.length) {
            const sources = await db.get("app-sources");
            this.sources = sources ? JSON.parse(sources) : [
                {
                    url: "https://os.iipython.dev",
                    status: null,
                    apps: null
                },
                {
                    url: "http://localhost:8001",
                    status: null,
                    apps: null
                }
            ];
        }

        let source_failure = false;
        for (const origin of this.sources) {
            try {
                const apps = await (await fetch(`${origin.url}/apps.json`)).json();
                origin.status = true, origin.apps = Object.keys(apps).length;
                this.executables = { ...this.executables, ...apps };
            } catch {
                origin.status = false;
                source_failure = true;
            }
        }

        db.set("app-sources", JSON.stringify(this.sources));
        if (source_failure) {
            if (this.executables["sys/settings/sources"]) exe.launch("sys/settings/sources");
            else window_api.error("Source problem", "No source connections were successful, as a result no apps are available.");
        }

        // Handle first boot (if loading was successful)
        if (!+(await db.get("core.first_boot")) && this.executables["sys/firstboot"]) {
            exe.launch("sys/firstboot");
            db.set("core.first_boot", 1);
        }
    }

    launch(name) {
        const exec = this.executables[name];
        if (!exec) {
            console.error("Attempted to launch a non-existant executable:", name);
            return window_api.error("Not found", "The specified executable doesn't exist.");
        }
        window_api.create(exec);
    }

    find(name) {
        if (!this.executables[name]) return {
            name: name,
            icon: "folder",
            exec: name
        };
        return {
            ...this.executables[name],
            ...{ exec: name }
        }
    }
}

const exe = new ExecutableHandler();
await exe.load_executables();

// Start menu structure
function build_menu(structure, parent) {
    for (const item of structure) {
        if (item.type === "space") {
            parent.appendChild(document.createElement("hr"));
            continue;
        }
    
        const button = document.createElement("button");
        button.innerHTML = `<i class = "${parent.id === "menu-entries" ? "icon-big" : "icon"} icon-${item.icon}"></i> ${item.name}`;
        parent.appendChild(button);
    
        if (item.exec.constructor === Array) {
            var active = false;
            button.addEventListener("mouseleave", () => {
                const child_list = button.querySelector("div");
                if (child_list) child_list.remove();
                active = false;
            });
            button.addEventListener("mouseover", () => {
                if (active) return;
                active = true;
                const child_list = document.createElement("div");
                child_list.classList.add("window");
                build_menu(item.exec, child_list);
                button.appendChild(child_list);
            });
        } else {
            button.addEventListener("click", () => exe.launch(item.exec));
        }
    };
}

const start_menu_struct = [
    {
        name: "Programs",
        icon: "programs",
        exec: [
            exe.find("notepad"),
            exe.find("calc"),
            {
                name: "Games",
                icon: "folder",
                exec: [
                    exe.find("games/minesweeper")
                ]
            },
            exe.find("sys/cmd"),
            exe.find("cooldude"),
            exe.find("iexplore")
        ]
    },
    {
        name: "Settings",
        icon: "settings",
        exec: [
            exe.find("sys/firstboot"),
            exe.find("sys/settings/main"),
            exe.find("sys/settings/menu"),
            exe.find("sys/settings/sources"),
        ]
    },
    exe.find("menu/help"),
    exe.find("menu/run"),
    { type: "space" },
    {
        name: "Shut down...",
        icon: "shutdown",
        exec: "shutdown"
    }
];
build_menu(start_menu_struct, document.getElementById("menu-entries"));
