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
