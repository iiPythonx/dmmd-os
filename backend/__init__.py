# Copyright (c) 2025 iiPython

# Modules
import re
import os
from pathlib import Path

from requests import Session
from bs4 import BeautifulSoup

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Handle loading apps
apps_path = Path(__file__).parents[1] / "apps"
def generate_app_data() -> dict:
    apps = {}
    for file in apps_path.rglob("*"):
        if not file.is_file():
            continue

        directives, processed_content = {}, []
        for line in [line for line in file.read_text().splitlines() if line.strip()]:
            if line[0] != "!":
                processed_content.append(line)
                continue
            
            directive_data = line.split(":")
            directives[directive_data[0][1:].strip()] = ":".join(directive_data[1:]).strip()

        apps[str(file.relative_to(apps_path).with_suffix(""))] = directives | {"html": "\n".join(processed_content)}

    print("[+] Regenerated app data")
    return apps

# Routing
app = FastAPI(openapi_url = None)
app.add_middleware(CORSMiddleware, allow_origins = ["*"], allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])

app.state.cached_apps = None
if os.getenv("ENV") == "prod":
    app.state.cached_apps = generate_app_data()

@app.get("/apps.json")
async def route_apps() -> JSONResponse:
    return JSONResponse(app.state.cached_apps or generate_app_data())

# Proxying
session = Session()
TARGET_URI = os.getenv("PUBLIC_URL")
CSS_URL_REGEX = re.compile(r"url\(['\"]?([^\"')]+)['\"]?\)")

@app.get("/ie/{url:path}")
async def proxy_ie_url(request: Request, url: str) -> Response:

    # This proxy is /intended/ to be basic.
    # It doesn't support URL rewriting from JS, POSTing to forms, etc.
    content_type = "text/html"
    try:
        response = session.get(f"https://{url}", params = request.query_params)
        content = response.content

        def fix_url(raw_url: str) -> str:
            raw_url = raw_url.removeprefix("//").removeprefix("https://")
            raw_url = raw_url if raw_url[0] != "/" else f"{url.split('/')[0]}{raw_url}"
            return f"{url}/{raw_url}" if "/" not in raw_url or "." not in raw_url.split("/")[0] else raw_url

        content_type = (response.headers.get("Content-Type") or "").split(";")[0]
        match content_type:
            case "text/css":
                for item in CSS_URL_REGEX.findall(response.text):
                    if not item.strip():
                        continue

                    content = content.replace(item.encode(), f"{TARGET_URI}/ie/{fix_url(item)}".encode())

            case "text/html":
                html = BeautifulSoup(response.text, "html.parser")
                def replace(tag: str, attrib: str) -> None:
                    for item in html.find_all(tag):
                        try:
                            if not item[attrib].strip():
                                continue

                            item[attrib] = f"{TARGET_URI}/ie/{fix_url(item[attrib])}"

                        except KeyError:
                            pass

                for (tag, attrib) in [("a", "href"), ("link", "href"), ("script", "src"), ("img", "src")]:
                    replace(tag, attrib)

                content = str(html)

    except Exception:
        content = "<p>Failed to load the specified URL.</p>"

    return Response(content, headers = {"Content-Type": content_type})
