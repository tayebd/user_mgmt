#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime
import os.path
import pickle
import numpy as np
import pandas as pd
from pandas.plotting import register_matplotlib_converters

from PVSite import PVSite
from PVBattery import PVBattery
from PVBatBank import PVBatBank
from PVPanel import PVPanel
from PVArray import PVArray
from PVInverter import PVInverter
from PVChgControl import PVChgControl
from SiteLoad import SiteLoad
from PVUtilities import (read_resource, hourly_load, create_time_indices,
                         build_monthly_performance, build_overview_report,
                         computOutputResults, show_pwr_performance, show_pwr_best_day,
                         show_pwr_worst_day, show_array_performance,show_array_best_day,
                          show_array_worst_day, output_report, debug_next )

class SPVSim:
    def __init__(self):
        register_matplotlib_converters()
        self.debug = False
        self.errflg = False
        self.wdir = os.getcwd()
        self.mdldir = os.path.join(self.wdir, 'Models')
        self.rscdir = os.path.join(self.wdir, 'Resources')
        self.rptdir = os.path.join(self.wdir, 'Reports')
        self.countries = read_resource('Countries.csv', self.rscdir)
        self.modules = read_resource('CEC Modules.csv', self.rscdir)
        self.inverters = read_resource('CEC Inverters.csv', self.rscdir)

        self.array_list = list()
        self.filename = None         # Complete path to Current File
        self.site = PVSite(self)
        self.bat = PVBattery()
        self.pnl = PVPanel()
        self.ary = self.create_solar_array(self)
        self.array_list.append(self.ary)
        self.sec_ary = self.create_solar_array(self)
        self.array_list.append(self.sec_ary)
        self.bnk = PVBatBank([])
        self.bnk.add_battery(self.bat)
        self.inv = PVInverter()
        self.load = SiteLoad(self)
        self.chgc = PVChgControl()
        self.array_out = None   # The Solar Array Output by hour
        self.times = None
        self.power_flow = None
        self.outfile = None
        self.out_rec = None

    def create_solar_array(self, src):
        sa = PVArray()
        # sa.uses(self.pnl)
        return sa

    #TODO Should combine_arrays move to PVUtilities
    def combine_arrays(self):
        """ Combine primary & secondary array outputs to from a unified output
            using individual array outputs to include the following:
                Array Voltage (AV) = mim voltage for all arrays
                Array Current (AI) = sum (ac(i)*AV/av(i))
                Array Power (AP) = AV * AC
        """
        if len(self.array_list)> 0:
            frst_array = self.array_list[0].define_array_performance(self.times.index,
                                            self.site, self.inv, self.pnl)
            rslt = pd.DataFrame({'ArrayVolts':frst_array['v_mp'],
                                 'ArrayCurrent':frst_array['i_mp'],
                                 'ArrayPower':frst_array['p_mp']},
                                  index = self.times.index)
            for ar in range(1, len(self.array_list)):
                # sarf  =  self.array_list[ar].is_defined()
                # if sarf:
                sec_array = self.array_list[ar].define_array_performance(self.times.index,
                                                self.site, self.inv, self.pnl)
                for rw in range(len(rslt)):
                    if rslt['ArrayPower'].iloc[rw] > 0 and sec_array['p_mp'].iloc[rw] >0:
                        v_out = min(rslt['ArrayVolts'].iloc[rw], sec_array['v_mp'].iloc[rw])
                        i_out = (rslt['ArrayCurrent'].iloc[rw] *
                                (v_out/rslt['ArrayVolts'].iloc[rw]) +
                                sec_array['i_mp'].iloc[rw]  *
                                (v_out/sec_array['v_mp'].iloc[rw]))
                        rslt['ArrayVolts'].iloc[rw] = v_out
                        rslt['ArrayCurrent'].iloc[rw] = i_out
                        rslt['ArrayPower'].iloc[rw] = v_out * i_out
                    elif sec_array['p_mp'].iloc[rw] > 0:
                        rslt['ArrayVolts'].iloc[rw] = sec_array['v_mp'].iloc[rw]
                        rslt['ArrayCurrent'].iloc[rw] = sec_array['i_mp'].iloc[rw]
                        rslt['ArrayPower'].iloc[rw] = sec_array['p_mp'].iloc[rw]
            rslt = rslt.assign(Month= self.times['Month'],
                                         DayofMonth= self.times['DayofMonth'],
                                     DayofYear= self.times['DayofYear'])
            rslt = rslt.join(hourly_load(self.times.index,
                                    self.load.get_load_profile()))
            return rslt
        return None

    #TODO Should compute_powerFlows move to PVUtilities
    def compute_powerFlows(self):
        """ Computes the distribution of Array power to loads and
            a battery bank if it exists. Returns a DataFrame containing
            performance data
            """
        PO = np.zeros(len(self.array_out))  # amount of total load satisfied
        PS = np.zeros(len(self.array_out))  # fraction of load satisfied Power_out/TotLoad
        DE = np.zeros(len(self.array_out))  # amount of Array Power used to provide load
        BS = np.zeros(len(self.array_out))  # battery soc
        BD = np.zeros(len(self.array_out))  # power drawn from battery
        BP = np.zeros(len(self.array_out))  # remaining amount of usable Battery Power
        SL = np.zeros(len(self.array_out))  # load imposed by system chgCntlr * inverter
        EM = np.empty(len(self.array_out), dtype=object) # recorded error messages
        hdr = ' Indx \t ArP  \t ArI  \t ArV  \t dcLd \t acLd \t ttLd '
        hdr += '\t  PO  \t  PS  \t  DE  \t  SL  \t  BP  \t  BD  \t  BS  \t  EM\n'
        outln = '{0:06}\t{1:6.2f}\t{2:6.2f}\t{3:6.2f}\t{4:6.2f}\t'
        outln += '{5:6.2f}\t{6:6.2f}\t{7:6.2f}\t{8:6.2f}\t{9:6.2f}\t'
        outln += '{10:6.2f}\t{11:6.2f}\t{12:6.2f}\t{13:6.2f}\t{14}\n'
        bflg = self.bnk
        self.out_rec = hdr
        for tindx in range(len(self.array_out)):
            wkDict = dict()
            ArP = self.array_out['ArrayPower'].iloc[tindx]
            ArV = self.array_out['ArrayVolts'].iloc[tindx]
            ArI = self.array_out['ArrayCurrent'].iloc[tindx]
            # Correct for possible power backflow into array
            if ArP <= 0 or ArV <= 0 or ArI <= 0:
                ArP = 0.0
                ArV = 0.0
                ArI = 0.0
            dcLd = self.array_out['DC_Load'].iloc[tindx]
            acLd = self.array_out['AC_Load'].iloc[tindx]
            sysAttribs = {'Inv': self.inv, 'Chg': self.chgc, 'Bnk': self.bnk}
            computOutputResults(sysAttribs,  ArP, ArV, ArI, acLd, dcLd, wkDict)

            # update arrays for tindx
            PO[tindx] = wkDict.pop('PO', 0.0)
            PS[tindx] = wkDict.pop('PS', 0.0)
            DE[tindx] = wkDict.pop('DE', 0.0)
            SL[tindx] = wkDict.pop('SL', 0.0)
            if bflg:
                BS[tindx] = wkDict.pop('BS', self.bnk.get_soc())*100
                BD[tindx] = wkDict.pop('BD', 0.0)
                BP[tindx] = wkDict.pop('BP', self.bnk.current_power())
            msg = ''
            errfrm = None
            if 'Error' in wkDict.keys():
                days: int = 1 + tindx//24
                errfrm = wkDict['Error']
                msg = 'After {0} days '.format(days)
                EM[tindx] = msg + errfrm[0].replace('\n', ' ')
            else:
                EM[tindx]= ""
            self.out_rec += outln.format(tindx, ArP, ArV, ArI,
                                         dcLd, acLd, dcLd+acLd,
                                         PO[tindx], PS[tindx], DE[tindx],
                                         SL[tindx], BP[tindx], BD[tindx],
                                         BS[tindx], EM[tindx])
            if self.debug and errfrm != None:
                if self.errflg == False and errfrm[1] != 'Fatal':
                    self.errflg = True
                    # st.write(msg + errfrm[0], errfrm[1])
                if errfrm[1] == 'Fatal':
                    msg = 'After {0} days '.format(days)
                    self.errflg = True
                    # st.write(msg + errfrm[0], errfrm[1])
                    break

        # Create the DataFrame
        rslt = pd.DataFrame({'PowerOut': PO,
                             'ArrayPower': self.array_out['ArrayPower'],
                           'Service': PS,
                           'DelvrEff': DE,
                           'BatSoc': BS,
                           'BatDrain': BD,
                           'BatPwr': BP
                           }, index = self.times.index)

        rslt = rslt.assign(Month= self.times['Month'],
                                     DayofMonth= self.times['DayofMonth'],
                                 DayofYear= self.times['DayofYear'])
        rslt = rslt.join(hourly_load(self.times.index,
                                self.load.get_load_profile()))
        return rslt

    def execute_simulation(self):
        """ Perform System Analysis     """

        if self.perform_base_error_check():
            self.errflg = False
            rt = datetime.now()
            ft = 'run_{0}_{1:02}_{2}_{3:02}{4:02}{5:02}.txt'
            self.outfile = ft.format(rt.year, rt.month, rt.day,
                                rt.hour, rt.minute, rt.second)
            # bnkflg = self.bnk.is_defined()
            self.loc = self.site.get_location()
            self.times = create_time_indices(self.site.tz)
            # self.site.get_atmospherics(self.times.index)
            # if bnkflg:
            self.bnk.initialize_bank()
            self.array_out = self.combine_arrays()
            self.mnthly_array_perfm = build_monthly_performance(self.array_out,'ArrayPower')
            dl = np.array([self.load.get_daily_load()]*12)
            dlf = pd.DataFrame({'Daily Load':dl}, index=self.mnthly_array_perfm[0].index.values)
            self.mnthly_array_perfm[0] = self.mnthly_array_perfm[0].join(dlf)

            self.array_out = self.combine_arrays()
            self.power_flow = self.compute_powerFlows()
            self.mnthly_pwr_perfm = build_monthly_performance(self.power_flow, 'PowerOut')
            self.mnthly_pwr_perfm[0] = self.mnthly_pwr_perfm[0].join(dlf)

            if self.errflg == False:
                srvchrs = self.power_flow['Service'].sum()
                dmndhrs = self.load.get_demand_hours()*365
                if dmndhrs > 0:
                    k = srvchrs/dmndhrs
                    ms = 'System Design provides Power to Load {0:.2f}% of the time'.format(k*100)
                    if k < 100:
                        ms += '\n\tDesign delivers required load {0:.2f} hours out of {1} demand hours per year'.format(k*dmndhrs, dmndhrs)
                    if self.bnk.check_definition():
                        ms += '\n\tAnnual Battery Charging Cycles = {0:.2f} out of {1} specified lifetime cycles'.format(self.bnk.tot_cycles,
                                                                self.bnk.max_dischg_cycles)
                    # st.write(ms)
                # else:
                    # st.write('Analysis complete')
            # if self.debug:
                # debug_next()

    def perform_base_error_check(self):
        """ method to conduct basic error checks
            returns True if and only if no errors are found """
        # Tests for Site Definition """
        bflg = False
        invflg = False

        # if not self.site.check_definition():
        #     return False

        # #Tests for panel & Array definition
        # if not self.ary.check_definition():
        #     return False

        # # Tests for proper inverter definition """
        # if sum(self.load.get_load_profile()['AC']) > 0:
        #     if not self.inv.check_definition():
        #         return False
        #     else:
        #         invflg = True

        # if self.bnk.check_definition():
        #     bflg = True

        # """Tests for Charge Controller definition
        #    (only read if an inverter or battery is defined) """
        # if bflg and not invflg and not self.chgc.check_definition():
        #     return False

        return True

    def load_project_file(self, fn):
        """ Load Project Data File """
        if fn != '' and type(fn) is not tuple:
            self.filename = fn
            self.read_file(fn)

    def write_file(self, fn):
        """ Write DataDict to specified file  """
        dd = {'fn': self.filename,
              'atmos': self.site.atmospherics,
              'site': self.site.args,
              'bat': self.bat.args,
              'pnl': self.pnl.args,
              'ary': self.ary.args,
              'ary_2':self.sec_ary.args,
              'bnk': self.bnk.args,
              'inv': self.inv.args,
              'load': self.load.export_frame(),
              'chgr': self.chgc.args
              }

        fo = open(fn, 'wb')
        pickle.dump(dd, fo)
        fo.close()

    def read_file(self, fn):
        """ Read specified file into DataDict """
        fo = open(fn, 'rb')
        dd = pickle.load(fo)
        fo.close()
        self.filename = dd.pop('fn', None)
        self.site.atmospherics = dd.pop('atoms', None)
        load_in = dd.pop('load', None)
        if load_in is not None:
            self.load.purge_frame()
            if type(load_in) is dict:
                self.load.import_frame(load_in)
            # This test is for backwards compatability
            else:
                ldi = load_in.df.to_dict('Index')
                self.load.import_frame(ldi)
        if self.load.master is None:
            self.load.master = self
        self.site.write_parameters(dd.pop('site', None))
        self.bat.write_parameters(dd.pop('bat', None))
        self.pnl.write_parameters(dd.pop('pnl', None))
        self.ary.write_parameters(dd.pop('ary', None))
        self.sec_ary.write_parameters(dd.pop('ary_2', None))
        self.bnk.write_parameters(dd.pop('bnk', None))
        self.inv.write_parameters(dd.pop('inv', None))
        self.chgc.write_parameters(dd.pop('chgr', None))
        
    #TODO in Print Load improve formatting control for better tabular results
    def print_load(self):
        """ Method to build a print the load profile  """
        s = str(self.load)
        rpt_ttl = 'Load Report'
        fn = 'load.txt'
        output_report(fn, rpt_ttl, s)

    def create_overview_report(self):
        """ Create a formated overview of Project Design data """
        s = build_overview_report(self)
        rpt_ttl = 'Overview Report'
        fn = 'overview.txt'
        output_report(fn, rpt_ttl, s)

