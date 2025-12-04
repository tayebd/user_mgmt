#!/usr/bin/env python3
"""
Simplified PV Simulation System
Uses pvlib for core solar calculations with minimal dependencies
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
from datetime import datetime
import pvlib
from pvlib.location import Location
from pvlib.pvsystem import PVSystem
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS


@dataclass
class SiteConfig:
    """Site configuration parameters"""
    latitude: float
    longitude: float
    altitude: float = 100.0
    timezone: str = "UTC"
    albedo: float = 0.25


@dataclass
class PanelConfig:
    """PV panel configuration parameters"""
    max_power: float  # Watts
    open_circuit_voltage: float  # Volts
    short_circuit_current: float  # Amps
    voltage_at_pmax: float  # Volts
    current_at_pmax: float  # Amps
    temp_coeff_voc: float = -0.003  # per degree C
    temp_coeff_isc: float = 0.0005  # per degree C


@dataclass
class ArrayConfig:
    """Array configuration parameters"""
    modules_per_string: int
    strings_in_parallel: int
    tilt_angle: float  # degrees
    azimuth_angle: float  # degrees (180 = south facing)
    mounting_height: float = 2.0  # meters
    ground_coverage_ratio: float = 0.3


@dataclass
class InverterConfig:
    """Inverter configuration parameters"""
    nominal_output_power: float  # Watts
    max_dc_voltage: float  # Volts
    max_input_current: float  # Amps
    efficiency: float = 0.96  # default efficiency


@dataclass
class SimulationResult:
    """Simulation output data"""
    hourly_power_output: List[float]
    daily_energy: Dict[int, float]  # day_of_year -> kWh
    monthly_energy: Dict[int, float]  # month -> kWh
    annual_energy: float  # kWh
    capacity_factor: float
    peak_power: float
    performance_ratio: float


class SimplePVSimulator:
    """
    Simplified PV simulator using pvlib for core calculations
    """

    def __init__(self):
        self.location: Optional[Location] = None
        self.pv_system: Optional[PVSystem] = None
        self.timezone: str = "UTC"
        self.array_config: Optional[ArrayConfig] = None
        self.module_params: Optional[Dict[str, Any]] = None
        self.inverter_params: Optional[Dict[str, Any]] = None

    def setup_system(self, site: SiteConfig, panel: PanelConfig,
                    array: ArrayConfig, inverter: InverterConfig) -> bool:
        """
        Configure the PV system with given parameters
        """
        try:
            # Store timezone and array config for our use
            self.timezone = site.timezone
            self.array_config = array

            # Create pvlib location
            self.location = Location(
                latitude=site.latitude,
                longitude=site.longitude,
                tz=site.timezone,
                altitude=site.altitude
            )

            # Create module parameters for pvlib
            module_params = {
                'pdc0': panel.max_power,
                'gamma_pdc': panel.temp_coeff_voc,  # Temperature coefficient
                'V_oc_ref': panel.open_circuit_voltage,
                'I_sc_ref': panel.short_circuit_current,
                'V_mp_ref': panel.voltage_at_pmax,
                'I_mp_ref': panel.current_at_pmax
            }

            # Create inverter parameters
            inverter_params = {
                'pdc0': inverter.nominal_output_power,
                'eta_inv_nom': inverter.efficiency,
                'eta_inv_ref': inverter.efficiency
            }

            # Create PV system
            # Calculate total modules and adjust module parameters accordingly
            total_modules = array.modules_per_string * array.strings_in_parallel

            # Scale the module parameters for the entire array
            scaled_module_params = {
                'pdc0': panel.max_power * total_modules,
                'gamma_pdc': panel.temp_coeff_voc,
                'V_oc_ref': panel.open_circuit_voltage * array.modules_per_string,
                'I_sc_ref': panel.short_circuit_current * array.strings_in_parallel,
                'V_mp_ref': panel.voltage_at_pmax * array.modules_per_string,
                'I_mp_ref': panel.current_at_pmax * array.strings_in_parallel
            }

            # Store parameters for easy access
            self.module_params = scaled_module_params
            self.inverter_params = inverter_params

            self.pv_system = PVSystem(
                surface_tilt=array.tilt_angle,
                surface_azimuth=array.azimuth_angle,
                module_parameters=scaled_module_params,
                inverter_parameters=inverter_params
            )

            return True

        except Exception as e:
            print(f"Error setting up system: {e}")
            return False

    def generate_weather_data(self, times: pd.DatetimeIndex) -> pd.DataFrame:
        """
        Generate synthetic weather data when real data isn't available
        """
        # Get solar position for temperature modeling
        solar_position = self.location.get_solarposition(times)

        # Simple temperature model based on time of day and season
        day_of_year = times.dayofyear
        hour = times.hour

        # Base temperature varies by season (sinusoidal)
        base_temp = 15 + 10 * np.sin(2 * np.pi * (day_of_year - 80) / 365)

        # Daily temperature variation
        daily_variation = 8 * np.sin(2 * np.pi * (hour - 6) / 24)

        air_temp = base_temp + daily_variation + np.random.normal(0, 2, len(times))

        # Wind speed (simple model)
        wind_speed = 3 + 2 * np.random.random(len(times))

        # Clear sky GHI
        clearsky = self.location.get_clearsky(times)
        ghi = clearsky['ghi']

        # Add some cloud cover variation
        cloud_factor = 0.7 + 0.3 * np.random.random(len(times))
        ghi = ghi * cloud_factor

        return pd.DataFrame({
            'ghi': ghi,
            'temp_air': air_temp,
            'wind_speed': wind_speed
        }, index=times)

    def simulate_year(self, year: int = 2023) -> Optional[SimulationResult]:
        """
        Run a full year simulation
        """
        if not self.location or not self.pv_system:
            print("System not configured. Call setup_system() first.")
            return None

        try:
            # Create time series for the year
            times = pd.date_range(
                start=f'{year}-01-01 00:00:00',
                end=f'{year}-12-31 23:00:00',
                freq='h',
                tz=self.timezone
            )

            # Generate or get weather data
            weather = self.generate_weather_data(times)

            # Calculate solar position
            solar_position = self.location.get_solarposition(times)

            # Calculate plane-of-array irradiance using stored array config
            poa_irradiance = pvlib.irradiance.get_total_irradiance(
                surface_tilt=self.array_config.tilt_angle,
                surface_azimuth=self.array_config.azimuth_angle,
                solar_zenith=solar_position['apparent_zenith'],
                solar_azimuth=solar_position['azimuth'],
                dni=weather['ghi'],  # Simplified - using GHI for DNI
                ghi=weather['ghi'],
                dhi=weather['ghi'] * 0.2,  # Simplified DHI
                albedo=0.25
            )

            # Calculate cell temperature
            temperature_model = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
            cell_temp = pvlib.temperature.sapm_cell(
                poa_irradiance['poa_global'],
                weather['temp_air'],
                weather['wind_speed'],
                **temperature_model
            )

            # Calculate DC power using pvwatts with stored parameters
            dc_power = pvlib.pvsystem.pvwatts_dc(
                poa_irradiance['poa_global'],
                cell_temp,
                pdc0=self.module_params['pdc0'],
                gamma_pdc=self.module_params['gamma_pdc'],
                temp_ref=25.0
            )

            # Calculate AC power using inverter with stored parameters
            ac_power = pvlib.inverter.pvwatts(
                dc_power,
                pdc0=self.inverter_params['pdc0'],
                eta_inv_nom=self.inverter_params['eta_inv_nom'],
                eta_inv_ref=self.inverter_params['eta_inv_ref']
            )

            # Ensure no negative power
            ac_power = ac_power.clip(lower=0)

            # Calculate results
            hourly_power = ac_power.tolist()
            daily_energy = {}
            monthly_energy = {}

            # Daily energy aggregation
            for day in range(1, 367):
                day_mask = times.dayofyear == day
                if day_mask.any():
                    daily_energy[day] = ac_power[day_mask].sum() / 1000  # kWh

            # Monthly energy aggregation
            for month in range(1, 13):
                month_mask = times.month == month
                monthly_energy[month] = ac_power[month_mask].sum() / 1000  # kWh

            annual_energy = ac_power.sum() / 1000  # kWh
            peak_power = ac_power.max()
            system_capacity = self.module_params['pdc0']  # Already scaled for total system

            capacity_factor = annual_energy / (system_capacity * 8760) if system_capacity > 0 else 0

            # Simple performance ratio calculation
            theoretical_energy = weather['ghi'].sum() / 1000  # kWh
            performance_ratio = annual_energy / theoretical_energy if theoretical_energy > 0 else 0

            return SimulationResult(
                hourly_power_output=hourly_power,
                daily_energy=daily_energy,
                monthly_energy=monthly_energy,
                annual_energy=annual_energy,
                capacity_factor=capacity_factor,
                peak_power=peak_power,
                performance_ratio=performance_ratio
            )

        except Exception as e:
            print(f"Simulation error: {e}")
            return None

    def simulate_day(self, date: str) -> Optional[Dict[str, Any]]:
        """
        Simulate a single day for detailed analysis
        """
        if not self.location or not self.pv_system:
            print("System not configured. Call setup_system() first.")
            return None

        try:
            times = pd.date_range(
                start=f'{date} 00:00:00',
                end=f'{date} 23:00:00',
                freq='h',
                tz=self.timezone
            )

            weather = self.generate_weather_data(times)
            solar_position = self.location.get_solarposition(times)

            # Calculate plane-of-array irradiance using stored array config
            poa_irradiance = pvlib.irradiance.get_total_irradiance(
                surface_tilt=self.array_config.tilt_angle,
                surface_azimuth=self.array_config.azimuth_angle,
                solar_zenith=solar_position['apparent_zenith'],
                solar_azimuth=solar_position['azimuth'],
                dni=weather['ghi'],
                ghi=weather['ghi'],
                dhi=weather['ghi'] * 0.2,
                albedo=0.25
            )

            temperature_model = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
            cell_temp = pvlib.temperature.sapm_cell(
                poa_irradiance['poa_global'],
                weather['temp_air'],
                weather['wind_speed'],
                **temperature_model
            )

            # Calculate DC power using pvwatts with stored parameters
            dc_power = pvlib.pvsystem.pvwatts_dc(
                poa_irradiance['poa_global'],
                cell_temp,
                pdc0=self.module_params['pdc0'],
                gamma_pdc=self.module_params['gamma_pdc'],
                temp_ref=25.0
            )

            # Calculate AC power using inverter with stored parameters
            ac_power = pvlib.inverter.pvwatts(
                dc_power,
                pdc0=self.inverter_params['pdc0'],
                eta_inv_nom=self.inverter_params['eta_inv_nom'],
                eta_inv_ref=self.inverter_params['eta_inv_ref']
            )
            ac_power = ac_power.clip(lower=0)

            return {
                'times': times.tolist(),
                'power_output': ac_power.tolist(),
                'irradiance': poa_irradiance['poa_global'].tolist(),
                'cell_temperature': cell_temp.tolist(),
                'ambient_temperature': weather['temp_air'].tolist()
            }

        except Exception as e:
            print(f"Day simulation error: {e}")
            return None


def create_default_config() -> tuple[SiteConfig, PanelConfig, ArrayConfig, InverterConfig]:
    """
    Create a default configuration for testing
    """
    site = SiteConfig(
        latitude=33.45,
        longitude=-84.15,
        altitude=300,
        timezone="America/New_York"
    )

    panel = PanelConfig(
        max_power=400,
        open_circuit_voltage=48,
        short_circuit_current=9.5,
        voltage_at_pmax=40,
        current_at_pmax=9.0
    )

    array = ArrayConfig(
        modules_per_string=10,
        strings_in_parallel=3,
        tilt_angle=30,
        azimuth_angle=180
    )

    inverter = InverterConfig(
        nominal_output_power=10000,
        max_dc_voltage=600,
        max_input_current=20
    )

    return site, panel, array, inverter


if __name__ == "__main__":
    # Example usage
    simulator = SimplePVSimulator()

    # Create default configuration
    site, panel, array, inverter = create_default_config()

    # Setup the system
    if simulator.setup_system(site, panel, array, inverter):
        print("System configured successfully!")

        # Run simulation
        results = simulator.simulate_year()

        if results:
            print(f"Annual Energy Production: {results.annual_energy:.2f} kWh")
            print(f"Capacity Factor: {results.capacity_factor:.2%}")
            print(f"Peak Power: {results.peak_power:.2f} W")
            print(f"Performance Ratio: {results.performance_ratio:.2%}")
        else:
            print("Simulation failed!")
    else:
        print("System configuration failed!")