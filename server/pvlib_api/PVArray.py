from Parameters import panel_racking, albedo_types, panel_types, temp_model_xlate
from pvlib.pvsystem import PVSystem
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
from pvlib.atmosphere import tdew_from_rh  # Correct function to use
import pandas as pd
import numpy as np

class PVArray():
    """ Methods associated with the definition, display, and operation of a Solar Panel Array """
    def __init__(self):
        self.arrays = []
        # Basic array parameters
        self.tilt = 0.0  # Tilt Angle (Degrees)
        self.azimuth = 0.0  # Azimuth (Degrees)
        self.mtg_cnfg = ''  # Mounting Configuration
        self.mtg_spc = 0.0  # Space under Panel (cm)
        self.mtg_hgt = 0.0  # Mounting Height (m)
        self.gnd_cnd = ''  # Ground Surface Condition
        self.albedo = 0.0  # Albedo

        # Electrical configuration
        self.uis = 1  # Units in Series
        self.sip = 1  # Strings in Parallel
        self.ary_Vmp = 0.0  # Array Vmp
        self.ary_Imp = 0.0  # Array Imp

    def __str__(self):
        """String representation of the array"""
        return f"""PV Array
        Tilt: {self.tilt}°    Azimuth: {self.azimuth}°
        Mounting: {self.mtg_cnfg}  Height: {self.mtg_hgt}m
        Ground: {self.gnd_cnd}  Albedo: {self.albedo}
        Electrical: {self.uis}S {self.sip}P
        Vmp: {self.ary_Vmp}V  Imp: {self.ary_Imp}A"""


    def get_atmospheric_data(self, times, loc, weather_data=None):
        """
        Get atmospheric data using pvlib or from provided weather data
        
        Parameters
        ----------
        times : pd.DatetimeIndex
            Time index for the data
        loc : pvlib.location.Location
            Location object
        weather_data : pd.DataFrame, optional
            External weather data if available
            
        Returns
        -------
        pd.DataFrame
            DataFrame containing air_temp, wind_speed, and other atmospheric data
        """
        if weather_data is not None and not weather_data.empty:
            # Use provided weather data if available
            required_cols = ['temp_air', 'wind_speed']
            missing_cols = [col for col in required_cols if col not in weather_data.columns]
            
            if not missing_cols:
                # All required columns exist
                atmos_data = weather_data[required_cols].copy()
                # Rename columns to match our convention
                atmos_data.rename(columns={'temp_air': 'air_temp', 'wind_speed': 'wind_speed'}, inplace=True)
                
                # Calculate dewpoint if relative humidity is available
                if 'relative_humidity' in weather_data.columns:
                    rel_humidity = weather_data['relative_humidity']
                    # Use pvlib's tdew_from_rh function
                    atmos_data['dewpoint'] = tdew_from_rh(atmos_data['air_temp'], rel_humidity)
                
                return atmos_data
            
        # Try to get weather data from site, formatted as legacy columns
        # try:
        #     site_air_temp = cur_site.get_air_temp(times)
        #     site_wind_spd = cur_site.get_wind_spd(times)
            
        #     if 'Air_Temp' in site_air_temp.columns and 'Wind_Spd' in site_wind_spd.columns:
        #         return pd.DataFrame({
        #             'air_temp': site_air_temp['Air_Temp'],
        #             'wind_speed': site_wind_spd['Wind_Spd']
        #         }, index=times)
        # except (AttributeError, KeyError):
        #     # Continue with synthetic data generation if site data unavailable
        #     pass
        
        # If no weather data provided or missing columns, generate synthetic data
        # This is a placeholder for demonstration - in a real application, 
        # you would use actual weather data or a proper weather model
        
        # Get the latitude for temperature approximation
        latitude = loc.latitude
        
        # Create a simple temperature model based on time of day and season
        hours = times.hour + times.minute/60
        day_of_year = times.dayofyear
        
        # Seasonal temperature variation (warmer in summer, cooler in winter)
        seasonal_factor = np.sin((day_of_year - 80) * 2 * np.pi / 365)
        
        # Daily temperature variation (cooler at night, warmer during day)
        daily_factor = np.sin((hours - 5) * np.pi / 12)
        
        # Base temperature varies by latitude (cooler at higher latitudes)
        base_temp = 25 - 0.3 * abs(latitude)
        
        # Calculate synthetic temperatures
        temperatures = base_temp + 10 * seasonal_factor + 5 * daily_factor
        
        # Simple wind speed model (slightly higher during the day)
        wind_speeds = 3 + 2 * np.abs(daily_factor) + np.random.normal(0, 0.5, len(times))
        wind_speeds = np.maximum(0.5, wind_speeds)  # Ensure minimum wind speed
        
        # Create DataFrame with synthetic data
        atmos_data = pd.DataFrame({
            'air_temp': temperatures,
            'wind_speed': wind_speeds
        }, index=times)
        
        return atmos_data

    def define_array_performance(self, times, cur_site, cur_inv, cur_pnl):
        """Calculate array performance using pvlib models"""
        # Get inverter parameters if available
        inv_name = None
        inv_parameters = None
        if cur_inv is not None:
            inv_name = cur_inv.Name
            inv_parameters = {
                'Vac': cur_inv.Vac,
                'Paco': cur_inv.Paco,
                'Pdco': cur_inv.Pdco,
                'Vdco': cur_inv.Vdco,
                'Pnt': cur_inv.Pnt,
                'Vdcmax': cur_inv.Vdcmax,
                'Idcmax': cur_inv.Idcmax,
                'Mppt_low': cur_inv.Mppt_low,
                'Mppt_high': cur_inv.Mppt_high
            }
            
        # Array parameters
        surf_tilt = self.tilt
        surf_azm = self.azimuth
        surf_alb = self.albedo
        mdl_series = self.uis
        mdl_sip = self.sip
        mdl_rack_config = self.mtg_cnfg
        
        # Panel parameters
        pnl_name = cur_pnl.Name
        pnl_parms = {
            'Technology': cur_pnl.Technology,
            'T_NOCT': cur_pnl.T_NOCT,
            'V_mp_ref': cur_pnl.V_mp_ref,
            'I_mp_ref': cur_pnl.I_mp_ref,
            'V_oc_ref': cur_pnl.V_oc_ref,
            'I_sc_ref': cur_pnl.I_sc_ref,
            'PTC': cur_pnl.PTC,
            'A_c': cur_pnl.A_c,
            'N_s': cur_pnl.N_s,
            'R_s': cur_pnl.R_s,
            'R_sh_ref': cur_pnl.R_sh_ref,
            'alpha_sc': cur_pnl.alpha_sc,
            'beta_oc': cur_pnl.beta_oc,
            'a_ref': cur_pnl.a_ref,
            'I_L_ref': cur_pnl.I_L_ref,
            'I_o_ref': cur_pnl.I_o_ref,
            'gamma_r': cur_pnl.gamma_r
        }
        
        # Temperature model based on mounting configuration
        temp_model = temp_model_xlate[mdl_rack_config][0]
        temp_type = temp_model_xlate[mdl_rack_config][1]
        temp_parms = TEMPERATURE_MODEL_PARAMETERS[temp_model][temp_type]
        
        # Get site data
        print("get_location")

        loc = cur_site.get_location()
        
        # Try to get site weather data first
        # try:
        #     air_temp = cur_site.get_air_temp(times)['Air_Temp']
        #     wind_speed = cur_site.get_wind_spd(times)['Wind_Spd']
        # except (AttributeError, KeyError):
        # If not available, use our atmospheric data function
        atmos_data = self.get_atmospheric_data(times, loc)
        air_temp = atmos_data['air_temp']
        wind_speed = atmos_data['wind_speed']
        print("PVSystem")

        # Create PVSystem object
        pvsys = PVSystem(
            surface_tilt=surf_tilt, 
            surface_azimuth=surf_azm, 
            albedo=surf_alb,
            module_parameters=pnl_parms,
            temperature_model_parameters=temp_parms,
            modules_per_string=mdl_series,
            strings_per_inverter=mdl_sip,
            inverter_parameters=inv_parameters,
            racking_model=mdl_rack_config,
            name=loc.name
        )
        
        # Solar position calculations
        solpos = loc.get_solarposition(times, pressure=None, temperature=air_temp)
        
        # Air mass calculations
        airmass = loc.get_airmass(times, solar_position=solpos, model='kastenyoung1989')
        
        # Clear sky irradiance
        clearsky = loc.get_clearsky(times, model='ineichen')
        
        # Angle of incidence
        aoi = pvsys.get_aoi(solpos['zenith'], solpos['azimuth'])
        
        # Plane of array irradiance
        total_irrad = pvsys.get_irradiance(
            solpos['zenith'], 
            solpos['azimuth'],
            clearsky['dni'], 
            clearsky['ghi'], 
            clearsky['dhi'],
            dni_extra=None, 
            airmass=airmass,
            model='haydavies'
        )
        
        # Cell temperature
        cell_temps = pvsys.get_cell_temperature(
            total_irrad['poa_global'], 
            air_temp, 
            wind_speed, 
            model='sapm'
        )
        
        # Get technology-specific parameters
        # vars_dict = panel_types[cur_pnl.Technology].copy()
        # egrf = vars_dict.pop('EgRef', 1.121)
        # dgdt = vars_dict.pop('dEgdT', -0.0002677)
        
        # Calculate module parameters using cell temperature
        photocurrent, saturation_current, resistance_series, resistance_shunt, nNsVth = (
            pvsys.calcparams_desoto(
                total_irrad['poa_global'],
                cell_temps
            )
        )
        
        # Calculate array output
        array_out = pvsys.scale_voltage_current_power(
            pvsys.singlediode(
                photocurrent,
                saturation_current,
                resistance_series,
                resistance_shunt, 
                nNsVth
            )
        )
        
        # Add temperature data to output
        array_out['cell_temperature'] = cell_temps
        array_out['air_temperature'] = air_temp
        array_out['wind_speed'] = wind_speed
        
        array_out.index.name = 'Time'
        return array_out

def main():
    print('PV Array Definition Check')

if __name__ == '__main__':
    main()
