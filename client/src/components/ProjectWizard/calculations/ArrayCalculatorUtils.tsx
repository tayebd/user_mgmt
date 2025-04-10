import type { PVProject, PVPanel, Inverter, PVArray, Wire } from '@/shared/types'; 
import type { ArrayConfig, ProtectionCalc, CableSizing } from './reportTypes';

// Default constants for cable sizing calculations
export const PVCONSTANTS: Constants = {
    K1: 1,           // Installation method factor
    K2: 0.94,        // Circuit grouping factor
    K3: 0.80,        // Ambient temperature factor
    K4_80C: 0.41,    // Temperature correction factor at 80°C (cable tray exposed to sun)
    K4_50C: 0.82,    // Temperature correction factor at 50°C (cable tray not exposed)
    K4_25C: 1.04,    // Temperature correction factor at 25°C (buried)
    resistivity_cu: 0.0168,  // Copper resistivity (Ω·mm²/m)
    gridVoltage: 230,       // Grid voltage (V)
    sin_phi: 0.6,          // Power factor (sin)
    cos_phi: 0.8,          // Power factor (cos)
    lambda: 0.8,            // Inductance factor
    Tmax: 85,              // Maximum temperature (°C)
    Tmin: -10,              // Minimum temperature (°C)
    tempDiffCold: -35,      // Temperature difference (°C)
    tempDiffHot: 60,      // Temperature difference (°C)
    resistivity_al: 0.0237  // Aluminum resistivity (Ω·mm²/m)
};

export interface Constants {
    K1?: number;
    K2?: number;
    K3?: number;
    K4_80C?: number;
    K4_50C?: number;
    K4_25C?: number;
    resistivity_cu?: number;
    gridVoltage?: number;
    sin_phi?: number;
    cos_phi?: number;
    lambda?: number;
    Tmax: number;
    Tmin: number;
    tempDiffCold: number;
    tempDiffHot: number;
    resistivity_al: number;
}

/*
 * Calculate PV array configuration parameters
 */
function calculateArrayConfiguration(panel: PVPanel, inverter: Inverter, numPanels: number): ArrayConfig {
    console.log(`Panel data: ${JSON.stringify(panel)}`);
    console.log(`Inverter data: ${JSON.stringify(inverter)}`);
    
    // Temperature coefficients
    const betaFactor = (panel.tempCoeffVoc || 0) / 100.0;  // %/°C
    const alphaFactor = (panel.tempCoeffIsc || 0) / 100.0;  // %/°C
    console.log(`beta_factor: ${betaFactor}, alpha_factor: ${alphaFactor}`);
    
    // Panel voltage calculations at different temperatures
    // At -10°C (cold condition)
    const tempEffectCold = -35 * betaFactor;
    const tempMultiplierCold = 1 + tempEffectCold;
    const Voc_10 = (panel.openCircuitVoltage || 0) * tempMultiplierCold;
    const Vmp_10 = (panel.voltageAtPmax || 0) * tempMultiplierCold;
    console.log(`Voc_10: ${Voc_10}, Vmp_10: ${Vmp_10}`);
    
    // At 85°C (hot condition)
    const tempEffectHot = 60 * betaFactor;
    const tempMultiplierHot = 1 + tempEffectHot;
    const Vmp_85 = (panel.voltageAtPmax || 0) * tempMultiplierHot;
    console.log(`Vmp_85: ${Vmp_85}`);
    
    // Current calculations at 85°C
    const tempEffectIsc = 60 * alphaFactor;
    const tempMultiplierIsc = 1 + tempEffectIsc;
    const Isc_85 = (panel.shortCircuitCurrent || 0) * tempMultiplierIsc;
    const Imp_85 = (panel.currentAtPmax || 0) * tempMultiplierIsc;
    console.log(`Isc_85: ${Isc_85}, Imp_85: ${Imp_85}`);
    
    // Calculate maximum number of panels in series
    const NsmaxCalc = Voc_10 !== 0 ? (inverter.maxInputVoltage || 1) / Voc_10 : 1;
    const Nsmax = Math.floor(NsmaxCalc);
    console.log(`Nsmax_calc: ${NsmaxCalc}, Nsmax: ${Nsmax}`);
    
    // Calculate optimal number of panels in series
    const NsoptimalCalc = Vmp_10 !== 0 ? (inverter.maxInputVoltage || 1) / Vmp_10 : 1;
    const Nsoptimal = Math.floor(NsoptimalCalc);
    console.log(`Nsoptimal_calc: ${NsoptimalCalc}, Nsoptimal: ${Nsoptimal}`);
    
    // Calculate minimum number of panels in series
    const NsminCalc = Vmp_85 !== 0 ? (inverter.minInputVoltage || 1) / Vmp_85 : 1;
    const Nsmin = Math.ceil(NsminCalc);
    console.log(`Nsmin_calc: ${NsminCalc}, Nsmin: ${Nsmin}`);
    
    // Calculate maximum number of strings in parallel (short circuit protection)
    const NpmaxCalc = Isc_85 !== 0 ? (inverter.maxShortCircuitCurrent || 1) / Isc_85 : 1;
    const Npmax = Math.floor(NpmaxCalc);
    console.log(`Npmax_calc: ${NpmaxCalc}, Npmax: ${Npmax}`);
    
    // Calculate optimal number of strings in parallel
    const NpoptimalCalc = Imp_85 !== 0 ? (inverter.minInputCurrent || 1) / Imp_85 : 1;
    const Npoptimal = Math.floor(NpoptimalCalc);
    console.log(`Npoptimal_calc: ${NpoptimalCalc}, Npoptimal: ${Npoptimal}`);
    
    // Calculate power ratio
    const totalPanels = numPanels || 1;
    const totalPower = totalPanels * (panel.power || 1);
    const powerRatio = totalPower / (inverter.nominalOutputPower || 1);
    console.log(`total_panels: ${totalPanels}, total_power: ${totalPower}, power_ratio: ${powerRatio}`);
    let is_compatible = false;
    if (powerRatio >= 0.9 || powerRatio <= 1.3) {
        is_compatible = true;
    }
    // Store calculations in an object
    const array: ArrayConfig = {
        Voc_10: Number(Voc_10.toFixed(2)),
        Vmp_10: Number(Vmp_10.toFixed(2)),
        Vmp_85: Number(Vmp_85.toFixed(2)),
        Isc_85: Number(Isc_85.toFixed(2)),
        Imp_85: Number(Imp_85.toFixed(2)),
        Nsmax: Nsmax,
        Nsoptimal: Nsoptimal,
        Npoptimal: Npoptimal,
        Nsmin: Nsmin,
        Npmax: Npmax,
        power_ratio: Number(powerRatio.toFixed(2)),
        array_power: Number(totalPower.toFixed(2)),
        is_compatible: is_compatible, // Whether the power ratio is between 0.9 and 1.3
    };
    
    return array;
}

