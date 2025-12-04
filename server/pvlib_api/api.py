from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from SPVSim import SPVSim
from datetime import datetime
import pandas as pd
from typing import Dict, Any, Optional
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"Validation error: {exc.errors()}")
    print(f"Request body: {body}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": body.decode('utf-8', errors='replace'),
            "error": "Validation failed"
        }
    )

class SimulationInput(BaseModel):
    site: Dict[str, Any]
    panel: Dict[str, Any]
    array: Dict[str, Any]
    battery: Optional[Dict[str, Any]] = None  # Make battery optional
    inverter: Dict[str, Any]
    load: Dict[str, Any]

@app.get("/")
async def root():
    return {"message": "PV Simulation API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/simulate")
async def simulate(input_data: SimulationInput):
    print(f"Received simulation request: {input_data}")
    api_instance = SolarPVAPI()
    try:
        results = api_instance.run_simulation(input_data.dict())
        return results
    except Exception as e:
        print(f"Error during simulation: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "powerOutput": [],
            "energyYield": 0,
            "timestamp": datetime.now().isoformat(),
            "performanceMetrics": {
                "capacityFactor": 0,
                "systemEfficiency": 0
            },
            "error": True,
            "message": str(e),
            "status": 400
        }

class SolarPVAPI:
    """API interface for Solar PV simulation service"""
    
    def __init__(self):
        self.simulator = SPVSim()
        
    def run_simulation(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run simulation with provided input data

        Args:
            input_data: Dictionary containing simulation parameters:
                - site: Site configuration
                - panel: Panel parameters
                - array: Array configuration
                - battery: Battery parameters (optional)
                - inverter: Inverter parameters (optional)

        Returns:
            Dictionary containing simulation results:
            {
                "success": bool,
                "powerOutput": List[float],  # Hourly power output values
                "energyYield": float,         # Total energy yield
                "timestamp": str,             # ISO format timestamp
                "performanceMetrics": {
                    "capacityFactor": float,
                    "systemEfficiency": float
                },
                "message": str (optional),
                "error": bool
            }
        """
        # Load input data into simulator
        self._load_input_data(input_data)

        # Run simulation
        try:
            print("Starting simulation execution...")
            self.simulator.execute_simulation()
            print("Simulation execution completed successfully")

            # Extract and format results
            power_flow = self.simulator.power_flow
            if power_flow is None:
                raise ValueError("Simulation failed to produce results")
            print(f"Power flow data: {type(power_flow)}, shape: {getattr(power_flow, 'shape', 'N/A')}")
        except Exception as e:
            print(f"Error during simulation execution: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "powerOutput": [],
                "energyYield": 0,
                "timestamp": datetime.now().isoformat(),
                "performanceMetrics": {
                    "capacityFactor": 0,
                    "systemEfficiency": 0
                },
                "message": str(e),
                "error": True
            }

        total_energy = power_flow['PowerOut'].sum()
        # Calculate max power from panel PTC rating and array configuration
        panel_power = getattr(self.simulator.pnl, 'PTC', 530)  # Default to 530W if not available
        array_quantity = getattr(self.simulator.ary, 'ary_tpnl', 10)  # Default to 10 panels
        max_power = panel_power * array_quantity
        capacity_factor = total_energy / (max_power * 8760) if max_power > 0 else 0

        return {
            "success": True,
            "powerOutput": power_flow['PowerOut'].tolist(),
            "energyYield": total_energy,
            "timestamp": datetime.now().isoformat(),
            "performanceMetrics": {
                "capacityFactor": capacity_factor,
                "systemEfficiency": power_flow['DelvrEff'].mean()
            },
            "message": "Simulation completed successfully",
            "error": False
        }
        
    def _load_input_data(self, input_data: Dict[str, Any]):
        """Load input data into simulator components"""
        print(f"Loading input data: {input_data}")

        # Update site parameters
        if hasattr(self.simulator.site, 'write_parameters'):
            self.simulator.site.write_parameters(input_data.get('site', {}))
        else:
            print("Site component doesn't have write_parameters method")
            # Try to set attributes directly
            site_data = input_data.get('site', {})
            for key, value in site_data.items():
                if hasattr(self.simulator.site, key):
                    setattr(self.simulator.site, key, value)

        # Update panel parameters
        if hasattr(self.simulator.pnl, 'write_parameters'):
            self.simulator.pnl.write_parameters(input_data.get('panel', {}))
        else:
            print("Panel component doesn't have write_parameters method")
            # Try to set attributes directly
            panel_data = input_data.get('panel', {})
            for key, value in panel_data.items():
                if hasattr(self.simulator.pnl, key):
                    setattr(self.simulator.pnl, key, value)

        # Update array parameters
        if hasattr(self.simulator.ary, 'write_parameters'):
            self.simulator.ary.write_parameters(input_data.get('array', {}))
        else:
            print("Array component doesn't have write_parameters method")
            # Try to set attributes directly
            array_data = input_data.get('array', {})
            for key, value in array_data.items():
                if hasattr(self.simulator.ary, key):
                    setattr(self.simulator.ary, key, value)

        # Update battery parameters if present
        if 'battery' in input_data and input_data['battery']:
            print("Battery data provided, configuring battery system...")
            if hasattr(self.simulator.bat, 'write_parameters'):
                self.simulator.bat.write_parameters(input_data['battery'])
            else:
                print("Battery component doesn't have write_parameters method")
                # Try to set attributes directly
                for key, value in input_data['battery'].items():
                    if hasattr(self.simulator.bat, key):
                        setattr(self.simulator.bat, key, value)

            if hasattr(self.simulator.bnk, 'write_parameters'):
                self.simulator.bnk.write_parameters(input_data['battery'])
            else:
                print("Bank component doesn't have write_parameters method")
        else:
            print("No battery data provided - running grid-tied simulation without battery storage")

        # Update inverter parameters if present
        if 'inverter' in input_data:
            if hasattr(self.simulator.inv, 'write_parameters'):
                self.simulator.inv.write_parameters(input_data['inverter'])
            else:
                print("Inverter component doesn't have write_parameters method")
                # Try to set attributes directly
                for key, value in input_data['inverter'].items():
                    if hasattr(self.simulator.inv, key):
                        setattr(self.simulator.inv, key, value)

        # Update load parameters if present
        if 'load' in input_data:
            print(f"Setting load data: {input_data['load']}")
            # For now, just log the load data - we can implement this later if needed
