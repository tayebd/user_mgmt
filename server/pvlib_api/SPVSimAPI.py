#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime
import os.path
import pickle
import json
import numpy as np
import pandas as pd
from pandas.plotting import register_matplotlib_converters
from fastapi import FastAPI, HTTPException, Request
# from typing import Dict, List, Optional, Any, Union
import uvicorn
from APIModels import *
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


# Create FastAPI app
app = FastAPI(title="PV Simulation API", 
              description="API for running solar PV simulations",
              version="1.0.0")

class SPVSim:
    def __init__(self):
        register_matplotlib_converters()
        self.debug = False
        self.errflg = False
        # self.wdir = os.getcwd()
        # self.mdldir = os.path.join(self.wdir, 'Models')
        # self.rscdir = os.path.join(self.wdir, 'Resources')
        # self.rptdir = os.path.join(self.wdir, 'Reports')
        # self.countries = read_resource('Countries.csv', self.rscdir)
        # self.modules = read_resource('CEC Modules.csv', self.rscdir)
        # self.inverters = read_resource('CEC Inverters.csv', self.rscdir)

        self.array_list = list()
        self.filename = None         # Complete path to Current File
        self.site = PVSite(self)
        self.bat = PVBattery()
        self.pnl = PVPanel()
        self.ary = self.create_solar_array()
        self.array_list.append(self.ary)
        self.bnk = PVBatBank()
        self.bnk.add_battery(self.bat)
        self.inv = PVInverter()
        self.load = SiteLoad()
        self.chgc = PVChgControl()
        self.array_out = None   # The Solar Array Output by hour
        self.times = None
        self.power_flow = None
        self.outfile = None
        self.out_rec = None
        self.simulation_results = {}

    def create_solar_array(self):
        sa = PVArray()
        # sa.uses(self.pnl)
        return sa

    def configure_from_request(self, request_data: SimulationRequest):
        """Configure the simulation from the API request data"""
        # Set site attributes directly
        # if 'site' in request_data and request_data.site:
        self.site.cntry = request_data.site.cntry
        self.site.lat = request_data.site.lat
        self.site.lon = request_data.site.lon
        self.site.elev = request_data.site.elev
        print(f"Configured site: cntry={self.site.cntry}, lat={self.site.lat}, lon={self.site.lon}, elev={self.site.elev}")
        print(f"Request data site: {request_data.site}")
        print(f"Site object after configuration: {self.site.__dict__}")
        
        # Handle timezone conversion safely
        tz_input = request_data.site.tz
        if isinstance(tz_input, str):
            if tz_input.upper() == 'UTC':
                self.site.tz = 0
            else:
                try:
                    self.site.tz = float(tz_input)
                except (ValueError, TypeError):
                    self.site.tz = 0
        else:
            self.site.tz = tz_input
        
        # Set battery attributes directly
        self.bat.b_typ = request_data.battery.b_typ
        self.bat.b_nomv = request_data.battery.b_nomv
        self.bat.b_rcap = request_data.battery.b_rcap
        self.bat.b_rhrs = request_data.battery.b_rhrs
        self.bat.b_ir = request_data.battery.b_ir
        self.bat.b_stdTemp = request_data.battery.b_stdTemp
        self.bat.b_tmpc = request_data.battery.b_tmpc
        self.bat.b_mxDschg = request_data.battery.b_mxDschg
        self.bat.b_mxDoD = request_data.battery.b_mxDoD

        # Set panel attributes directly
        self.pnl.Technology = request_data.panel.Technology
        self.pnl.T_NOCT = request_data.panel.T_NOCT
        self.pnl.V_mp_ref = request_data.panel.V_mp_ref
        self.pnl.I_mp_ref = request_data.panel.I_mp_ref
        self.pnl.V_oc_ref = request_data.panel.V_oc_ref
        self.pnl.I_sc_ref = request_data.panel.I_sc_ref
        self.pnl.PTC = request_data.panel.PTC
        self.pnl.A_c = request_data.panel.A_c
        self.pnl.N_s = request_data.panel.N_s
        self.pnl.R_s = request_data.panel.R_s
        self.pnl.R_sh_ref = request_data.panel.R_sh_ref
        self.pnl.BIPV = request_data.panel.BIPV
        self.pnl.alpha_sc = request_data.panel.alpha_sc
        self.pnl.beta_oc = request_data.panel.beta_oc
        self.pnl.a_ref = request_data.panel.a_ref
        self.pnl.I_L_ref = request_data.panel.I_L_ref
        self.pnl.I_o_ref = request_data.panel.I_o_ref
        self.pnl.Adjust = request_data.panel.Adjust
        self.pnl.gamma_r = request_data.panel.gamma_r

        # Set array attributes directly
        self.ary.tilt = request_data.array.tilt
        self.ary.azimuth = request_data.array.azimuth
        self.ary.mtg_cnfg = request_data.array.mtg_cnfg
        self.ary.mtg_spc = request_data.array.mtg_spc
        self.ary.mtg_hgt = request_data.array.mtg_hgt
        self.ary.gnd_cnd = request_data.array.gnd_cnd
        self.ary.albedo = request_data.array.albedo
        self.ary.uis = request_data.array.uis
        self.ary.sip = request_data.array.sip
        self.ary.ary_Vmp = request_data.array.ary_Vmp
        self.ary.ary_Imp = request_data.array.ary_Imp
        self.ary.ary_tpnl = request_data.array.ary_tpnl

        # Configure secondary array if provided
        if request_data.secondary_array:
            self.sec_ary = self.create_solar_array()
            self.array_list.append(self.sec_ary)
            self.sec_ary.tilt = request_data.secondary_array.tilt
            self.sec_ary.azimuth = request_data.secondary_array.azimuth
            self.sec_ary.mtg_cnfg = request_data.secondary_array.mtg_cnfg
            self.sec_ary.mtg_spc = request_data.secondary_array.mtg_spc
            self.sec_ary.mtg_hgt = request_data.secondary_array.mtg_hgt
            self.sec_ary.gnd_cnd = request_data.secondary_array.gnd_cnd
            self.sec_ary.albedo = request_data.secondary_array.albedo
            self.sec_ary.uis = request_data.secondary_array.uis
            self.sec_ary.sip = request_data.secondary_array.sip
            self.sec_ary.ary_Vmp = request_data.secondary_array.ary_Vmp
            self.sec_ary.ary_Imp = request_data.secondary_array.ary_Imp
            self.sec_ary.ary_tpnl = request_data.secondary_array.ary_tpnl

        # Set bank attributes directly
        self.bnk.doa = request_data.bank.doa
        self.bnk.doc = request_data.bank.doc
        self.bnk.bnk_uis = request_data.bank.bnk_uis
        self.bnk.bnk_sip = request_data.bank.bnk_sip
        self.bnk.bnk_tbats = request_data.bank.bnk_tbats
        self.bnk.bnk_cap = request_data.bank.bnk_cap
        self.bnk.bnk_vo = request_data.bank.bnk_vo

        # Set inverter attributes directly
        self.inv.Vac = request_data.inverter.Vac
        self.inv.Paco = request_data.inverter.Paco
        self.inv.Pdco = request_data.inverter.Pdco
        self.inv.Vdco = request_data.inverter.Vdco
        self.inv.Pnt = request_data.inverter.Pnt
        self.inv.Vdcmax = request_data.inverter.Vdcmax
        self.inv.Idcmax = request_data.inverter.Idcmax
        self.inv.Mppt_low = request_data.inverter.Mppt_low
        self.inv.Mppt_high = request_data.inverter.Mppt_high

        # Set charge controller attributes directly
        self.chgc.c_type = request_data.charge_controller.c_type
        self.chgc.c_pvmxv = request_data.charge_controller.c_pvmxv
        self.chgc.c_pvmxi = request_data.charge_controller.c_pvmxi
        self.chgc.c_bvnom = request_data.charge_controller.c_bvnom
        self.chgc.c_mvchg = request_data.charge_controller.c_mvchg
        self.chgc.c_michg = request_data.charge_controller.c_michg
        self.chgc.c_midschg = request_data.charge_controller.c_midschg
        self.chgc.c_tmpc = request_data.charge_controller.c_tmpc
        self.chgc.c_tmpr = request_data.charge_controller.c_tmpr
        self.chgc.c_cnsmpt = request_data.charge_controller.c_cnsmpt
        self.chgc.c_eff = request_data.charge_controller.c_eff

        # Configure load profile
        self.load.purge_frame()
        load_values = [
            request_data.load_profile.Type,
            request_data.load_profile.Qty,
            request_data.load_profile.Use_Factor,
            request_data.load_profile.Hours,
            request_data.load_profile.Start_Hour,
            request_data.load_profile.Watts,
            request_data.load_profile.Mode
        ]
        self.load.add_new_row(load_values)
        elp = self.load.get_load_profile()
        print(elp)

    def combine_arrays(self):
        """ Combine primary & secondary array outputs to from a unified output
            using individual array outputs to include the following:
                Array Voltage (AV) = mim voltage for all arrays
                Array Current (AI) = sum (ac(i)*AV/av(i))
                Array Power (AP) = AV * AC
        """
        if not hasattr(self, 'array_list') or not self.array_list:
            raise ValueError("No arrays defined in array_list")
            
        if not hasattr(self, 'times') or self.times is None:
            raise ValueError("Times index not initialized")
            
        try:
            if len(self.array_list) > 0:
                if not isinstance(self.array_list[0], PVArray):
                    raise ValueError("First array is not a valid PVArray object")
                print("define_array_performance",len(self.array_list)  )

                frst_array = self.array_list[0].define_array_performance(self.times.index,
                                                self.site, self.inv, self.pnl)
                
                print("after: define_array_performance")

                rslt = pd.DataFrame({'ArrayVolts':frst_array['v_mp'],
                                   'ArrayCurrent':frst_array['i_mp'],
                                   'ArrayPower':frst_array['p_mp']},
                                   index=self.times.index)
                
                for ar in range(1, len(self.array_list)):
                    sarf = self.array_list[ar]
                    if sarf and isinstance(sarf, PVArray):
                        try:
                            print("define_array_performance 2:", ar, self.inv, self.pnl)

                            sec_array = self.array_list[ar].define_array_performance(
                                self.times.index, self.site, self.inv, self.pnl)
                            print("after define_array_performance 2")

                            for rw in range(len(rslt)):
                                if rslt['ArrayPower'].iloc[rw] > 0 and sec_array['p_mp'].iloc[rw] > 0:
                                    v_out = min(rslt['ArrayVolts'].iloc[rw], sec_array['v_mp'].iloc[rw])
                                    i_out = (rslt['ArrayCurrent'].iloc[rw] * (v_out/rslt['ArrayVolts'].iloc[rw]) +
                                            sec_array['i_mp'].iloc[rw] * (v_out/sec_array['v_mp'].iloc[rw]))
                                    rslt['ArrayVolts'].iloc[rw] = v_out
                                    rslt['ArrayCurrent'].iloc[rw] = i_out
                                    rslt['ArrayPower'].iloc[rw] = v_out * i_out
                                elif sec_array['p_mp'].iloc[rw] > 0:
                                    rslt['ArrayVolts'].iloc[rw] = sec_array['v_mp'].iloc[rw]
                                    rslt['ArrayCurrent'].iloc[rw] = sec_array['i_mp'].iloc[rw]
                                    rslt['ArrayPower'].iloc[rw] = sec_array['p_mp'].iloc[rw]
                        except Exception as e:
                            raise ValueError(f"Error processing secondary array {ar}: {str(e)}")
                
                rslt = rslt.assign(Month=self.times['Month'],
                                  DayofMonth=self.times['DayofMonth'],
                                  DayofYear=self.times['DayofYear'])
                rslt = rslt.join(hourly_load(self.times.index, self.load.get_load_profile()))
                return rslt
        except Exception as e:
            raise ValueError(f"Error combining arrays: {str(e)}")
        return None

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
        """ Perform System Analysis and return results as JSON-serializable dict """
        results = {
            "success": False,
            "message": "Simulation failed",
            "overview": {"text": ""},
            "monthly_performance": {"monthly_averages": [], "best_day": [], "worst_day": []},
            "power_flow": {"data": []},
            "service_percentage": 0.0
        }

        if self.perform_base_error_check():
            self.errflg = False
            rt = datetime.now()
            ft = 'run_{0}_{1:02}_{2}_{3:02}{4:02}{5:02}.txt'
            self.outfile = ft.format(rt.year, rt.month, rt.day,
                                rt.hour, rt.minute, rt.second)
            bnkflg = self.bnk
            if hasattr(self.site, 'get_location'):
                self.loc = self.site.get_location()
            else:
                raise ValueError("Site object does not have a get_location method")
            self.times = create_time_indices(self.site.tz)
            # self.site.get_atmospherics(self.times.index)
            if bnkflg:
                self.bnk.initialize_bank()
            print("combine arrays 1:")

            self.array_out = self.combine_arrays()
            print("build_monthly_performance")

            self.mnthly_array_perfm = build_monthly_performance(self.array_out,'ArrayPower')
            print("get_daily_load")

            dl = np.array([self.load.get_daily_load()]*12)
            dlf = pd.DataFrame({'Daily Load':dl}, index=self.mnthly_array_perfm[0].index.values)
            self.mnthly_array_perfm[0] = self.mnthly_array_perfm[0].join(dlf)
            print("combine arrays")
            self.array_out = self.combine_arrays()
            print("compute_powerFlows")

            self.power_flow = self.compute_powerFlows()
            print("build_monthly_performance")

            self.mnthly_pwr_perfm = build_monthly_performance(self.power_flow, 'PowerOut')
            self.mnthly_pwr_perfm[0] = self.mnthly_pwr_perfm[0].join(dlf)

            if self.errflg == False:
                srvchrs = self.power_flow['Service'].sum()
                dmndhrs = self.load.get_demand_hours()*365
                service_percentage = 0.0
                
                if dmndhrs > 0:
                    k = srvchrs/dmndhrs
                    service_percentage = k * 100
                    ms = 'System Design provides Power to Load {0:.2f}% of the time'.format(k*100)
                    if k < 100:
                        ms += '\n\tDesign delivers required load {0:.2f} hours out of {1} demand hours per year'.format(k*dmndhrs, dmndhrs)
                    if self.bnk.tot_cycles:
                        ms += '\n\tAnnual Battery Charging Cycles = {0:.2f} out of {1} specified lifetime cycles'.format(self.bnk.tot_cycles,
                                                                self.bnk.max_dischg_cycles)
                    
                    # Prepare properly formatted results
                    results["success"] = True
                    results["message"] = ms
                    results["service_percentage"] = service_percentage
                    
                    try:
                        # Format overview report
                        overview_text = build_overview_report(self)
                        results["overview"]["text"] = overview_text
                        
                        # Format monthly performance data
                        monthly_data = self.format_monthly_performance()
                        if monthly_data:
                            results["monthly_performance"].update(monthly_data)
                        
                        # Format power flow data
                        power_flow_data = self.format_power_flow_data()
                        if power_flow_data:
                            results["power_flow"]["data"] = power_flow_data
                    except Exception as e:
                        results["message"] = f"Error formatting results: {str(e)}"
                        results["success"] = False
                    
                    # Store results for later retrieval
                    self.simulation_results = results
                    
                    return results
                else:
                    results["message"] = "No demand hours specified"
                    return results
            else:
                results["message"] = "Error occurred during simulation execution"
                return results
        else:
            results["message"] = "Base error check failed"
            return results

    def format_monthly_performance(self):
        """Format monthly performance data for JSON serialization"""
        if not hasattr(self, 'mnthly_pwr_perfm') or self.mnthly_pwr_perfm is None:
            return {}
            
        # Create a structured representation of monthly performance data
        result = {
            "monthly_averages": [],
            "best_day": [], 
            "worst_day": []
        }
        
        try:
            # Format the first DataFrame in the tuple (monthly averages)
            if isinstance(self.mnthly_pwr_perfm[0], pd.DataFrame):
                monthly_df = self.mnthly_pwr_perfm[0]
                result["monthly_averages"] = json.loads(
                    monthly_df.reset_index().to_json(orient='records', date_format='iso')
                )
            
            # Format the second DataFrame in the tuple (best day)
            if len(self.mnthly_pwr_perfm) > 1 and isinstance(self.mnthly_pwr_perfm[1], pd.DataFrame):
                best_day_df = self.mnthly_pwr_perfm[1]
                result["best_day"] = json.loads(
                    best_day_df.reset_index().to_json(orient='records', date_format='iso')
                )
            
            # Format the third DataFrame in the tuple (worst day)
            if len(self.mnthly_pwr_perfm) > 2 and isinstance(self.mnthly_pwr_perfm[2], pd.DataFrame):
                worst_day_df = self.mnthly_pwr_perfm[2]
                result["worst_day"] = json.loads(
                    worst_day_df.reset_index().to_json(orient='records', date_format='iso')
                )
                
        except Exception as e:
            print(f"Error formatting monthly performance: {str(e)}")
            # Return empty results structure on error
            return {
                "monthly_averages": [],
                "best_day": [],
                "worst_day": []
            }
            
        return result

    def format_power_flow_data(self):
        """Format power flow data for JSON serialization"""
        if self.power_flow is None:
            return {}
            
        # Sample the data (e.g., daily average) to reduce size
        # This is important for API responses to avoid overwhelming bandwidth
        daily_power = self.power_flow.resample('D').mean()
        
        # Convert to JSON-compatible format
        return json.loads(daily_power.reset_index().to_json(orient='records', date_format='iso'))

    def get_results_json(self):
        """Return simulation results as JSON string"""
        if not self.simulation_results:
            return json.dumps({"success": False, "message": "No simulation results available"})
        return json.dumps(self.simulation_results, cls=NumpyEncoder)

    def perform_base_error_check(self):
        """ method to conduct basic error checks
            returns True if and only if no errors are found """
        # Tests for Site Definition """
        bflg = False
        invflg = False

        if not hasattr(self.site, 'lat') or not self.site.lat:
            print(f"Base error check failed: site.lat is {self.site.lat}")
            print(f"Site object during base error check: {self.site.__dict__}")
            print(f"Site object attributes: {self.site.__dict__.keys()}")
            return False

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

        print("Base error check passed")
        return True

    # def load_project_file(self, fn):
    #     """ Load Project Data File """
    #     if fn != '' and type(fn) is not tuple:
    #         self.filename = fn
    #         self.read_file(fn)

    # def write_file(self, fn):
    #     """ Write DataDict to specified file  """
    #     dd = {'fn': self.filename,
    #           'atmos': self.site.atmospherics,
    #           'site': self.site.args,
    #           'bat': self.bat.args,
    #           'pnl': self.pnl.args,
    #           'ary': self.ary.args,
    #           'ary_2':self.sec_ary.args,
    #           'bnk': self.bnk.args,
    #           'inv': self.inv.args,
    #           'load': self.load.export_frame(),
    #           'chgr': self.chgc.args
    #           }

    #     fo = open(fn, 'wb')
    #     pickle.dump(dd, fo)
    #     fo.close()

    # def read_file(self, fn):
    #     """ Read specified file into DataDict """
    #     fo = open(fn, 'rb')
    #     dd = pickle.load(fo)
    #     fo.close()
    #     self.filename = dd.pop('fn', None)
    #     self.site.atmospherics = dd.pop('atmos', None)
    #     load_in = dd.pop('load', None)
    #     if load_in is not None:
    #         self.load.purge_frame()
    #         if type(load_in) is dict:
    #             self.load.import_frame(load_in)
    #         # This test is for backwards compatability
    #         else:
    #             ldi = load_in.df.to_dict('Index')
    #             self.load.import_frame(ldi)
    #     if self.load.master is None:
    #         self.load.master = self
    #     # Update component attributes from saved data
    #     if 'site' in dd:
    #         self.site.__dict__.update(dd.pop('site'))
    #     if 'bat' in dd:
    #         self.bat.__dict__.update(dd.pop('bat'))
    #     if 'pnl' in dd:
    #         self.pnl.__dict__.update(dd.pop('pnl'))
    #     if 'ary' in dd:
    #         self.ary.__dict__.update(dd.pop('ary'))
    #     if 'ary_2' in dd:
    #         self.sec_ary.__dict__.update(dd.pop('ary_2'))
    #     if 'bnk' in dd:
    #         self.bnk.__dict__.update(dd.pop('bnk'))
    #     if 'inv' in dd:
    #         self.inv.__dict__.update(dd.pop('inv'))
    #     if 'chgr' in dd:
    #         self.chgc.__dict__.update(dd.pop('chgr'))
        
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