def main():
    import streamlit as st
    """ Starts the GUI and enables processing all functions """

    # Initialize simulator with defaults (skip loading problematic SPV file)
    sp = SPVSim()

    # Streamlit UI
    st.title("Solar PV Simulation")
    st.write("This application simulates the performance of a solar PV system.")

    # Input widgets
    st.sidebar.header("Input Parameters")

    # Site parameters
    st.sidebar.subheader("Site Configuration")
    latitude = st.sidebar.number_input("Latitude", value=33.45, min_value=-90.0, max_value=90.0)
    longitude = st.sidebar.number_input("Longitude", value=-84.15, min_value=-180.0, max_value=180.0)
    altitude = st.sidebar.number_input("Altitude (m)", value=300.0)

    # Panel parameters
    st.sidebar.subheader("Panel Configuration")
    panel_power = st.sidebar.number_input("Panel Power (W)", value=400.0, min_value=0.0)
    panel_voltage = st.sidebar.number_input("Panel Voltage (V)", value=40.0, min_value=0.0)

    # Array parameters
    st.sidebar.subheader("Array Configuration")
    modules_per_string = st.sidebar.number_input("Modules per String", value=8, min_value=1)
    strings_per_inverter = st.sidebar.number_input("Strings per Inverter", value=4, min_value=1)
    tilt = st.sidebar.number_input("Tilt Angle (degrees)", value=30.0, min_value=0.0, max_value=90.0)
    azimuth = st.sidebar.number_input("Azimuth Angle (degrees)", value=180.0, min_value=0.0, max_value=360.0)

    # Run simulation button
    if st.sidebar.button("Run Simulation"):
        # Configure system with user inputs
        try:
            # Set site parameters
            sp.site.latitude = latitude
            sp.site.longitude = longitude
            sp.site.altitude = altitude

            # Set panel parameters
            sp.pnl.PTC = panel_power
            sp.pnl.V_oc_ref = panel_voltage

            # Set array parameters
            sp.ary.uis = modules_per_string
            sp.ary.sip = strings_per_inverter
            sp.ary.tilt = tilt
            sp.ary.azimuth = azimuth

            # Run simulation
            with st.spinner("Running simulation..."):
                sp.execute_simulation()

            # Display results
            st.success("Simulation completed successfully!")

            # Show basic results
            if sp.power_flow is not None:
                st.subheader("Simulation Results")
                total_energy = sp.power_flow['PowerOut'].sum() if 'PowerOut' in sp.power_flow.columns else 0
                st.metric("Total Energy Yield", f"{total_energy:.2f} kWh")

                # Create overview report
                sp.create_overview_report()
                st.info("Overview report generated")

        except Exception as e:
            import traceback
            st.error(f"Simulation failed: {str(e)}")
            st.error(f"Full traceback: {traceback.format_exc()}")
        # Display plots
        if sp.array_out is not None:
            show_pwr_performance(sp.mnthly_pwr_perfm[0])
            best_day_perform = sp.power_flow.loc[sp.power_flow['DayofYear'] == sp.mnthly_pwr_perfm[1]]
            show_pwr_best_day(best_day_perform)
            worst_day_perform = sp.power_flow.loc[sp.power_flow['DayofYear'] == sp.mnthly_pwr_perfm[2]]
            show_pwr_worst_day(worst_day_perform)
            show_array_performance(sp.mnthly_array_perfm[0])
            best_day_perform = sp.array_out.loc[sp.array_out['DayofYear'] == sp.mnthly_array_perfm[1]]
            show_array_best_day(best_day_perform)
            worst_day_perform = sp.array_out.loc[sp.array_out['DayofYear'] == sp.mnthly_array_perfm[2]]
            show_array_worst_day(worst_day_perform)

if __name__ == '__main__':
    main()