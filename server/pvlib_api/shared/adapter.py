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
