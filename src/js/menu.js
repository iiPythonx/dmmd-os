// Copyright (c) 2025 iiPython

// Some basic icons
const FOLDER_ICON = "{% include 'icons/folder.ico' %}";
const ERROR_ICON = "{% include 'icons/error.ico' %}";

class ExecutableHandler {
    constructor() {
        this.executables = {};
    }

    async load_executables() {
        try {
            this.executables = await (await fetch("https://os.iipython.dev/apps.json")).json();
        } catch {
            create_application("Connection problem", ERROR_ICON, `<p style = "margin: 10px;">Failed to download apps from upstream.</p>`);
        }
    }

    launch(name) {
        const exec = this.executables[name];
        if (!exec) {
            console.error("Attempted to launch a non-existant executable:", name);
            return create_application("Not found", ERROR_ICON, `<p style = "margin: 10px;">The specified executable doesn't exist.</p>`);
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
            }
        ]
    },
    exe.find("menu/favorites"),
    exe.find("menu/documents"),
    {
        name: "Settings",
        icon: "{% include 'icons/settings.ico' %}",
        exec: [
            exe.find("sys/firstboot"),
            exe.find("sys/cmd")
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

// Handle first boot
if (!+localStorage.getItem("core.first_boot")) exe.launch("sys/firstboot");
