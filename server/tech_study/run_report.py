#!/usr/bin/env python3
"""
Solar PV Technical Project Report Generator

This script orchestrates the generation of a comprehensive Solar PV Technical Project 
report by executing the calculation scripts and document generation in the correct order.
"""

import os
import subprocess
import sys
import time
import yaml
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('report_generation.log')
    ]
)

def load_config() -> Optional[Dict[str, Any]]:
    """Load configuration from config.yaml file."""
    script_dir = Path(__file__).parent
    try:
        with open(script_dir / "config.yaml", "r") as f:
            config = yaml.safe_load(f)
            logging.info("Configuration loaded successfully")
            return config
    except Exception as e:
        logging.error(f"Error loading configuration: {e}")
        return None

def check_environment():
    """Verify the required directory structure and files exist."""
    script_dir = Path(__file__).parent
    required_paths = [
        "data/components.yaml",
        "data/project_specs.yaml",
        "data/calculation_results",
        "scripts/calculate.py",
        "scripts/generate_document.py",
        "templates/fr/equipment.md",
        "templates/fr/cable_sizing.md",
        "templates/fr/grounding.md",
        "templates/fr/calculations.md",
        "templates/fr/protection.md",
        "output"
    ]
    
    missing_paths = []
    for path in required_paths:
        if not (script_dir / path).exists():
            missing_paths.append(path)
    
    if missing_paths:
        logging.error("The following required paths are missing:")
        for path in missing_paths:
            logging.error(f"  - {path}")
        return False
    
    return True

def run_calculations():
    """Execute the calculation script to process project data."""
    print("Step 1/3: Running PV system calculations...")
    
    try:
        script_dir = Path(__file__).parent
        result = subprocess.run(
            [sys.executable, str(script_dir / "scripts/calculate.py")],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(script_dir)  # Set working directory to script directory
        )
        logging.info("Calculations completed successfully")
        logging.info(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Error running calculations: {e}")
        logging.error(f"Error output: {e.stderr}")
        return False

def validate_calculation_results():
    """Verify that calculation results exist and are valid."""
    logging.info("Step 2/3: Validating calculation results...")
    
    script_dir = Path(__file__).parent
    calc_results_dir = script_dir / "data/calculation_results"
    if not calc_results_dir.exists() or not any(calc_results_dir.iterdir()):
        logging.error("No calculation results found in data/calculation_results/")
        return False
    
    # Try to load one of the YAML files to validate content
    try:
        result_files = list(calc_results_dir.glob("*.yaml"))
        if result_files:
            with open(result_files[0], 'r', encoding='utf-8') as f:
                yaml.safe_load(f)
        logging.info("Calculation results validated successfully.")
        return True
    except Exception as e:
        logging.error(f"Error validating calculation results: {e}")
        return False

def generate_report(templates: list = None):
    """Execute the document generation script to create the final report."""
    logging.info("Step 3/3: Generating final PV technical report...")
    if templates is None:
        templates = ["equipment", "cable_sizing", "grounding", "calculations", "protection"]
    
    try:
        script_dir = Path(__file__).parent
        result = subprocess.run(
            [sys.executable, str(script_dir / "scripts/generate_document.py")],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(script_dir)  # Set working directory to script directory
        )
        logging.info("Report generation completed successfully")
        logging.info(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Error generating report: {e}")
        logging.error(f"Error output: {e.stderr}")
        return False

def verify_output():
    """Verify that the final document was created successfully."""
    output_file = Path("output/final_document.md")
    
    if not output_file.exists():
        logging.error("Final document was not generated in output/final_document.md")
        return False
    
    file_size = output_file.stat().st_size
    if file_size == 0:
        logging.warning("Final document is empty (0 bytes)")
        return False
    
    logging.info(f"Success! Final document generated: output/final_document.md ({file_size} bytes)")
    return True

def main(project_name: str, project_specs: Dict[str, Any], components: Dict[str, Any], templates: list = None, calculation_results: Dict[str, Any] = None) -> Dict[str, Any]:
    """Main execution function for the Solar PV Technical Report Generator."""
    start_time = time.time()
    
    logging.info("=== Solar PV Technical Project Report Generator ===")
    logging.info(f"Starting report generation for project: {project_name}")
    
    # Save input data to YAML files
    script_dir = Path(__file__).parent
    try:
        with open(script_dir / "data/project_specs.yaml", "w") as f:
            yaml.dump(project_specs, f)
        with open(script_dir / "data/components.yaml", "w") as f:
            yaml.dump(components, f)
        if calculation_results:
            with open(script_dir / "data/calculation_results/results.yaml", "w") as f:
                yaml.dump(calculation_results, f)
    except Exception as e:
        logging.error(f"Error saving input data: {e}")
        return {"success": False, "message": "Failed to save input data", "error": str(e)}
    
    # Change to the project root directory if script is run from elsewhere
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.basename(script_dir) == "scripts":
        os.chdir(os.path.dirname(script_dir))
    print(script_dir)
    if not check_environment():
        return {"success": False, "message": "Environment check failed"}
    
    if not run_calculations():
        return {"success": False, "message": "Calculations failed"}
    
    if not validate_calculation_results():
        return {"success": False, "message": "Calculation validation failed"}
    
    if not generate_report(templates):
        return {"success": False, "message": "Report generation failed"}
    
    if not verify_output():
        return {"success": False, "message": "Output verification failed"}
    
    try:
        with open(script_dir / "output/report.md", "r") as f:
            report_content = f.read()
        return {
            "success": True,
            "message": "Report generated successfully",
            "report_content": report_content
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Failed to read generated report",
            "error": str(e)
        }
    
    elapsed_time = time.time() - start_time
    logging.info(f"Report generation completed in {elapsed_time:.2f} seconds.")
    logging.info("=== Process Completed Successfully ===")

if __name__ == "__main__":
    main()
