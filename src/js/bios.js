for (const style of document.querySelectorAll("style:not(#bios-css)")) style.sheet.disabled = true;
function boot() {
    document.querySelector("body").innerHTML = `
        <h1>iiPython OS</h1>
        <div>
            <span>Loading system files...</span>
            <div id = "progress"><div></div></div>
        </div>
    `;
    document.querySelector("body").style.display = "flex";
    const progress = document.getElementById("progress");
    function update(i) {
        progress.querySelector("div").style.width = `${i}%`;
        if (i === 100) {
            document.getElementById("bios-css").remove();
            for (const style of document.querySelectorAll("style")) style.sheet.disabled = false;
            document.querySelector("body").innerHTML = `
                <main></main>
                <footer>
                    <div id = "start" class = "hidden window">
                        <div>
                            <span>iiPython OS</span>
                        </div>
                        <div id = "menu-entries"></div>
                    </div>
                    <button>
                        <i class = "icon icon-iipython"></i>
                        Start
                    </button>
                    <div class = "vertical-space"></div>
                    <div id = "tasklets"></div>
                    <div class = "vertical-space"></div>
                    <span id = "clock"></span>
                </footer>
            `;
            return os_init();
        }
        setTimeout(() => update(i + 1), 50);
    }
    update(0)
}
(async () => {
    const version = document.querySelector(`meta[name = "iipython-version"]`).getAttribute("content");
    document.getElementById("version").innerText = version;

    // Handle tables
    const rows = document.getElementById("rows");
    function add_table() {
        const table = document.createElement("table");
        table.innerHTML = "<tbody></tbody>";
        rows.appendChild(table);
        return table;
    }
    function add_row(table, key, value) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${key}</td>
            <td>:</td>
            <td>${value}</td>
        `;
        table.querySelector("tbody").appendChild(row);
        return row.querySelector("td:last-child");
    }

    // Handle fingerprinting the browser
    const expressions = [
        { name: "Safari", engine: "Webkit", regex: /Mozilla\/5\.0 \(Macintosh; .*\) AppleWebKit\/[\d.]+ \(KHTML, like Gecko\) Version\/([\d.]+) Safari\/[\d.]+/ },
        { name: "Chrome", engine: "Blink", regex: /Mozilla\/5\.0 \(.*\) AppleWebKit\/[\d.]+ \(KHTML, like Gecko\) Chrome\/([\d.]+) Safari\/[\d.]+/ },
        { name: "Firefox", engine: "Gecko", regex: /Mozilla\/5\.0 \(.*\) Gecko\/\d+ Firefox\/([\d.]+)/ }
    ]
    for (const expression of expressions) expression.version = expression.regex.exec(navigator.userAgent);
    const browser = (expressions.filter(e => e.version) || [{ name: "Unknown", engine: "Unknown", version: [null, "..."] }])[0];
    const storage = await navigator.storage.estimate();

    // Start dumping information
    const date_config = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
    const current = {
        table: null,
        index: 0,
        items: [
            { name: "Logical Processors", value: navigator.hardwareConcurrency },
            { name: "Storage Quota",      value: `${Math.round(storage.quota / 1024)}K` },
            { name: "Storage Usage",      value: `${Math.round(storage.usage / 1024)}K` },
            { name: "System Host",        value: navigator.platform.split(" ")[0], table: true },
            { name: "Web Engine",         value: `${browser.name} ${browser.version[1].split(".")[0]} / ${browser.engine}` },
            { name: "System Time",        value: "", table: true, callback: (el, cb) => {
                el.innerText = new Date().toLocaleString("en-US", date_config);
                setTimeout(() => cb(el, cb), 1000);
            } },
            { name: "Timezone",           value: Intl.DateTimeFormat().resolvedOptions().timeZone }
        ]
    };
    function dump() {
        const new_item = current.items[current.index];
        if (new_item.table || !current.table) current.table = add_table();
        const row = add_row(current.table, new_item.name, new_item.value);
        if (new_item.callback) new_item.callback(row, new_item.callback);
        current.index += 1;
        if (current.index !== current.items.length) setTimeout(dump, 200);
        else {
            const now = new Date();
            rows.appendChild(document.createElement("div"));
            const foot = document.createElement("footer");
            foot.innerHTML = `
                <span>Press <span class = "highlight">ENTER</span> to continue startup.</span>
                <span>IIPYTHON/${now.getFullYear().toString().slice(2)}/${now.getTime().toString().replace(/(\d{3})(?=\d)/g, "$1-")}/${version}</span>
            `;
            rows.appendChild(foot);

            // Handle pressing ENTER
            const beep = new Audio("data:audio/ogg;base64,T2dnUwACAAAAAAAAAABWqXJ6AAAAAA50KRIBE09wdXNIZWFkAQI4AYC7AAAAAABPZ2dTAAAAAAAAAAAAAFapcnoBAAAA26Qt7gP//ydPcHVzVGFncwwAAABMYXZmNjEuNy4xMDASAAAAHQAAAGVuY29kZXI9TGF2YzYxLjE5LjEwMCBsaWJvcHVzDwAAAFRSQUNLTlVNQkVSPTEvMRgAAAB0aXRsZT0xMDFzb3VuZGJvYXJkcy5jb20ZAAAAYXV0aG9yPTEwMXNvdW5kYm9hcmRzLmNvbR4AAABBTEJVTUFSVElTVD0xMDFzb3VuZGJvYXJkcy5jb20YAAAAYWxidW09MTAxc291bmRib2FyZHMuY29tGwAAAGdyb3VwaW5nPTEwMXNvdW5kYm9hcmRzLmNvbRsAAABjb21wb3Nlcj0xMDFzb3VuZGJvYXJkcy5jb20ZAAAAbHlyaWNzPTEwMXNvdW5kYm9hcmRzLmNvbRkAAABhcnRpc3Q9MTAxc291bmRib2FyZHMuY29tHAAAAGNvcHlyaWdodD0xMDFzb3VuZGJvYXJkcy5jb20MAAAAZ2VucmU9U3BlZWNoHgAAAGRlc2NyaXB0aW9uPTEwMXNvdW5kYm9hcmRzLmNvbRsAAABzeW5vcHNpcz0xMDFzb3VuZGJvYXJkcy5jb20XAAAAc2hvdz0xMDFzb3VuZGJvYXJkcy5jb20dAAAAZXBpc29kZV9pZD0xMDFzb3VuZGJvYXJkcy5jb20aAAAAbmV0d29yaz0xMDFzb3VuZGJvYXJkcy5jb20XAAAAeWVhcj0xMDFzb3VuZGJvYXJkcy5jb21PZ2dTAAQnIwAAAAAAAFapcnoCAAAAj/2oRhT/q/+7/yH/Pv9D/z//SP9I/4n/2vy1UvzUjMlsn7gnQCmBNEz37WlvsuocNIRzgPcT9CqJETlrbWzVhhvn7rkihpQlZSYmiBwNN/yYCIziHzehPlnXEF/wtK14BxVcS+FPKWDLbap8AfFzyTQ6QvnLGixQ6XTitxMHiGMQl+OPmSD/5vlFix1Grre5eLjk5z4f0CT10WeKrfW5m3RKL8prHP2dy0LvU5Dr0WHktCWHagT57hez0PbNgqZeBp/tT9W3a1EhcXR+XfkvhPf/vE6nLvzdyQFmBCvQEUfGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLJKXsA+Ms10PvNEVmdT/pQ4DFojjW6jFOMafgzkVkC4mKQrsMEgyPVLVwL0onw5hctCSEAEBv17SEpRDhDhxAQIDRPg/lt2dwFQ0gRMgAgAAAFOQX7g4DITtM3ykP+HpcTgPy1KYRyXk8uiFUv5nikLSLvH5NQSMtnKzYg04vXNTOqGgJVt00chU88mTch/RSsOxhK11aK/IFRfkTbsJOr7nxS6DKwAw4HqCfQWgIbyjmNz4VBjK4QUcMeeJSzOfKnZJFqQ8rYhCC5x+O16MwFlrQJMJY5pee3dpWn2bGjzIoi5DRcq31A/H80cujwGDhXeS8syLqzi+HkVvwIM7iSEQSOnBxLAE6rJiWAxn6IXzrNbkt2RZwNCyvWXErktNdkaE9D8gKHTv0XWwZALgXWzEfwS2IWAJL/xQtKNmgA86/vM440450TLBK8lbtXXZYevGKA1WUABWWDrXiIPRajVNQxq/ID3s5SZUXdEEAW0H097/BH111Es/1SMsFHtXkq24uW8hvO+94q6pXv0qQ/VjVmkp4FZ2cRuSrJ+YxOAH4znQq0qAeuX9Vpsi+5LGXW4kN1qBAKRqfARCQNHmHr6nqMGbFfC0PbaKSTFRW/9BfN56G8bDQLGCdSXPd6ru0c5t7GioH2M1hmKWwBXsRl2pj5boGyw6D6RfaaUyWkRhDXMVd75Xe05n7bcm7aRRnCYVryVeGd8UrrnGL8sB9OuO1NoiI14rTsAsN8M3pKnrxIhrq8uvhH6ZwD5I8f3u6AG85eOb6l583qu/GWn/ca+WSSW8O/tmQMgXXs7hVuoJRcK2KwIuCHEIubegh04CuUF9I1eKFkjskNgqcVnG5hTP58XAn7FzbdGZ7AI7cXlzHwAB+CbBq4AQihHwDj+wnMUIRLlrgSNC4loskJE5GrI/P3edAv9ducsQIDWV0Q43HudaQxxERUXIvAWhq7757Rholkz6iH+Rko1HSJZDxdidSf0qksrRa8ESQoAPhkzHiSvubS4LtXvgWGE/PHndDx7R8bt8TKT2K+AjplmP52AUAvy+cZqSF7CeAsdjuGrwmVS3BJwlVyxnjS2I8BjTxc5Ird48IL6XO3YaT8rUWOG4uRWI8BTH/h9XjHuK6d/BNU0g66k0w5mPXokHyvFpvFgyI8linXy5tirWLrYcavS7+2h55IEmiTH+YgGIIX9ph3Fub6QaJ9u5eK7jlqcqqsqtiu8EmyjU/uWfZ8qSejg4Qsy1hI2Jf2Er4pac9oC/px5qbMRfEsd65sWH/ScWdQ8QLTKNPw5Z8Q1pUh+yCAbh9bPZEfLHdzb+mGxajnkaBhLnANUqjHsyiZsG1e1pPCLvlnbUkMgW+BcNWwBdHmM1YDLLTNP9rn7Rd71N8XCFwSztJPHmIFDGz7tFsDetVw7u3B3JeDW04Ey5v1jq4L8BQ7CXF8A5+h3JbeMk1jIle1XDP1cqFVfDh/r8Uux034iD12kRYCBM+NvQ39XOdmDwcCWl9YmC9H8u1tlshKphc63p3hwivxpPy2TYYpu/XwAOEOUt22vlkWEgvCkH7qLZb0JylmRh6Fedi8cilrhWuVgjd4sQ1eHhaYqAYnPh69K0K2nfRKjK97D0QFYor1HSHY2KXQPX9lTBWiy1oyHrh+XKaG9FD1Qc+fYTwn2PbYJXRgmqwOl97iFhWtme6ick1nWtuCpvyPMF7jgXON5OfaccxtJg/WyJMy3D/76cL6Yt0imyYMN/4ApS8jr3LMPIUwKsVT3MZ7zQzrNxlzrUFvlBoCot4DJMtN32NT8+2uZHqZparP/yP9MYUs4DzzsK6VZ2xGp32ryT7e3fm6j1+b5/GyqytBQhfJ7RMJ391v+w0eFFXZ3K9RzbawDhrSELp/6LVWg6E58creQ8TXVdvAd8MlBJaRy1yJClTcfe1t3cySDHr2mwB/WSOJqNqONlWTxxM0eAY1taT8u6fjcYu5cbn2eLmiBpyCX4+4K1TMwKSzXOYMRBR36JwOyJtLdbBP0NHtMe4OKI97PnndcgJOn3VwEuSm1tOhufGE2/+6rUwR897h6AAPoFMfjlu9Z0IWvKBY4eROQ0Noi9RGxAdPdu9k8N/+yGELrInnUywSvVbEaQok0auPtg3CXN1+JcUvqvp8bFSW8e2jJPkfy1bKgCCOKAAAa9/oquCCrHamV5wo8SIK+2sJwPP0RPPx/u411Om5yIWLsuqO/5bG106rdUe9ZE9CjOPUmGNDEh43Sch1nnSaihagKWDx0LtSAjWiyFEbyGl1NT5FbpzUHTyRK/0vasEgUdogTElwHGqxaBFRBMDyBwLgFqmTTQxm2FJTqlChlrlOkqx+SvhfWGQUwUkBebqPVyKZMhbcqYPJv7w3/rnOw6T8u6LgjsZyURJAlCVIFcMGqHb4xjXnHPgdOanxHBGAbXuxsg1Vny+5+yoWlCWDaQM23hce9gI0pZIJmtZQHGb5QGyz6bNqcW219+Ml/UqG1MCHqYPQUSVbzej4UFxBGQTheQrPOI61xAgEQ9Ay4dzMbrpWUoI+IVURdijrLj/q97BOs2QCUuLkOvr88yFJGWy+QzuzEvTnxLtGc8pz9DqPvbDxXAAmpdAAAC7CaM1ZxNl9xqR/+F5CETTzs2O2FsJROapaEk/9elTjP7k5C1rhxNSVYgcQ+ISsu5Jii9RH+qWg1Zkc5ruk1mlusOQW9+kjjJvxLXTdPRniZHl+tmj7L6n0flK7osWVhzyJyHL4+d2H27SLPIDcO93T/jv2BFe0AxzoYrh8kR2nI2TG8MYfodP7Sop4RNaZVakbhUOWGaIyfehCQaT8u4G0scI60maJc8xhBkQpoGEsgtsNiOXdUYtGW1xeaPsEckNLpbW6cG/TOXUWH+aCWlBrabJV2W7CXJxbx/6JD9kl0Ty23/gxWFOZwzg4U0vRXx+V4SCvFSXH6nfjvYP+sp4lbFFt1pu1HbrMdcIeKXzO2SX7qJNtl3uiXaLg1804jwuRi0Ji9VpTDgvKVAiSOlZIqUDgjv38llUFDdk4yWYZXGkNqJdSKXoNbh5vdQ6xaNhvN/ZxdbvQfh0TCXXdJ4iMvpszUTxs9wsNl2Cf65eTR7ukl8JJirWZ7Q8hXF1x68bOr5hewMp0F0shm2vXNtved+AVutWYwsGdjbY5iw7MVJRaoGkT9VZmKMXjRNM1M7thASrrBq3PWftCOmAreR+Bjzf5JW6mW0EMXdjm11zuyGlCxCKNJuSSpE6V0w+4sgiEi6T8v1PtEUmexLLlsj7ybQQL3WodrN07xNyyVIvQYNcRdTgN0zk5TqsFm/WOp2sjeC7Uds1fl5ViC2P2lBHum6SfF+3sWVrAl+mb0rINbHT2Iu9sNYrhwiqO8zHqj+DmkRlwujmAXLWijFs3nb2VHGCWEdwP2sx/7gkfxhKScXLmMZUg5eebeCLhVVJWYEcKSRiJhW1BQNvcUIFr8PL5viiLDCETOgZi8bRo6Zw7kiYVF1/fgmuIlD4NndjsIqtUPZH1HjD1tZtHKlaM7Z66AmDLlhGiQj5SosBbWTFuheEaq1qWxUFETQI22u8MwYjwMYLCvJexqFbc+np7pZUz+YLQnFwMwe2s02mFmplTcVzlQ8541y++Zayx+ktIKygIHhBoF7QI70HVHr/YgfpJWqJDw7jlCJac2tItJ8fi60Oj6IDJjQ7rufibvVuB5+Nw92o8QfX5sRdo5jUPIl7WfQFqkdwOAOqaGKRd/bPnxAkXTNVBQ8KKQRAvTbJwTslycKtRQ3kyxk2qpPx5ado/5bhUt4Fa0de6s3cYJaqkaPsDvcqi5Wk3RQMCtFGFeeaC44Mz+tHLSOX3s1laBmMgQLjh7Gmm1EeFc6tTI5VuhkUU25im5pudUQatbrSxJNzyGJnO5yHtOBwZJuxWHAIpaDCjkb9F2ltrs+/L2LhbJmTY6QdBGzUMKfbtW5DZeODlbtZdMGNY1N9kpTX0TCXpOYEIu+4GmwA5kAZa/GLegB3w3DOLHs0JimFDc2yqYBhskEs3QKae0rpbXALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAbVthYp+S14zKfwZ+VHP36GD4nW1pYlWJTThhtnHOT74gV43E/r+syLhg/UA5WkKbWQMw4Y4wDRZgheNiDUrVeYCSZ8mUAicsqFnHnWmIVk62qDCCDsnSTlC0E2nr582nP91p+x+s58Ti82rYjYjvspgKSIUSWCjUeejsez5xaRF3qVaGCDE8uv2gqQeZlNjmC2Dyn5K/RbLT90TEtAfqQLTcL0GNr+iBXjTDEWUjvBphj7kj3SwKleoynS568x3BN9wujhkhNFJHWgnMgfpcJDevLwlu");

            function catch_enter(e) {
                if (e.key !== "Enter") return;
                beep.play();
                document.removeEventListener("keydown", catch_enter);
                boot();
            }
            document.addEventListener("keydown", catch_enter);
        }
    }

    const mem = add_row(add_table(), "Memory Test", "0K");
    const kb = (navigator.deviceMemory || 16) * 1048576;
    function update_memory_test(value) {
        mem.innerText = `${value}K`;
        if (value < kb) setTimeout(() => update_memory_test(value + 1048576), 200);
        else {
            mem.innerText = `${value}K OK`;
            dump();
        }
    }
    update_memory_test(0);
})();
