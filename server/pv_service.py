#!/usr/bin/env python3
"""
Unified Solar PV Service Interface

This module provides a FastAPI server that integrates both the PV simulation
and technical report generation services into a single interface.
"""

import logging
import sys
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add pvlib_api and tech_study to Python path
sys.path.append(str(Path(__file__).parent / 'pvlib_api'))
sys.path.append(str(Path(__file__).parent / 'tech_study'))

# Import PV simulation components
from SPVSimAPI import SPVSim
from APIModels import SimulationRequest, SimulationResponse

# Import report generation components
from run_report import main as generate_report
from models import ReportRequest, ReportResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pv_service.log')
    ]
)

# Create FastAPI app
app = FastAPI(
    title="Solar PV Service API",
    description="Unified API for PV simulation and technical report generation",
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

@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest) -> SimulationResponse:
    """
    Run a PV system simulation based on the provided parameters.
    """
    try:
        logging.info("Starting PV simulation")
        
        # Create and configure simulation
        sim = SPVSim()
        sim.configure_from_request(request)
        
        # Run simulation
        results = sim.execute_simulation()
        logging.info("Simulation completed successfully")
        
        return results
        
    except Exception as e:
        logging.error(f"Simulation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Simulation error: {str(e)}"
        )

@app.post("/generate-report", response_model=ReportResponse)
async def generate_technical_report(request: ReportRequest) -> ReportResponse:
    """
    Generate a technical report based on the provided project data.
    """
    try:
        logging.info(f"Starting report generation for project: {request.project_name}")
        
        # Generate report
        success = generate_report(
            project_name=request.project_name,
            project_specs=request.project_specs,
            components=request.components,
            calculation_results=request.calculation_results,
            templates=request.templates
        )
        
        # Read generated report
        try:
            report_path = Path(__file__).parent / "tech_study/output/report.md"
            with open(report_path, "r") as f:
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
        logging.error(f"Report generation error: {str(e)}")
        return ReportResponse(
            success=False,
            message="Failed to generate report",
            error=str(e)
        )

@app.post("/simulate-and-report")
async def simulate_and_generate_report(
    sim_request: SimulationRequest,
    report_request: ReportRequest
) -> ReportResponse:
    """
    Run a PV simulation and generate a technical report in one request.
    """
    try:
        # Run simulation first
        sim_results = await run_simulation(sim_request)
        
        # Add simulation results to report request
        report_request.calculation_results = sim_results.dict()
        
        # Generate report
        report_response = await generate_technical_report(report_request)
        return report_response
        
    except Exception as e:
        logging.error(f"Simulation and report generation error: {str(e)}")
        return ReportResponse(
            success=False,
            message="Failed to complete simulation and report generation",
            error=str(e)
        )

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {
        "message": "Solar PV Service API is running",
        "endpoints": {
            "simulate": "POST /simulate - Run PV system simulation",
            "generate-report": "POST /generate-report - Generate technical report",
            "simulate-and-report": "POST /simulate-and-report - Run simulation and generate report"
        }
    }

if __name__ == "__main__":
    uvicorn.run("pv_service:app", host="0.0.0.0", port=8001, reload=True)
