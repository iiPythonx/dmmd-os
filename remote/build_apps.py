# Copyright (c) 2025 iiPython

# Modules
import json
from pathlib import Path

# Handle loading apps
apps_path = Path(__file__).parents[1] / "src/apps"
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

(Path(__file__).parents[1] / "dist/apps.json").write_text(json.dumps(apps))