/**
 * Calculate protection device parameters
 */
function calculateProtectionDevices(panel: PVPanel, arrayConfig: ArrayConfig): ProtectionCalc {

    // Maximum number of parallel connection w/o protection: Ncxmax
    // Maximum number of parallel connection w/t protection device: Npmax
    const Irm = panel.maxSeriesFuseRating || 0;
    const Isc = panel.shortCircuitCurrent || 0;
    const Impp = panel.currentAtPmax || 0;
    const NcmaxLmt = (1 + Irm) / Isc;
    const NpmaxLmt = 0.5 * (1 + (Irm / Impp));

    // Calculate fuse current requirements
    const fuseIscSTC = (panel.shortCircuitCurrent || 0) * 1.1 * 1.25;
    const switchIscSTC = (panel.shortCircuitCurrent || 0) * 1.25;
    const Vocmax = (panel.openCircuitVoltage || 0) * 1.2;
    const Iscmax = (panel.shortCircuitCurrent || 0) * 1.25;

    // Store calculations in an object
    const protection: ProtectionCalc = {
        fuse_Vocmax_val: arrayConfig.Voc_10,
        fuse_IscSTC: Number(fuseIscSTC.toFixed(2)),
        switch_IscSTC: Number(switchIscSTC.toFixed(2)),
        Vocmax: Number(Vocmax.toFixed(2)),
        Iscmax: Number(Iscmax.toFixed(2)),
        Ncmax_lmt: Number(NcmaxLmt.toFixed(2)),
        Npmax_lmt: Number(NpmaxLmt.toFixed(2))
    };
    
    return protection;
}

/**
 * Calculate cable sizing and voltage drop
 */
