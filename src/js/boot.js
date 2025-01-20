async function os_init() {
    {% include "js/core/modules/database.js" %}
    {% include "js/core/modules/files.js" %}
    {% include "js/core/window.js" %}
    {% include "js/core/api.js" %}
    {% include "js/core/menu.js" %}
    {% include "js/core/desktop.js" %}

    // For the love of god, don't try "rebooting" the OS.
    window.os_init = undefined;
}
