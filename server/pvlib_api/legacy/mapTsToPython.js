"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPrismaPanelToPython = mapPrismaPanelToPython;
exports.mapPrismaInverterToPython = mapPrismaInverterToPython;
exports.mapPrismaArrayToPython = mapPrismaArrayToPython;
exports.mapPrismaBatteryToPython = mapPrismaBatteryToPython;
exports.mapPrismaBatteryBankToPython = mapPrismaBatteryBankToPython;
exports.mapPrismaChargeControllerToPython = mapPrismaChargeControllerToPython;
exports.mapPrismaSiteToPython = mapPrismaSiteToPython;
exports.mapPrismaLoadToPython = mapPrismaLoadToPython;
exports.mapPythonToPrismaPanel = mapPythonToPrismaPanel;
exports.mapPythonToPrismaInverter = mapPythonToPrismaInverter;
exports.mapPythonToPrismaArray = mapPythonToPrismaArray;
exports.mapPythonToPrismaBattery = mapPythonToPrismaBattery;
exports.mapPythonToPrismaBatteryBank = mapPythonToPrismaBatteryBank;
exports.mapPythonToPrismaChargeController = mapPythonToPrismaChargeController;
exports.mapPythonToPrismaSite = mapPythonToPrismaSite;
exports.mapPythonToPrismaLoad = mapPythonToPrismaLoad;
// Mapping functions: Prisma to Python
/**
 * Maps a Prisma PVPanel object to Python PVPanel attributes
 */
function mapPrismaPanelToPython(panel) {
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
function mapPrismaInverterToPython(inverter) {
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
function mapPrismaArrayToPython(array) {
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
function mapPrismaBatteryToPython(battery) {
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
function mapPrismaBatteryBankToPython(bank) {
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
function mapPrismaChargeControllerToPython(controller) {
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
function mapPrismaSiteToPython(site) {
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
function mapPrismaLoadToPython(load) {
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
function mapPythonToPrismaPanel(pythonPanel) {
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
function mapPythonToPrismaInverter(pythonInverter) {
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
function mapPythonToPrismaArray(pythonArray, projectId) {
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
function mapPythonToPrismaBattery(pythonBattery) {
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
function mapPythonToPrismaBatteryBank(pythonBatBank, batteryId, projectId) {
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
function mapPythonToPrismaChargeController(pythonController) {
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
function mapPythonToPrismaSite(pythonSite) {
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
function mapPythonToPrismaLoad(pythonLoad, projectId) {
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
