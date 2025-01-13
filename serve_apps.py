# Copyright (c) 2025 iiPython

# Modules
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Routing
app = FastAPI(openapi_url = None)
apps_path = Path("apps")

@app.get("/apps.json")
async def route_apps() -> JSONResponse:
    apps = {}
    for file in apps_path.rglob("**"):
        if file.is_dir():
            continue

        content = file.read_text()
        data = [line[2:] for line in content.splitlines()[:3]]
        apps[str(file.relative_to(apps_path).with_suffix(""))] = {
            "name": data[0],
            "icon": data[1],
            "title": data[2],
            "html": "\n".join(content.splitlines()[3:])
        }

    return JSONResponse(apps)
