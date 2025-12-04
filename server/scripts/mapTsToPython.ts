// Type definitions based on Prisma schema
type PVPanel = {
  id: number;
  // maker: string;
  // model: string;
  // description?: string;
  tempCoeffPmax?: number;
  tempCoeffIsc?: number;
  tempCoeffVoc?: number;
  tempCoeffIpmax?: number;
  tempCoeffVpmax?: number;
  moduleType?: string;
  shortSide?: number;
  longSide?: number;
  weight?: number;
  performanceWarranty?: string;
  productWarranty?: string;
  efficiency?: number;
  openCircuitVoltage?: number;
  shortCircuitCurrent?: number;
  maxPower?: number;
  certification?: string;
  currentAtPmax?: number;
  voltageAtPmax?: number;
};

type Inverter = {
  id: number;
  // model: string;
  // description?: string;
  // maker?: string;
  outputVoltage?: number;
  nominalOutputPower?: number;
  maxRecommendedPvPower?: number;
  nominalDcVoltage?: number;
  maxDcVoltage?: number;
  maxInputCurrentPerMppt?: number;
  mpptVoltageRangeMin?: number;
  mpptVoltageRangeMax?: number;
  // Other fields omitted for brevity
};

type PVArray = {
  id: number;
  tiltAngle: number;
  azimuthAngle: number;
  mountingConfiguration?: string;
  spaceUnderPanel: number;
  mountingHeight: number;
  groundSurfaceCondition?: string;
  albedo: number;
  unitsInSeries: number;
  stringsInParallel: number;
  arrayVmp: number;
  arrayImp: number;
  totalPanels: number;
  projectId: number;
};

type Battery = {
  id: number;
  // maker: string;
  // model: string;
  // description?: string;
  batteryType: string;
  nominalVoltage: number;
  ratedCapacity: number;
  hourBasisForRating: number;
  internalResistance: number;
  ratedTemperature: number;
  temperatureCoefficient: number;
  maxDischargeCycles: number;
  maxDepthOfDischarge: number;
};

type BatteryBank = {
  id: number;
  daysOfAutonomy: number;
  depthOfDischarge: number;
  unitsInSeries: number;
  stringsInParallel: number;
  totalBankBatteries: number;
  bankCapacity: number;
  bankVoltage: number;
  batteryId: number;
  projectId: number;
};

type ChargeController = {
  id: number;
  // maker: string;
  // model: string;
  // description?: string;
  controllerType: string;
  maxPVVoltage: number;
  maxPVCurrent: number;
  batteryVoltage: number;
  maxChargeVoltage: number;
  maxChargeCurrent: number;
  maxDischargeCurrent: number;
  tempCompensationCoefficient: number;
  temperatureRating: number;
  selfConsumption: number;
  efficiency: number;
};

type Site = {
  id: number;
  country: string;
  projectName: string;
  description?: string;
  latitude: number;
  longitude: number;
  city?: string;
  client?: string;
  elevation: number;
  timezone: number;
  gridVoltage: number;
  gridFrequency: number;
};

type Load = {
  id: number;
  loadType: string;
  quantity: number;
  usageFactor: number;
  hoursPerDay: number;
  startHour: number;
  wattage: number;
  operationMode: string;
  projectId: number;
};

// Python class attribute type interfaces
interface PythonPVPanel {
  Technology: string;
  T_NOCT: number;
  V_mp_ref: number;
  I_mp_ref: number;
  V_oc_ref: number;
  I_sc_ref: number;
  PTC: number;
  A_c: number;
  N_s: number;
  R_s: number;
  R_sh_ref: number;
  BIPV: number;
  alpha_sc: number;
  beta_oc: number;
  a_ref: number;
  I_L_ref: number;
  I_o_ref: number;
  Adjust: number;
  gamma_r: number;
}

interface PythonPVInverter {
  Vac: number;
  Paco: number;
  Pdco: number;
  Vdco: number;
  Pnt: number;
  Vdcmax: number;
  Idcmax: number;
  Mppt_low: number;
  Mppt_high: number;
}

interface PythonPVArray {
  tilt: number;
  azimuth: number;
  mtg_cnfg: string;
  mtg_spc: number;
  mtg_hgt: number;
  gnd_cnd: string;
  albedo: number;
  uis: number;
  sip: number;
  ary_Vmp: number;
  ary_Imp: number;
  ary_tpnl: number;
}

