"""
Simplified PV Simulation API
Clean FastAPI interface for the simplified simulator
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime, date
import json

from simplified_simulator import (
    SimplePVSimulator,
    SiteConfig,
    PanelConfig,
    ArrayConfig,
    InverterConfig,
    create_default_config
)

app = FastAPI(
    title="Simple PV Simulation API",
    description="Clean API for solar PV system simulation using pvlib",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API validation
class SiteConfigModel(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    altitude: float = Field(100, ge=0, description="Altitude in meters")
    timezone: str = Field("UTC", description="Timezone identifier")
    albedo: float = Field(0.25, ge=0, le=1, description="Ground albedo (reflectivity)")


class PanelConfigModel(BaseModel):
    max_power: float = Field(..., gt=0, description="Maximum power rating in Watts")
    open_circuit_voltage: float = Field(..., gt=0, description="Open circuit voltage in Volts")
    short_circuit_current: float = Field(..., gt=0, description="Short circuit current in Amps")
    voltage_at_pmax: float = Field(..., gt=0, description="Voltage at maximum power in Volts")
    current_at_pmax: float = Field(..., gt=0, description="Current at maximum power in Amps")
    temp_coeff_voc: float = Field(-0.003, description="Temperature coefficient for Voc (per °C)")
    temp_coeff_isc: float = Field(0.0005, description="Temperature coefficient for Isc (per °C)")


class ArrayConfigModel(BaseModel):
    modules_per_string: int = Field(..., ge=1, description="Number of modules in series")
    strings_in_parallel: int = Field(..., ge=1, description="Number of parallel strings")
    tilt_angle: float = Field(..., ge=0, le=90, description="Array tilt angle in degrees")
    azimuth_angle: float = Field(..., ge=0, lt=360, description="Array azimuth angle in degrees")
    mounting_height: float = Field(2.0, ge=0, description="Mounting height in meters")
    ground_coverage_ratio: float = Field(0.3, ge=0, le=1, description="Ground coverage ratio")


class InverterConfigModel(BaseModel):
    nominal_output_power: float = Field(..., gt=0, description="Nominal AC output power in Watts")
    max_dc_voltage: float = Field(..., gt=0, description="Maximum DC input voltage in Volts")
    max_input_current: float = Field(..., gt=0, description="Maximum DC input current in Amps")
    efficiency: float = Field(0.96, ge=0, le=1, description="Inverter efficiency")


class SimulationRequest(BaseModel):
    site: SiteConfigModel
    panel: PanelConfigModel
    array: ArrayConfigModel
    inverter: InverterConfigModel
    year: int = Field(2023, ge=2000, le=2050, description="Simulation year")


class DaySimulationRequest(BaseModel):
    site: SiteConfigModel
    panel: PanelConfigModel
    array: ArrayConfigModel
    inverter: InverterConfigModel
    simulation_date: str = Field(..., description="Date in YYYY-MM-DD format")


class SimulationResponse(BaseModel):
    success: bool
    timestamp: str
    annual_energy: Optional[float] = None
    capacity_factor: Optional[float] = None
    peak_power: Optional[float] = None
    performance_ratio: Optional[float] = None
    monthly_energy: Optional[Dict[str, float]] = None
    daily_energy: Optional[Dict[str, float]] = None
    error_message: Optional[str] = None


class DaySimulationResponse(BaseModel):
    success: bool
    timestamp: str
    hourly_data: Optional[List[Dict[str, Any]]] = None
    daily_total: Optional[float] = None
    error_message: Optional[str] = None


# Global simulator instance
simulator = SimplePVSimulator()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Simple PV Simulation API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "simulate_year": "/simulate/year",
            "simulate_day": "/simulate/day",
            "default_config": "/config/default"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/config/default")
async def get_default_config():
    """Get default system configuration"""
    try:
        site, panel, array, inverter = create_default_config()
        return {
            "site": site.__dict__,
            "panel": panel.__dict__,
            "array": array.__dict__,
            "inverter": inverter.__dict__
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating default config: {str(e)}")


@app.post("/simulate/year", response_model=SimulationResponse)
async def simulate_year(request: SimulationRequest):
    """
    Run a full year simulation

    Returns annual energy production, capacity factor, and performance metrics
    """
    try:
        # Convert Pydantic models to internal config objects
        site = SiteConfig(**request.site.model_dump())
        panel = PanelConfig(**request.panel.model_dump())
        array = ArrayConfig(**request.array.model_dump())
        inverter = InverterConfig(**request.inverter.model_dump())

        # Setup simulator
        if not simulator.setup_system(site, panel, array, inverter):
            raise HTTPException(status_code=400, detail="Failed to setup PV system")

        # Run simulation
        results = simulator.simulate_year(request.year)

        if not results:
            raise HTTPException(status_code=500, detail="Simulation failed to produce results")

        # Format response
        return SimulationResponse(
            success=True,
            timestamp=datetime.now().isoformat(),
            annual_energy=round(results.annual_energy, 2),
            capacity_factor=round(results.capacity_factor, 4),
            peak_power=round(results.peak_power, 2),
            performance_ratio=round(results.performance_ratio, 4),
            monthly_energy={str(k): round(v, 2) for k, v in results.monthly_energy.items()},
            daily_energy={str(k): round(v, 2) for k, v in results.daily_energy.items()}
        )

    except HTTPException:
        raise
    except Exception as e:
        return SimulationResponse(
            success=False,
            timestamp=datetime.now().isoformat(),
            error_message=str(e)
        )


@app.post("/simulate/day", response_model=DaySimulationResponse)
async def simulate_day(request: DaySimulationRequest):
    """
    Simulate a single day in detail

    Returns hourly power output, irradiance, and temperature data
    """
    try:
        # Validate date format
        try:
            datetime.strptime(request.simulation_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        # Convert Pydantic models to internal config objects
        site = SiteConfig(**request.site.model_dump())
        panel = PanelConfig(**request.panel.model_dump())
        array = ArrayConfig(**request.array.model_dump())
        inverter = InverterConfig(**request.inverter.model_dump())

        # Setup simulator
        if not simulator.setup_system(site, panel, array, inverter):
            raise HTTPException(status_code=400, detail="Failed to setup PV system")

        # Run day simulation
        results = simulator.simulate_day(request.simulation_date)

        if not results:
            raise HTTPException(status_code=500, detail="Day simulation failed")

        # Format hourly data
        hourly_data = []
        for i, timestamp in enumerate(results['times']):
            hourly_data.append({
                "time": timestamp,
                "power_output": round(results['power_output'][i], 2),
                "irradiance": round(results['irradiance'][i], 2),
                "cell_temperature": round(results['cell_temperature'][i], 2),
                "ambient_temperature": round(results['ambient_temperature'][i], 2)
            })

        daily_total = sum(results['power_output']) / 1000  # Convert to kWh

        return DaySimulationResponse(
            success=True,
            timestamp=datetime.now().isoformat(),
            hourly_data=hourly_data,
            daily_total=round(daily_total, 2)
        )

    except HTTPException:
        raise
    except Exception as e:
        return DaySimulationResponse(
            success=False,
            timestamp=datetime.now().isoformat(),
            error_message=str(e)
        )


@app.get("/simulate/quick")
async def quick_simulation(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude in decimal degrees"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude in decimal degrees"),
    system_size_kw: float = Query(10, gt=0, le=1000, description="System size in kilowatts")
):
    """
    Quick simulation with minimal parameters

    Uses default equipment configuration with specified location and system size
    """
    try:
        # Get default config and modify
        site, panel, array, inverter = create_default_config()
        site.latitude = latitude
        site.longitude = longitude

        # Adjust array to match desired system size
        panel_watts = panel.max_power
        total_panels = int((system_size_kw * 1000) / panel_watts)

        # Optimize configuration
        array.strings_in_parallel = max(1, total_panels // 10)
        array.modules_per_string = max(1, total_panels // array.strings_in_parallel)

        # Scale inverter
        inverter.nominal_output_power = system_size_kw * 1000

        # Setup and run simulation
        if not simulator.setup_system(site, panel, array, inverter):
            raise HTTPException(status_code=400, detail="Failed to setup PV system")

        results = simulator.simulate_year()

        if not results:
            raise HTTPException(status_code=500, detail="Simulation failed")

        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "system_size_kw": system_size_kw,
            "location": {"latitude": latitude, "longitude": longitude},
            "annual_energy_kwh": round(results.annual_energy, 2),
            "capacity_factor": round(results.capacity_factor, 4),
            "peak_power_kw": round(results.peak_power / 1000, 2),
            "configuration": {
                "total_panels": array.modules_per_string * array.strings_in_parallel,
                "modules_per_string": array.modules_per_string,
                "strings_in_parallel": array.strings_in_parallel,
                "tilt_angle": array.tilt_angle,
                "azimuth_angle": array.azimuth_angle
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "timestamp": datetime.now().isoformat(),
            "error_message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)