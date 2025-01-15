// Copyright (c) 2025 iiPython

// Some basic icons
const FOLDER_ICON = "{% include 'icons/folder.ico' %}";

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
        if (source_failure && this.executables["sys/settings/sources"]) exe.launch("sys/settings/sources");

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
            return create_error("Not found", "The specified executable doesn't exist.");
        }
        create_application(exec.title, exec.icon, exec.html, exec.size);
    }

    find(name) {
        if (!this.executables[name]) return {
            name: name,
            icon: FOLDER_ICON,
            exec: name
        };
        return {
            ...this.executables[name],
            ...{ exec: name }
        }
    }
}

window.exe = new ExecutableHandler();
await exe.load_executables();

// Start menu structure
function build_menu(structure, parent) {
    for (const item of structure) {
        if (item.type === "space") {
            parent.appendChild(document.createElement("hr"));
            continue;
        }
    
        const button = document.createElement("button");
        button.innerHTML = `<img src = "${item.icon}"> ${item.name}`;
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
        icon: "{% include 'icons/programs.ico' %}",
        exec: [
            exe.find("notepad"),
            exe.find("calc"),
            {
                name: "Games",
                icon: FOLDER_ICON,
                exec: [
                    exe.find("games/minesweeper")
                ]
            },
            exe.find("sys/cmd"),
            exe.find("cooldude")
        ]
    },
    exe.find("menu/favorites"),
    exe.find("menu/documents"),
    {
        name: "Settings",
        icon: "{% include 'icons/settings.ico' %}",
        exec: [
            exe.find("sys/firstboot"),
            exe.find("sys/settings/main"),
            exe.find("sys/settings/menu"),
            exe.find("sys/settings/sources"),
        ]
    },
    exe.find("menu/find"),
    exe.find("menu/help"),
    exe.find("menu/run"),
    { type: "space" },
    {
        name: "Back to Bootloader...",
        icon: "{% include 'icons/shutdown.ico' %}",
        exec: "shutdown"
    }
];
build_menu(start_menu_struct, document.getElementById("menu-entries"));