interface PythonPVBattery {
  b_typ: string;
  b_nomv: number;
  b_rcap: number;
  b_rhrs: number;
  b_ir: number;
  b_stdTemp: number;
  b_tmpc: number;
  b_mxDschg: number;
  b_mxDoD: number;
}

interface PythonPVBatBank {
  doa: number;
  doc: number;
  bnk_uis: number;
  bnk_sip: number;
  bnk_tbats: number;
  bnk_cap: number;
  bnk_vo: number;
}

interface PythonPVChgControl {
  c_type: string;
  c_pvmxv: number;
  c_pvmxi: number;
  c_bvnom: number;
  c_mvchg: number;
  c_michg: number;
  c_midschg: number;
  c_tmpc: number;
  c_tmpr: number;
  c_cnsmpt: number;
  c_eff: number;
}

interface PythonPVSite {
  cntry: string;
  proj: string;
  p_desc: string;
  lat: number;
  lon: number;
  city: string;
  client: string;
  elev: number;
  tz: number;
  gv: number;
  gf: number;
}

interface PythonSiteLoad {
  Type: string;
  Qty: number;
  'Use Factor': number;
  Hours: number;
  'Start Hour': number;
  Watts: number;
  Mode: string;
}

export interface SiteParameters {
  cntry: string;
  lat: number;
  lon: number;
  elev: number;
  tz: string;
}

export interface BatteryParameters {
  b_typ: string;
  b_nomv: number;
  b_rcap: number;
  b_rhrs: number;
  b_ir: number;
  b_stdTemp: number;
  b_tmpc: number;
  b_mxDschg: number;
  b_mxDoD: number;
}

export interface PanelParameters {
  Technology: string;
  T_NOCT: number;
  V_mp_ref: number;
  I_mp_ref: number;
  V_oc_ref: number;
  I_sc_ref: number;
  PTC: number;
  A_c: number;
  N_s: number;
  R_s: number;
  R_sh_ref: number;
  BIPV: number;
  alpha_sc: number;
  beta_oc: number;
  a_ref: number;
  I_L_ref: number;
  I_o_ref: number;
  Adjust: number;
  gamma_r: number;
}

export interface ArrayParameters {
  tilt: number;
  azimuth: number;
  mtg_cnfg: string;
  mtg_spc: number;
  mtg_hgt: number;
  gnd_cnd: string;
  albedo: number;
  uis: number;
  sip: number;
  ary_Vmp: number;
  ary_Imp: number;
  ary_tpnl: number;
}

export interface BankParameters {
  doa: number;
  doc: number;
  bnk_uis: number;
  bnk_sip: number;
  bnk_tbats: number;
  bnk_cap: number;
  bnk_vo: number;
}

export interface InverterParameters {
  Vac: number;
  Paco: number;
  Pdco: number;
  Vdco: number;
  Pnt: number;
  Vdcmax: number;
  Idcmax: number;
  Mppt_low: number;
  Mppt_high: number;
}

export interface ChargeControllerParameters {
  c_type: string;
  c_pvmxv: number;
  c_pvmxi: number;
  c_bvnom: number;
  c_mvchg: number;
  c_michg: number;
  c_midschg: number;
  c_tmpc: number;
  c_tmpr: number;
  c_cnsmpt: number;
  c_eff: number;
}

export interface LoadProfile {
  Type: string;
  Qty: number;
  Use_Factor: number;
  Hours: number;
  Start_Hour: number;
  Watts: number;
  Mode: string;
}

export interface SimulationRequest {
  site: SiteParameters;
  battery: BatteryParameters;
  panel: PanelParameters;
  array: ArrayParameters;
  secondary_array?: ArrayParameters;
  bank: BankParameters;
  inverter: InverterParameters;
  charge_controller: ChargeControllerParameters;
  load_profile: LoadProfile;
}

export interface SimulationResponse {
  success: boolean;
  message: string;
  overview?: any;
  monthly_performance?: any;
  power_flow?: any;
  service_percentage?: number;
}

// Mapping functions: Prisma to Python
/**
 * Maps a Prisma PVPanel object to Python PVPanel attributes
 */
