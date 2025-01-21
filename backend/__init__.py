# Copyright (c) 2025 iiPython

# Modules
import os
from pathlib import Path

from fastapi import FastAPI
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
