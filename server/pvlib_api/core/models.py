from pydantic import BaseModel, Field
from typing import Optional, Any

class PVModule(BaseModel):
    pdc0: float = Field(..., description="Max power in watts")
    voc_ref: float = Field(..., description="Open circuit voltage")
    isc_ref: float = Field(..., description="Short circuit current")
    temp_coeff: float = Field(-0.004, description="Power temperature coefficient")

class ArrayConfig(BaseModel):
    tilt: float = Field(30.0, ge=0, le=90, description="Tilt angle in degrees")
    azimuth: float = Field(180.0, ge=0, le=360, description="Azimuth angle")
    modules_per_string: int = Field(8, gt=0)
    strings_per_inverter: int = Field(4, gt=0)

class SimulationRequest(BaseModel):
    module: PVModule
    inverter: dict[str, Any]
    array: ArrayConfig
    weather: dict[str, Any]