export function mapPrismaPanelToPython(panel: PVPanel): PythonPVPanel {
  return {
    // m_mfg: panel.maker,
    // m_mdl: panel.model,
    // Name: panel.description || '',
    Technology: panel.moduleType || '',
    T_NOCT: 0, // Missing in Prisma
    V_mp_ref: panel.voltageAtPmax || 0,
    I_mp_ref: panel.currentAtPmax || 0,
    V_oc_ref: panel.openCircuitVoltage || 0,
    I_sc_ref: panel.shortCircuitCurrent || 0,
    PTC: panel.maxPower || 0,
    A_c: 0, // Missing in Prisma (Cell Size)
    N_s: 0, // Missing in Prisma (Number of cells)
    R_s: 0, // Missing in Prisma (Series Resistance)
    R_sh_ref: 0, // Missing in Prisma (Shunt Resistance)
    BIPV: 0, // Missing in Prisma
    alpha_sc: panel.tempCoeffIsc || 0,
    beta_oc: panel.tempCoeffVoc || 0,
    a_ref: 0, // Missing in Prisma
    I_L_ref: 0, // Missing in Prisma
    I_o_ref: 0, // Missing in Prisma
    Adjust: 0, // Missing in Prisma
    gamma_r: panel.tempCoeffPmax || 0
  };
}

/**
 * Maps a Prisma Inverter object to Python PVInverter attributes
 */
export function mapPrismaInverterToPython(inverter: Inverter): PythonPVInverter {
  return {
    // i_mfg: inverter.maker || '',
    // i_mdl: inverter.model,
    // Name: inverter.description || '',
    Vac: inverter.outputVoltage || 0,
    Paco: inverter.nominalOutputPower || 0,
    Pdco: inverter.maxRecommendedPvPower || 0,
    Vdco: inverter.nominalDcVoltage || 0,
    Pnt: 0, // Missing in Prisma (Night Time Power)
    Vdcmax: inverter.maxDcVoltage || 0,
    Idcmax: inverter.maxInputCurrentPerMppt || 0,
    Mppt_low: inverter.mpptVoltageRangeMin || 0,
    Mppt_high: inverter.mpptVoltageRangeMax || 0
  };
}

/**
 * Maps a Prisma PVArray object to Python PVArray attributes
 */
export function mapPrismaArrayToPython(array: PVArray): PythonPVArray {
  return {
    tilt: array.tiltAngle,
    azimuth: array.azimuthAngle,
    mtg_cnfg: array.mountingConfiguration || '',
    mtg_spc: array.spaceUnderPanel,
    mtg_hgt: array.mountingHeight,
    gnd_cnd: array.groundSurfaceCondition || '',
    albedo: array.albedo,
    uis: array.unitsInSeries,
    sip: array.stringsInParallel,
    ary_Vmp: array.arrayVmp,
    ary_Imp: array.arrayImp,
    ary_tpnl: array.totalPanels
  };
}

/**
 * Maps a Prisma Battery object to Python PVBattery attributes
 */
export function mapPrismaBatteryToPython(battery: Battery): PythonPVBattery {
  return {
    // b_mfg: battery.maker,
    // b_mdl: battery.model,
    // b_desc: battery.description || '',
    b_typ: battery.batteryType,
    b_nomv: battery.nominalVoltage,
    b_rcap: battery.ratedCapacity,
    b_rhrs: battery.hourBasisForRating,
    b_ir: battery.internalResistance,
    b_stdTemp: battery.ratedTemperature,
    b_tmpc: battery.temperatureCoefficient,
    b_mxDschg: battery.maxDischargeCycles,
    b_mxDoD: battery.maxDepthOfDischarge
  };
}

/**
 * Maps a Prisma BatteryBank object to Python PVBatBank attributes
 */
export function mapPrismaBatteryBankToPython(bank: BatteryBank): PythonPVBatBank {
  return {
    doa: bank.daysOfAutonomy,
    doc: bank.depthOfDischarge,
    bnk_uis: bank.unitsInSeries,
    bnk_sip: bank.stringsInParallel,
    bnk_tbats: bank.totalBankBatteries,
    bnk_cap: bank.bankCapacity,
    bnk_vo: bank.bankVoltage
  };
}

