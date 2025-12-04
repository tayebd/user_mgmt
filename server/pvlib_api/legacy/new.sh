# Navigate to your pvlib_api directory
cd /home/tayebd/apps/user_mgmt/server/pvlib_api

# Create the new directory structure
mkdir -p core shared legacy

# Move existing files to legacy (optional - can copy instead)
cp SPVSimAPI.py PVArray.py PVUtilities.py mapTsToPython.ts legacy/

# Create new core files
cat > core/__init__.py << 'EOF'
"""Core PV simulation functionality"""
from .simulator import PVSimulator
from .models import PVModule, ArrayConfig, InverterConfig

__all__ = ['PVSimulator', 'PVModule', 'ArrayConfig', 'InverterConfig']
EOF

cat > core/simulator.py << 'EOF'
from pydantic import BaseModel
from pvlib import pvsystem
from typing import Dict, Any

class PVSimulator:
    def __init__(self, module_params: Dict[str, Any], inverter_params: Dict[str, Any]):
        self.system = pvsystem.PVSystem(
            module_parameters=module_params,
            inverter_parameters=inverter_params
        )
    
    async def simulate(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        """Async PV simulation with error handling"""
        try:
            temps = self.system.temperature.sapm_cell(
                weather['poa_global'],
                weather['temp_air'],
                weather.get('wind_speed', 1.0)
            )
            dc = self.system.pvwatts_dc(weather['poa_global'], temps)
            return {'success': True, 'data': dc, 'temps': temps}
        except Exception as e:
            return {'success': False, 'error': str(e)}
EOF

cat > core/models.py << 'EOF'
from pydantic import BaseModel, Field
from typing import Optional

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
    inverter: Dict[str, Any]
    array: ArrayConfig
    weather: Dict[str, Any]
EOF

# Create shared adapter
cat > shared/adapter.py << 'EOF'
from typing import Dict, Any
from legacy.SPVSimAPI import SPVSim

class LegacyAdapter:
    @staticmethod
    def convert_request(new_request: Dict[str, Any]) -> Dict[str, Any]:
        """Convert new API request to legacy format"""
        return {
            'module': {
                'maxPower': new_request['module']['pdc0'],
                'openCircuitVoltage': new_request['module']['voc_ref'],
                'shortCircuitCurrent': new_request['module']['isc_ref'],
                'tempCoeffPmax': new_request['module']['temp_coeff']
            },
            'inverter': new_request['inverter'],
            'array': {
                'tilt': new_request['array']['tilt'],
                'azimuth': new_request['array']['azimuth']
            }
        }
    
    @staticmethod
    async def run_legacy_simulation(config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute simulation using legacy code"""
        try:
            sim = SPVSim()
            sim.configure_from_request(config)
            return {'success': True, 'data': sim.execute_simulation()}
        except Exception as e:
            return {'success': False, 'error': str(e)}
EOF

# Create shared __init__.py
cat > shared/__init__.py << 'EOF'
"""Shared utilities for PV simulation"""
from .adapter import LegacyAdapter

__all__ = ['LegacyAdapter']
EOF
