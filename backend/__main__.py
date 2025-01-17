# Copyright (c) 2025 iiPython

# Modules
import os
import sys
import uvicorn

# Launch
uvicorn.run(
    "backend:app",
    host = os.getenv("HOST", "127.0.0.1"),
    port = int(os.getenv("PORT", 8001)),
    reload = "--reload" in sys.argv
)