/**
 * Maps a Prisma ChargeController object to Python PVChgControl attributes
 */
export function mapPrismaChargeControllerToPython(controller: ChargeController): PythonPVChgControl {
  return {
    // c_mfg: controller.maker,
    // c_mdl: controller.model,
    // Name: controller.description || '',
    c_type: controller.controllerType,
    c_pvmxv: controller.maxPVVoltage,
    c_pvmxi: controller.maxPVCurrent,
    c_bvnom: controller.batteryVoltage,
    c_mvchg: controller.maxChargeVoltage,
    c_michg: controller.maxChargeCurrent,
    c_midschg: controller.maxDischargeCurrent,
    c_tmpc: controller.tempCompensationCoefficient,
    c_tmpr: controller.temperatureRating,
    c_cnsmpt: controller.selfConsumption,
    c_eff: controller.efficiency
  };
}

/**
 * Maps a Prisma Site object to Python PVSite attributes
 */
export function mapPrismaSiteToPython(site: Site): PythonPVSite {
  return {
    cntry: site.country,
    proj: site.projectName,
    p_desc: site.description || '',
    lat: site.latitude,
    lon: site.longitude,
    city: site.city || '',
    client: site.client || '',
    elev: site.elevation,
    tz: site.timezone,
    gv: site.gridVoltage,
    gf: site.gridFrequency
  };
}

/**
 * Maps a Prisma Load object to Python SiteLoad attributes
 */
export function mapPrismaLoadToPython(load: Load): PythonSiteLoad {
  return {
    Type: load.loadType,
    Qty: load.quantity,
    'Use Factor': load.usageFactor,
    Hours: load.hoursPerDay,
    'Start Hour': load.startHour,
    Watts: load.wattage,
    Mode: load.operationMode
  };
}

// Mapping functions: Python to Prisma
/**
 * Maps Python PVPanel attributes to a Prisma PVPanel object
 */
export function mapPythonToPrismaPanel(pythonPanel: PythonPVPanel): Omit<PVPanel, 'id'> {
  return {
    // maker: pythonPanel.m_mfg,
    // model: pythonPanel.m_mdl,
    // description: pythonPanel.Name,
    moduleType: pythonPanel.Technology,
    tempCoeffPmax: pythonPanel.gamma_r,
    tempCoeffIsc: pythonPanel.alpha_sc,
    tempCoeffVoc: pythonPanel.beta_oc,
    openCircuitVoltage: pythonPanel.V_oc_ref,
    shortCircuitCurrent: pythonPanel.I_sc_ref,
    maxPower: pythonPanel.PTC,
    currentAtPmax: pythonPanel.I_mp_ref,
    voltageAtPmax: pythonPanel.V_mp_ref
    // Other fields are not mapped as they don't exist in the Prisma schema
  };
}

/**
 * Maps Python PVInverter attributes to a Prisma Inverter object
 */
export function mapPythonToPrismaInverter(pythonInverter: PythonPVInverter): Omit<Inverter, 'id'> {
  return {
    // maker: pythonInverter.i_mfg,
    // model: pythonInverter.i_mdl,
    // description: pythonInverter.Name,
    outputVoltage: pythonInverter.Vac,
    nominalOutputPower: pythonInverter.Paco,
    maxRecommendedPvPower: pythonInverter.Pdco,
    nominalDcVoltage: pythonInverter.Vdco,
    maxDcVoltage: pythonInverter.Vdcmax,
    maxInputCurrentPerMppt: pythonInverter.Idcmax,
    mpptVoltageRangeMin: pythonInverter.Mppt_low,
    mpptVoltageRangeMax: pythonInverter.Mppt_high
    // Other fields are not mapped as they don't exist in the Python class
  };
}

/**
 * Maps Python PVArray attributes to a Prisma PVArray object
 */
export function mapPythonToPrismaArray(pythonArray: PythonPVArray, projectId: number): Omit<PVArray, 'id'> {
  return {
    tiltAngle: pythonArray.tilt,
    azimuthAngle: pythonArray.azimuth,
    mountingConfiguration: pythonArray.mtg_cnfg,
    spaceUnderPanel: pythonArray.mtg_spc,
    mountingHeight: pythonArray.mtg_hgt,
    groundSurfaceCondition: pythonArray.gnd_cnd,
    albedo: pythonArray.albedo,
    unitsInSeries: pythonArray.uis,
    stringsInParallel: pythonArray.sip,
    arrayVmp: pythonArray.ary_Vmp,
    arrayImp: pythonArray.ary_Imp,
    totalPanels: pythonArray.ary_tpnl,
    projectId: projectId
  };
}

