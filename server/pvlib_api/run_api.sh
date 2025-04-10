#!/bin/bash
# Start the FastAPI server with auto-reload
uvicorn core.api:app \
    --host 0.0.0.0 \
    --port 8001 \
    --reload \
    --log-level info
