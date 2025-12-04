#!/bin/bash
# Start the FastAPI server with auto-reload
# Using the simple_api.py which has the /simulate/year endpoint
uvicorn simple_api:app \
    --host 0.0.0.0 \
    --port 8001 \
    --reload \
    --log-level info