/**
 * Maps Python PVBattery attributes to a Prisma Battery object
 */
export function mapPythonToPrismaBattery(pythonBattery: PythonPVBattery): Omit<Battery, 'id'> {
  return {
    // maker: pythonBattery.b_mfg,
    // model: pythonBattery.b_mdl,
    // description: pythonBattery.b_desc,
    batteryType: pythonBattery.b_typ,
    nominalVoltage: pythonBattery.b_nomv,
    ratedCapacity: pythonBattery.b_rcap,
    hourBasisForRating: pythonBattery.b_rhrs,
    internalResistance: pythonBattery.b_ir,
    ratedTemperature: pythonBattery.b_stdTemp,
    temperatureCoefficient: pythonBattery.b_tmpc,
    maxDischargeCycles: pythonBattery.b_mxDschg,
    maxDepthOfDischarge: pythonBattery.b_mxDoD
  };
}

/**
 * Maps Python PVBatBank attributes to a Prisma BatteryBank object
 */
export function mapPythonToPrismaBatteryBank(
  pythonBatBank: PythonPVBatBank, 
  batteryId: number, 
  projectId: number
): Omit<BatteryBank, 'id'> {
  return {
    daysOfAutonomy: pythonBatBank.doa,
    depthOfDischarge: pythonBatBank.doc,
    unitsInSeries: pythonBatBank.bnk_uis,
    stringsInParallel: pythonBatBank.bnk_sip,
    totalBankBatteries: pythonBatBank.bnk_tbats,
    bankCapacity: pythonBatBank.bnk_cap,
    bankVoltage: pythonBatBank.bnk_vo,
    batteryId: batteryId,
    projectId: projectId
  };
}

/**
 * Maps Python PVChgControl attributes to a Prisma ChargeController object
 */
export function mapPythonToPrismaChargeController(pythonController: PythonPVChgControl): Omit<ChargeController, 'id'> {
  return {
    // maker: pythonController.c_mfg,
    // model: pythonController.c_mdl,
    // description: pythonController.Name,
    controllerType: pythonController.c_type,
    maxPVVoltage: pythonController.c_pvmxv,
    maxPVCurrent: pythonController.c_pvmxi,
    batteryVoltage: pythonController.c_bvnom,
    maxChargeVoltage: pythonController.c_mvchg,
    maxChargeCurrent: pythonController.c_michg,
    maxDischargeCurrent: pythonController.c_midschg,
    tempCompensationCoefficient: pythonController.c_tmpc,
    temperatureRating: pythonController.c_tmpr,
    selfConsumption: pythonController.c_cnsmpt,
    efficiency: pythonController.c_eff
  };
}

/**
 * Maps Python PVSite attributes to a Prisma Site object
 */
export function mapPythonToPrismaSite(pythonSite: PythonPVSite): Omit<Site, 'id'> {
  return {
    country: pythonSite.cntry,
    projectName: pythonSite.proj,
    description: pythonSite.p_desc,
    latitude: pythonSite.lat,
    longitude: pythonSite.lon,
    city: pythonSite.city,
    client: pythonSite.client,
    elevation: pythonSite.elev,
    timezone: pythonSite.tz,
    gridVoltage: pythonSite.gv,
    gridFrequency: pythonSite.gf
  };
}

/**
 * Maps Python SiteLoad attributes to a Prisma Load object
 */
export function mapPythonToPrismaLoad(pythonLoad: PythonSiteLoad, projectId: number): Omit<Load, 'id'> {
  return {
    loadType: pythonLoad.Type,
    quantity: pythonLoad.Qty,
    usageFactor: pythonLoad['Use Factor'],
    hoursPerDay: pythonLoad.Hours,
    startHour: pythonLoad['Start Hour'],
    wattage: pythonLoad.Watts,
    operationMode: pythonLoad.Mode,
    projectId: projectId
  };
}