# Create API routes
@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: Request, request_data: SimulationRequest):
    try:
        print("Incoming request data:", request_data)

        # Create a new simulation instance
        sim = SPVSim()

        print("Created SSPVSim:")

        # Configure the simulation from the request data
        sim.configure_from_request(request_data)

        print("Configue SSPVSim:")
        # overview_text = build_overview_report(sim)
        # print(overview_text)
        # Run the simulation
        results = sim.execute_simulation()

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "PV Simulation API is running. POST to /simulate to run a simulation."}

# Launch the application with uvicorn when run directly
if __name__ == "__main__":
    uvicorn.run("SPVSimAPI:app", host="0.0.0.0", port=8001, reload=True)

def main():
    pass
    # sp = SPVSim()
    # sp.load_project_file('Models/test2.spv')
    # print(sp.site)
    # print(sp.pnl)
    # print(sp.bat)
    # print(sp.inv)
    # sp.execute_simulation()
    # sp.print_load()
    # sp.create_overview_report()
    # sp.write_file('project.txt')

    # # Run simulation button
    # sp.execute_simulation()
    # # Display plots
    # if sp.array_out is not None:
    #     show_pwr_performance(sp.mnthly_pwr_perfm[0])
    #     best_day_perform = sp.power_flow.loc[sp.power_flow['DayofYear'] == sp.mnthly_pwr_perfm[1]]
    #     show_pwr_best_day(best_day_perform)
    #     worst_day_perform = sp.power_flow.loc[sp.power_flow['DayofYear'] == sp.mnthly_pwr_perfm[2]]
    #     show_pwr_worst_day(worst_day_perform)
    #     show_array_performance(sp.mnthly_array_perfm[0])
    #     best_day_perform = sp.array_out.loc[sp.array_out['DayofYear'] == sp.mnthly_array_perfm[1]]
    #     show_array_best_day(best_day_perform)
    #     worst_day_perform = sp.array_out.loc[sp.array_out['DayofYear'] == sp.mnthly_array_perfm[2]]
    #     show_array_worst_day(worst_day_perform)

if __name__ == '__main__':
    main()
