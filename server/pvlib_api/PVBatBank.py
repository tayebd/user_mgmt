import numpy as np
from math import log
import pandas as pd
from Parameters import battery_types
from PVBattery import PVBattery
#from PVUtilities import create_time_mask

class PVBatBank():
    """ Methods associated with battery definition, display, and operation """
    def __init__(self, parts=None):
        self.chg_cycle_count = [0,0]
        self.tot_cycles = 0
        self.bnk_vo = 0
        self.soc = 1.0
        self.cur_cap = None
        self.max_dischg_cycles = None
        self.max_dischg_dod = None
        self.doa = 0
        self.doc = 100.0  # Depth of Discharge (%)
        self.bnk_uis = 1  # Units in Series
        self.bnk_sip = 1  # Strings in Parallel
        self.bnk_tbats = 1  # Total Bank Batteries
        self.bnk_cap = 0.0  # Bank Capacity (A-H)
        self.bnk_vo = 0.0  # Bank Voltage
        self.parts = parts or []

    def add_battery(self, battery):
        """Add a PVBattery to the battery bank and update bank parameters"""
        if not isinstance(battery, PVBattery):
            raise TypeError("Can only add PVBattery objects")
        self.parts.append(battery)
        # Update bank capacity (sum of all battery capacities)
        self.bnk_cap = sum(b.b_rcap for b in self.parts)
        # Update bank voltage (based on first battery's nominal voltage)
        if self.parts:
            self.bnk_vo = self.parts[0].b_nomv
        # Update total battery count
        self.bnk_tbats = len(self.parts)

    def __str__(self):
        """String representation of the battery bank"""
        return f"""PV Battery Bank
        Depth of Discharge: {self.doc}%
        Units in Series: {self.bnk_uis}
        Strings in Parallel: {self.bnk_sip}
        Total Bank Batteries: {self.bnk_tbats}
        Bank Capacity: {self.bnk_cap} A-H
        Bank Voltage: {self.bnk_vo} V"""
    
    def update_cycle_counts(self, delta_soc):
        """ Compute the number of battery charging cycles """
        if not self.parts:
            raise ValueError("No battery parts configured")
        if self.max_dischg_cycles is None or self.max_dischg_dod is None:
            self.max_dischg_cycles = self.parts[0].b_mxDschg
            self.max_dischg_dod = self.parts[0].b_mxDoD
        if delta_soc != 0:
            if delta_soc < 0:
                self.tot_cycles += (abs(delta_soc)*100)/(2*self.max_dischg_dod)

    def bank_lifecycle(self):
        """ Estimate Life expectancy of battery """
        if self.max_dischg_cycles is not None and self.max_dischg_dod is not None:
            lc = self.max_dischg_cycles/self.tot_cycles
            if lc > 5.0:
                return 5.0
            return lc
        else:
            return 0
    
    def initialize_bank(self, socpt = 0.75):
        """ Set Battery Bank status to known starting point """
        self.chg_cycle_count = [0,0]
        self.tot_cycles = 0 
        self.soc = socpt + (self.doc/100)*(1-socpt)
        self.cur_cap = self.bnk_cap*self.soc
        self.set_volts()
    
    def set_volts(self):
        """ set Bank Voltage """
        bnk_vnom = self.bnk_vo
        eff = battery_types[self.parts[0].b_typ][1]
        if self.soc == 1:
            self.bnk_vo = bnk_vnom
        elif self.soc == 0:
            self.bnk_vo = 0            
        else:
            try:
                self.bnk_vo = eff*((bnk_vnom*1.2/6.22)*log(self.soc)) + bnk_vnom
            except ValueError:
                print(' eff= {0}, bnk_vnom= {1}, soc= {2}'.format(
                        eff, bnk_vnom, self.soc))
                        
    def current_capacity(self):
        """ return AH capacity available from Battery Bank """
        if self.cur_cap == None or self.soc == 1:
            self.soc = 1
            self.cur_cap = self.bnk_cap
        return self.bnk_cap*self.soc
    
    def current_power(self):
        """ returns available battery power in watts. """
        return self.current_capacity() * self.get_volts()
    
    def get_volts(self):
        """ Return Current Battery Voltage  """
        if self.soc == 1:
            self.bnk_vo = self.bnk_vo
        return self.bnk_vo
    
    def get_soc(self):
        """ Return current Bnk SOC """
        return self.soc

    def is_okay(self):
        """ Tests for battery SOC above Minimum """
        return self.soc >  (1- (self.doc/100))

    def compute_capacity_requirements(self):
        """Return required capacity to meet specified DOA """
        doa = self.doa
        doc = self.doc/100
        typ = self.parts[0].b_typ
        eff = 1
        if typ != '':
            eff = battery_types[typ][1]
        gv = self.master.sitegv
        if gv == 0.0 or gv == '':
            gv = 120.0
        ld = sum(self.master.load.get_load_profile()['Total'])
        return round((doa*ld)/(gv*doc*eff))
        
    def update_soc(self, i_in, wkDict):
        """ Updates bank capacity by i_in and then updates the 
            Battery elements of wkDict """
        ermsg = 'SOC is less than 0 for i={0}, cap={1}. '
        new_soc = self.soc
        old_soc = self.soc
        i_chg = 0
        bd = 0
        if abs(i_in) > 0:
            i_chg = min(abs(i_in), self.current_capacity())
            i_chg = i_chg * (i_in/abs(i_in))
            bd = self.bnk_vo * i_chg        
            self.cur_cap += i_in
            if self.cur_cap > self.bnk_cap:
               self.cur_cap = self.bnk_cap
            if self.cur_cap <= 0:
                self.cur_cap = 0                
            new_soc = min(self.cur_cap/self.bnk_cap, 1)
            assert new_soc >= 0, ermsg.format(i_in,self.cur_cap)
            self.soc = new_soc 
            self.set_volts()
        wkDict['BD'] = bd
        wkDict['BS'] = self.soc
        wkDict['BP'] = self.current_power()
        self.update_cycle_counts(old_soc - new_soc) 
      
    def show_bank_drain(self):
        """ Create graphic of Battery Bank Drain Performance  """
        if self.master.power_flow  is not None:
            xlabels = np.arange(24)
            pltslist = [
                {'label': 'Best Day Drain', 
                  'data': self.master.power_flow['BatDrain'].loc[
                          self.master.power_flow['DayofYear'] == self.master.mnthly_pwr_perfm[1]],
                  'type': 'Line', 'xaxis': xlabels, 
                  'width': 2.0, 'color': 'b'},
                {'label': 'Worst Day Drain', 
                  'data': self.master.power_flow['BatDrain'].loc[
                          self.master.power_flow['DayofYear'] == self.master.mnthly_pwr_perfm[2]],
                  'type': 'Line', 'xaxis': xlabels , 
                  'width': 2.0, 'color': 'r'}]
            # dp = plot_graphic(self.master.rdw, 'Time of Day', 'Watts', xlabels, 
            #                       pltslist, 'Range of Bank Drain', (6,4))

    def show_bank_soc(self):
        """ Create graphic of Battery Bank SOC Performance  """
        if self.master.power_flow  is not None:
            xlabels = np.arange(24)
            pltslist = [{'label': 'Best Day SOC', 
                         'data': self.master.power_flow ['BatSoc'].loc[
                                 self.master.power_flow['DayofYear'] == self.master.mnthly_pwr_perfm[1]],
                         'type': 'Line', 'xaxis': xlabels, 
                         'width': 2.0, 'color': 'b'},
                {'label': 'Worst Day SOC', 
                         'data': self.master.power_flow ['BatSoc'].loc[
                                 self.master.power_flow['DayofYear'] == self.master.mnthly_pwr_perfm[2]],
                         'type': 'Line', 'xaxis': xlabels , 
                         'width': 2.0, 'color': 'r'}]
            # dp = plot_graphic(self.master.rdw, 'Time of Day', 'SOC', xlabels, 
            #                       pltslist, 'Range of Bank SOC', (6,4))

    def create_overview(self):
        if self.master.power_flow  is not None:
            suns = self.master.site.get_sun_times(self.master.times.index)
            sr_soc = np.zeros(len(suns))
            ss_soc = np.zeros(len(suns))
            day = [None]*len(suns)
            for i in range(len(suns)):
                snr = suns['Sunrise'].iloc[i]
                sns = suns['Sunset'].iloc[i]
                snrtm = snr.floor('H')
                snstm = snr.ceil('H')
                day[i] = snrtm
                sr_soc[i] = self.master.power_flow.loc[snrtm]['BatSoc']
                ss_soc[i] = self.master.power_flow.loc[snstm]['BatSoc']
            bat_ovr = pd.DataFrame(data={'Sunrise':sr_soc, 'Sunset':ss_soc},
                                   index= day)        
            return bat_ovr
    
    def show_bank_overview(self):
        """ Create graphic of Battery Bank Overview Performance  """
        if self.master.power_flow  is not None:
            ovr = self.create_overview()
            xlabels = ovr.index
            pltslist = [{'label': 'Sunrise', 
                         'data': ovr['Sunrise'],
                         'type': 'Line', 'xaxis': xlabels, 
                         'width': 2.0, 'color': 'r'},
                       {'label': 'Sunset', 
                         'data': ovr['Sunset'],
                         'type': 'Line', 'xaxis': xlabels, 
                         'width': 2.0, 'color': 'b'}]
            # dp = plot_graphic(self.master.rdw, 'Month', 'SOC', xlabels, 
            #                       pltslist, 'Bank SOC', (6,4))

def main():
    print ('BatBank Startup check')

if __name__ == '__main__':
    main()
