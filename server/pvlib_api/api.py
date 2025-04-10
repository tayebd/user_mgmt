from fastapi import FastAPI, HTTPException
from SPVSim import SPVSim
from datetime import datetime
import pandas as pd
from typing import Dict, Any
from pydantic import BaseModel

app = FastAPI()

class SimulationInput(BaseModel):
    site: Dict[str, Any]
    panel: Dict[str, Any]
    array: Dict[str, Any]
    battery: Dict[str, Any]
    inverter: Dict[str, Any]
    load: Dict[str, Any]

@app.post("/simulate")
async def simulate(input_data: SimulationInput):
    api_instance = SolarPVAPI()
    try:
        results = api_instance.run_simulation(input_data.dict())
        return results
    except Exception as e:
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
                "powerOutput": List[float],  # Hourly power output values
                "energyYield": float,         # Total energy yield
                "timestamp": str,             # ISO format timestamp
                "performanceMetrics": {
                    "capacityFactor": float,
                    "systemEfficiency": float
                }
            }
        """
        # Load input data into simulator
        self._load_input_data(input_data)
        
        # Run simulation
        try:
            self.simulator.execute_simulation()
            
            # Extract and format results
            power_flow = self.simulator.power_flow
            if power_flow is None:
                raise ValueError("Simulation failed to produce results")
        except Exception as e:
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
            
        total_energy = power_flow['PowerOut'].sum()
        max_power = self.simulator.ary.get_max_power()
        capacity_factor = total_energy / (max_power * 8760) if max_power > 0 else 0
        
        return {
            "powerOutput": power_flow['PowerOut'].tolist(),
            "energyYield": total_energy,
            "timestamp": datetime.now().isoformat(),
            "performanceMetrics": {
                "capacityFactor": capacity_factor,
                "systemEfficiency": power_flow['DelvrEff'].mean()
            }
        }
        
    def _load_input_data(self, input_data: Dict[str, Any]):
        """Load input data into simulator components"""
        # Update site parameters
        self.simulator.site.write_parameters(input_data.get('site', {}))
        
        # Update panel parameters
        self.simulator.pnl.write_parameters(input_data.get('panel', {}))
        
        # Update array parameters
        self.simulator.ary.write_parameters(input_data.get('array', {}))
        
        # Update battery parameters if present
        if 'battery' in input_data:
            self.simulator.bat.write_parameters(input_data['battery'])
            self.simulator.bnk.write_parameters(input_data['battery'])
            
        # Update inverter parameters if present
        if 'inverter' in input_data:
            self.simulator.inv.write_parameters(input_data['inverter'])
