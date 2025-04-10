# Define API models using Pydantic for request validation
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class SiteParameters(BaseModel):
    cntry: str = Field(..., description="Country")
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    elev: float = Field(..., description="Elevation in meters")
    tz: str = Field(..., description="Timezone identifier")

class PanelParameters(BaseModel):
    Technology: str = Field(..., description="Cell Type")
    T_NOCT: float = Field(..., description="Nominal Operating Cell Temp")
    V_mp_ref: float = Field(..., description="Voltage at Max Power (Vmp)")
    I_mp_ref: float = Field(..., description="Current at Max Power (Imp)")
    V_oc_ref: float = Field(..., description="Open Circuit Voltage (Voc)")
    I_sc_ref: float = Field(..., description="Short Circuit Current (Isc)")
    PTC: float = Field(..., description="Power Rating Pmpp (W)")
    A_c: float = Field(..., description="Cell Size(cm)")
    N_s: int = Field(..., description="Number of cells")
    R_s: float = Field(..., description="Series Resistance (ohms)")
    R_sh_ref: float = Field(..., description="Shunt Resistance (ohms)")
    BIPV: float = Field(..., description="BIPV")
    alpha_sc: float = Field(..., description="alpha_sc")
    beta_oc: float = Field(..., description="beta_oc")
    a_ref: float = Field(..., description="a_ref")
    I_L_ref: float = Field(..., description="I_L_ref")
    I_o_ref: float = Field(..., description="I_o_ref")
    Adjust: float = Field(..., description="Adjust")
    gamma_r: float = Field(..., description="gamma_r")

class BatteryParameters(BaseModel):
    b_typ: str = Field(..., description="Battery type")
    b_nomv: float = Field(..., description="Nominal voltage")
    b_rcap: float = Field(..., description="Capacity in Ah")
    b_rhrs: float = Field(..., description="Hour Basis for Rating")
    b_ir: float = Field(..., description="Internal Resistance (Ohms)")
    b_stdTemp: float = Field(..., description="Rated temperature (C)")
    b_stdTemp: float = Field(..., description="Rated temperature (C)")
    b_tmpc: float = Field(..., description="Temp Coeficient (C")
    b_mxDschg: float = Field(..., description="Max No. of Discharge Cycle")
    b_mxDoD: float = Field(..., description="Depth of Discharge % for Max Lifecycle:")

class ArrayParameters(BaseModel):
    tilt: float = Field(..., description="Tilt Angle (Degrees)")
    azimuth: float = Field(..., description="Azimuth (Degrees)")
    mtg_cnfg: str = Field(..., description="Mounting Configuration")
    mtg_spc: float = Field(..., description="Space under Panel (cm)")
    mtg_hgt: float = Field(..., description="Mounting Height (m)")
    gnd_cnd: str = Field(..., description="Ground Surface Condition")
    albedo: float = Field(..., description="Albedo")
    uis: int = Field(..., description="Units in Series")
    sip: int = Field(..., description="Strings in Parallel")
    ary_Vmp: float = Field(..., description="Array Vmp")
    ary_Imp: float = Field(..., description="Array Imp")
    ary_tpnl: int = Field(..., description="Total Panels")

class BankParameters(BaseModel):
    doa: int = Field(..., description="Days of Autonomy")
    doc: float = Field(..., description="Depth of Discharge (%)")
    bnk_uis: int = Field(..., description="Units in Series")
    bnk_sip: int = Field(..., description="Strings in Parallel")
    bnk_tbats: int = Field(..., description="Total Bank Batteries")
    bnk_cap: float = Field(..., description="Bank Capacity (A-H)")
    bnk_vo: float = Field(..., description="Bank Voltage")

class InverterParameters(BaseModel):
    Vac: float = Field(..., description="AC Voltage (Vac)")
    Paco: float = Field(..., description="AC Power (Watts)")
    Pdco: float = Field(..., description="DC Power Panel (Watts)")
    Vdco: float = Field(..., description="DC Voltage (Vdc)")
    Pnt: float = Field(..., description="Night Time Power (Watts)")
    Vdcmax: float = Field(..., description="Max DC Voltage (Vdcmax)")
    Idcmax: float = Field(..., description="Max DC Current (Idcmax)")
    Mppt_low: float = Field(..., description="Mppt_low (Vdc)")
    Mppt_high: float = Field(..., description="Mppt_high (Vdc)")

class ChargeControllerParameters(BaseModel):
    c_type: str = Field(..., description="Type")
    c_pvmxv: float = Field(..., description="Max PV Voltage (Vdc)")
    c_pvmxi: float = Field(..., description="Max PV Current (A)")
    c_bvnom: float = Field(..., description="Bat Volts (Vdc)")
    c_mvchg: float = Field(..., description="Max Chg Volts (Vdc)")
    c_michg: float = Field(..., description="Max Chg Current (A)")
    c_midschg: float = Field(..., description="Max Dischg Current (A)")
    c_tmpc: float = Field(..., description="Temp Compensation Coefficient (/C)")
    c_tmpr: float = Field(..., description="Temp Rating (C)")
    c_cnsmpt: float = Field(..., description="Self Consumption (W)")
    c_eff: float = Field(..., description="Efficiency (%)")

class LoadProfile(BaseModel):
    Type: str = Field(..., description="Type of load")
    Qty: int = Field(..., description="Quantity")
    Use_Factor: float = Field(..., description="Use Factor")
    Hours: float = Field(..., description="Hours")
    Start_Hour: int = Field(..., description="Start Hour")
    Watts: float = Field(..., description="Watts")
    Mode: str = Field(..., description="Mode")

class SimulationRequest(BaseModel):
    site: SiteParameters
    battery: BatteryParameters
    panel: PanelParameters
    array: ArrayParameters
    secondary_array: Optional[ArrayParameters] = None
    bank: BankParameters
    inverter: InverterParameters
    charge_controller: ChargeControllerParameters
    load_profile: LoadProfile

class SimulationResponse(BaseModel):
    success: bool
    message: str
    overview: Dict[str, Any] = None
    monthly_performance: Dict[str, Any] = None
    power_flow: Dict[str, Any] = None
    service_percentage: float = None
