// Copyright (c) 2025 iiPython

// Some basic icons
const FOLDER_ICON = "{% include 'icons/folder.ico' %}";

// Executable list
const dom = new DOMParser();
const executables = Object.fromEntries(
    Object.entries({
        notepad:    `{% include 'apps/notepad.html' %}`,
        calc:       `{% include 'apps/calc.html' %}`,
        minesweeper:`{% include 'apps/minesweeper.html' %}`
    }).map(([exec, html]) => {
        const doc = dom.parseFromString(html, "text/html");
        return [exec, {
            name: doc.querySelector(`meta[name = "ios-name"]`).getAttribute("value"),
            icon: doc.querySelector(`meta[name = "ios-icon"]`).getAttribute("value"),
            title: doc.querySelector(`meta[name = "ios-title"]`).getAttribute("value"),
            html: html
        }];
    })
)

function launch_executable(executable_name) {
    const executable = executables[executable_name];
    if (!executable) return console.warn("no such executable", executable_name);
    create_application(
        executable.title,
        executable.icon,
        executable.html
    );
}
function identify_executable(executable_name) {
    if (!executables[executable_name]) return { name: executable_name, icon: FOLDER_ICON, exec: executable_name };
    return { ...executables[executable_name], ...{ exec: executable_name } };
}

// Start menu structure
const start_menu_struct = [
    {
        name: "Programs",
        icon: "{% include 'icons/programs.ico' %}",
        exec: [
            identify_executable("notepad"),
            identify_executable("calc"),
            {
                name: "Games",
                icon: FOLDER_ICON,
                exec: [
                    identify_executable("minesweeper")
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
                icon: "{% include 'icons/help.ico' %}",
                exec: "control panel"
            },
            {
                name: "Taskbar & Start Menu...",
                icon: "{% include 'icons/help.ico' %}",
                exec: "taskbar and start menu"
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
    },
    { type: "space" },
    {
        name: "Back to Bootloader...",
        icon: "{% include 'icons/shutdown.ico' %}",
        exec: "shutdown"
    }
];
build_menu(start_menu_struct, document.getElementById("menu-entries"));
