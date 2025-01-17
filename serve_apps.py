# Copyright (c) 2025 iiPython

# Modules
from math import atan
import re
import base64
from pathlib import Path
from binascii import Error

from requests import Session
from bs4 import BeautifulSoup

from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from requests.exceptions import SSLError

# Handle loading apps
apps_path = Path("apps")
def generate_app_data() -> dict:
    apps = {}
    for file in apps_path.rglob("**"):
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

    return apps


# Routing
app = FastAPI(openapi_url = None)
app.add_middleware(CORSMiddleware, allow_origins = ["*"], allow_credentials = True, allow_methods = ["*"], allow_headers = ["*"])

@app.get("/apps.json")
async def route_apps() -> JSONResponse:
    return JSONResponse(generate_app_data())

# Proxying
session = Session()
CSS_URL_REGEX = re.compile(r"url\(['\"]?([^\"')]+)['\"]?\)")

@app.get("/ie/{url:str}", response_model = None)
async def proxy_ie_url(url: str) -> Response | HTMLResponse:
    try:
        response = session.get(base64.b64decode(url.encode()).decode())
        domain = "/".join(response.url.split("/")[:3])

        content = response.content

        def encode(url: str) -> str:
            return base64.b64encode(url.encode()).decode()

        def fix_url(url: str) -> str:
            url = f"https://{url}" if url[:2] == "//" else url
            return url if url[0] != "/" else f"{domain}{url}"

        content_type = (response.headers.get("Content-Type") or "").split(";")[0]
        if content_type == "text/css":
            for item in CSS_URL_REGEX.findall(response.text):
                content = content.replace(item.encode(), encode(fix_url(item)).encode())

        if content_type == "text/html":
            html = BeautifulSoup(response.text, "html.parser")
            def replace(tag: str, attrib: str) -> None:
                for item in html.find_all(tag):
                    try:
                        item[attrib] = f"http://localhost:8001/ie/{encode(fix_url(item[attrib]))}"

                    except KeyError:
                        pass

            for (tag, attrib) in [("a", "href"), ("link", "href"), ("script", "src"), ("img", "src")]:
                replace(tag, attrib)

            return HTMLResponse(str(html), headers = {"X-New-Url": response.url})

        return Response(
            content,
            headers = {"Content-Type": response.headers["Content-Type"], "X-New-Url": response.url}
        )

    except Error:
        return HTMLResponse("<p>The specified URL is invalid.</p>")

    except SSLError:
        return HTMLResponse("<p>SSL error when attempting to connect.</p>")