function calculateDCCableSizing(cable: Wire, panel: PVPanel): CableSizing {

    // DC cable calculations
    // Example calculation for Iz' with correction factors
    const dcIzBase = cable.Iz || 43;   // Base current capacity
    const K1 = PVCONSTANTS.K1 || 1;        // Installation method factor
    const K2 = PVCONSTANTS.K2 || 0.94;     // Circuit grouping factor
    const K3 = PVCONSTANTS.K3 || 0.80;     // Ambient temperature factor

    // Different K4 values based on temperature
    const K4_80C = PVCONSTANTS.K4_80C || 0.41;  // 80°C (cable tray exposed to sun)
    const K4_50C = PVCONSTANTS.K4_50C || 0.82;  // 50°C (cable tray not exposed)
    const K4_25C = PVCONSTANTS.K4_25C || 1.04;  // 25°C (buried)

    const dcIzPrime80C = dcIzBase * K1 * K2 * K3 * K4_80C;
    const dcIzPrime50C = dcIzBase * K1 * K2 * K3 * K4_50C;
    const dcIzPrime25C = dcIzBase * K1 * K2 * K3 * K4_25C;
    
    // Voltage drop calculations
    const rho = PVCONSTANTS.resistivity_cu || 0.0168;  // Ω·mm²/m (default copper)
    const S = cable.section || 4;       // mm²
    const L = cable.length || 10; // m
    const ImpSTC = panel.currentAtPmax || 0;
    const Ump = panel.voltageAtPmax || 0;

    const dcDeltaU = 2 * rho * (L / S) * ImpSTC;
    const dcDeltaUPerc = Ump !== 0 ? 100 * dcDeltaU / Ump : 0;
    // Store calculations in an object
    const cableSizing: CableSizing = {
        Iz: Number(cable.Iz.toFixed(2)),
        section: Number(cable.section.toFixed(2)),
        length: Number(cable.length.toFixed(2)),
        Iz_prime_80C: Number(dcIzPrime80C.toFixed(2)),
        Iz_prime_50C: Number(dcIzPrime50C.toFixed(2)),
        Iz_prime_25C: Number(dcIzPrime25C.toFixed(2)),
        delta_u: Number(dcDeltaU.toFixed(4)),
        delta_u_perc: Number(dcDeltaUPerc.toFixed(2)),
    };
    
    return cableSizing;
}

function calculateACCableSizing(cable: Wire, inverter: Inverter): CableSizing {

    // DC cable calculations
    // Example calculation for Iz' with correction factors
    const dcIzBase = cable.Iz || 43;   // Base current capacity
    const K1 = PVCONSTANTS.K1 || 1;        // Installation method factor
    const K2 = PVCONSTANTS.K2 || 0.94;     // Circuit grouping factor
    const K3 = PVCONSTANTS.K3 || 0.80;     // Ambient temperature factor

    // Different K4 values based on temperature
    const K4_80C = PVCONSTANTS.K4_80C || 0.41;  // 80°C (cable tray exposed to sun)
    const K4_50C = PVCONSTANTS.K4_50C || 0.82;  // 50°C (cable tray not exposed)
    const K4_25C = PVCONSTANTS.K4_25C || 1.04;  // 25°C (buried)

    // Voltage drop calculations
    const rho = PVCONSTANTS.resistivity_cu || 0.0168;  // Ω·mm²/m (default copper)

    // Voltage drop calculations - AC
    const acIzBase = cable.Iz || 43;   // Base current capacity

    const acIzPrime80C = acIzBase * K1 * K2 * K3 * K4_80C;
    const acIzPrime50C = acIzBase * K1 * K2 * K3 * K4_50C;
    const acIzPrime25C = acIzBase * K1 * K2 * K3 * K4_25C;

    const S = cable.section || 4;       // mm²
    const L = cable.length || 10; // m
    const Imax = inverter.maxOutputCurrent || 0;
    const Ve = PVCONSTANTS.gridVoltage || 230;
    const sinPhi = PVCONSTANTS.sin_phi || 0.6;
    const cosPhi = PVCONSTANTS.cos_phi || 0.8;
    const lambda = PVCONSTANTS.lambda || 0.8;

    const acDeltaU = 2 * ((rho * (L / S) * cosPhi) + (lambda * L * sinPhi)) * Imax;
    const acDeltaUPerc = Ve !== 0 ? 100 * acDeltaU / Ve : 100 * acDeltaU / 230;

    // Store calculations in an object
    const cableSizing: CableSizing = {
        Iz: Number(cable.Iz.toFixed(2)),
        section: Number(cable.section.toFixed(2)),
        length: Number(cable.length.toFixed(2)),
        Iz_prime_80C: Number(acIzPrime80C.toFixed(2)),
        Iz_prime_50C: Number(acIzPrime50C.toFixed(2)),
        Iz_prime_25C: Number(acIzPrime25C.toFixed(2)),
        delta_u: Number(acDeltaU.toFixed(4)),
        delta_u_perc: Number(acDeltaUPerc.toFixed(2))
    };
    
    return cableSizing;
}

// Export functions for potential use in other modules
export {
    calculateArrayConfiguration,
    calculateProtectionDevices,
    calculateDCCableSizing,
    calculateACCableSizing,
};