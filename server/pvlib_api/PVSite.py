import pandas as pd
from pvlib.location import Location
#from pvlib.solarposition import get_sun_rise_set_transit
from pvlib.solarposition import sun_rise_set_transit_spa

class PVSite():
    """ Methods associated with the Site & Project definition, display, and operation """
    default_wind_spd = 0  # in meters per sec
    default_temp = 30     # in degrees celcius

    def __init__(self, master):
        self.curloc = None
        self.air_temp = None
        self.wind_spd = None
        self.atmospherics = None
        self.suntimes = None
        self.master = master  # Master reference
        self.cntry = ''  # Country
        self.proj = ''  # Project Name
        self.p_desc = ''  # Description
        self.lat = 0.0  # Latitude
        self.lon = 0.0  # Longitude
        self.city = ''  # City
        self.client = ''  # Client
        self.elev = 0.0  # Elevation (m)
        self.tz = 0  # TimeZone
        self.gv = 0  # Grid Volts (VAC)
        self.gf = 0  # Grid Freq (Hz)
        # self.grdcnx = 'No'  # Grid Connection (commented out in the provided structure)

    def __str__(self):
        """String representation of the solar site"""
        return f"""PV Site
        Country: {self.cntry}
        Project Name: {self.proj}
        Description: {self.p_desc}
        Latitude: {self.lat}
        Longitude: {self.lon}
        City: {self.city}
        Client: {self.client}
        Elevation: {self.elev} m
        TimeZone: {self.tz}
        Grid Volts: {self.gv} VAC
        Grid Freq: {self.gf} Hz
        # Grid Connection: {self.grdcnx}"""

    def get_location(self):
        """ Create & return a PVLIB Location Instance """
        if self.curloc is None:
            mtghgt = self.master.ary.mtg_hgt
            self.curloc = Location(self.lat, self.lon,
                            #Sets Valid TZ information for Location
                            tz= self._get_timezone_string(),
                            altitude= self.elev + mtghgt,
                            name= '{0}, {1}'.format(self.city, self.cntry))
        return self.curloc

    def _get_timezone_string(self):
        """Handle timezone conversion safely for both numeric and string inputs"""
        try:
            if isinstance(self.tz, (int, float)):
                offset = int(self.tz)
                sign = '-' if offset > 0 else '+'
                return f"Etc/GMT{sign}{abs(offset)}"
            elif isinstance(self.tz, str):
                if self.tz.upper() == 'UTC':
                    return 'UTC'
                # Try to extract numeric offset from string
                try:
                    offset = int(float(self.tz))
                    sign = '-' if offset > 0 else '+'
                    return f"Etc/GMT{sign}{abs(offset)}"
                except (ValueError, TypeError):
                    return 'UTC'
            return 'UTC'
        except Exception:
            return 'UTC'

    def get_sun_times(self, times):
        """ Create a DataFrame with SunRise & Sunset Times for each of the 365 days in a year   """
        if self.suntimes is None:
            lt = self.lat
            ln = self.lon
            #st = get_sun_rise_set_transit(times, lt, ln)
            st = sun_rise_set_transit_spa(times, lt, ln)
            sunup = []
            sundwn = []
            transit = []
            doy = []
            for i in range(365):
                sunup.append(st.iloc[i*24]['sunrise'])
                sundwn.append(st.iloc[i*24]['sunset'])
                transit.append(st.iloc[i*24]['transit'])
                doy.append(times[i*24].date())
            df_dict = {'Sunrise': sunup,
                       'Sunset':sundwn,
                       'Transit':transit}
            self.suntimes = pd.DataFrame(data= df_dict, index= doy)
        return self.suntimes

def main():
    print ('PVSite Definition Check')

if __name__ == '__main__':
    main()
