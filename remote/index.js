// Copyright (c) 2025 iiPython

const cheerio = require("cheerio");

const version = "0.1.0";
const domain_regex = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/;
const css_url_regex = /url\(['\"]?([^\"')]+)['\"]?\)/g;
const html_replaced_tags = [["a", "href"], ["link", "href"], ["script", "src"], ["img", "src"]];

function problem(message) {
    return new Response(`
        <!doctype html>
        <html lang = "en">
            <head>
                <style>
                    body, html {
                        font-family: monospace;
                        color: #fff;
                        background-color: #000;
                    }
                    body {
                        margin: 20px;
                    }
                    h4 {
                        color: #000;
                        padding: 10px;
                        width: fit-content;
                        background-color: red;
                    }
                </style>
            </head>
            <body>
                <h4>iiPython Remote v${version}</h4>
                <span>${message}</span>
            </body>
        </html>
    `, { headers: { "Content-Type": "text/html" }, status: 400 });
}

export default {
    async fetch(request, env) {
        const target = new URL(request.url);
        if (target.pathname === "/") return problem("No remote specified to connect to.");
        if (!domain_regex.test(target.pathname.slice(1).split("/")[0])) return problem("The specified domain is invalid.");

        // Handle processing
        const target_url = `https://${target.pathname.slice(1)}${target.search}`;
        try {
            const response = await fetch(target_url, { signal: AbortSignal.timeout(5000) });
            const content_type = (response.headers.get("Content-Type") || "").split(";")[0];
            
            // Handle URL rewriting
            function rewrite(url) {

                // You want regex hell? You got it.
                return `${env.PUBLIC_URL}/${url.replace(/^https\:\/\//, "").replace(/^(?!https\:\/\/|\/\/)\.?\/?/, target.pathname.slice(1).split("/")[0] + "/")}`;
            }

            // Process the specific types
            let override_content = null;
    
            switch (content_type) {
                case "application/javascript":
                case "text/css":
                    override_content = (await response.text()).replace(css_url_regex, (_, replace) => `url("${rewrite(replace)}")`);
                    break;
                    
                case "text/html":
                    const $ = cheerio.load(await response.text());
                    for (const [tag, attrib] of html_replaced_tags) {
                        for (const item of $(tag)) {
                            if (item.attribs[attrib]) item.attribs[attrib] = rewrite(item.attribs[attrib])
                        };
                    };
                    override_content = $.html();
                    break;
            }
    
            // Return response
            return override_content ? new Response(override_content, { headers: { "Content-Type": content_type } }) : response;

        } catch(e) {
            if (e.code === 23) return problem(`The specified URL went past the 5 second timeout.<br>URL component: ${target_url}`);
            return problem(`Failed to load the specified URL, check if it's valid.<br>URL component: ${target_url}`);
        }
    }
}
