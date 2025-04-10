#!/usr/bin/env python3
"""
Solar PV Technical Report Generation API

This module provides a FastAPI server that wraps the report generation functionality,
making it accessible via HTTP endpoints.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from run_report import main as generate_report
from models import ReportRequest, ReportResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('report_api.log')
    ]
)

# Create FastAPI app
app = FastAPI(
    title="PV Technical Report Generator API",
    description="API for generating comprehensive Solar PV technical reports",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate", response_model=ReportResponse)
async def generate_technical_report(request: ReportRequest) -> ReportResponse:
    """
    Generate a technical report based on the provided project data.
    """
    try:
        logging.info(f"Received report generation request for project: {request.project_name}")
        
        # Call the report generation function
        success = generate_report(
            project_name=request.project_name,
            project_specs=request.project_specs,
            components=request.components,
            calculation_results=request.calculation_results,
            templates=request.templates
        )
        
        # Read the generated report
        try:
            with open("output/final_document.md", "r") as f:
                report_content = f.read()
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="Report file not found after generation"
            )
            
        return ReportResponse(
            success=True,
            message="Report generated successfully",
            report_content=report_content
        )
        
    except Exception as e:
        logging.error(f"Error generating report: {str(e)}")
        return ReportResponse(
            success=False,
            message="Failed to generate report",
            error=str(e)
        )

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {
        "message": "PV Technical Report Generator API is running. POST to /generate to create a report."
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8002, reload=True)
