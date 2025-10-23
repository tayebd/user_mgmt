/**
 * Pure Electrical Calculations
 * Mathematical functions for solar PV electrical calculations
 * No UI dependencies, pure functions only
 */

import type {
  ElectricalParameters,
  TemperatureCorrectionResult,
  ArrayConfigurationResult,
  CableSizingInputs,
  CableSizingResult,
  ProtectionDeviceInputs,
  ProtectionDeviceResult
} from './types';

/**
 * Calculate temperature correction factors and values
 */
export function calculateTemperatureCorrection(params: ElectricalParameters): TemperatureCorrectionResult {
  const {
    tempCoeffVoc,
    tempCoeffIsc,
    openCircuitVoltage,
    shortCircuitCurrent,
    stcTemperature,
    lowTemperature,
    highTemperature
  } = params;

  // Convert percentage coefficients to decimal
  const betaFactor = tempCoeffVoc / 100.0; // %/°C to decimal
  const alphaFactor = tempCoeffIsc / 100.0; // %/°C to decimal

  // Calculate Voc at -10°C (worst case for voltage)
  const voltageAtMinus10 = openCircuitVoltage * (1 + betaFactor * (lowTemperature - stcTemperature));

  // Calculate Isc at 85°C (worst case for current)
  const currentAt85 = shortCircuitCurrent * (1 + alphaFactor * (highTemperature - stcTemperature));

  return {
    voltageAtMinus10,
    currentAt85,
    voltageAtSTC: openCircuitVoltage,
    currentAtSTC: shortCircuitCurrent,
    betaFactor,
    alphaFactor
  };
}

/**
 * Calculate optimal array configuration
 */
export function calculateArrayConfiguration(
  params: ElectricalParameters,
  targetPower: number
): ArrayConfigurationResult {
  const temperatureData = calculateTemperatureCorrection(params);

  const {
    maxInputVoltage,
    maxInputCurrent,
    maxPower,
    openCircuitVoltage,
    shortCircuitCurrent
  } = params;

  // Calculate maximum panels in series (limited by voltage)
  const maxPanelsInSeries = Math.floor(maxInputVoltage / temperatureData.voltageAtMinus10);

  // Calculate maximum parallel strings (limited by current)
  const maxParallelStrings = Math.floor(maxInputCurrent / (shortCircuitCurrent * 1.25)); // 1.25 safety factor

  // Calculate theoretical total panels
  const theoreticalMaxPanels = maxPanelsInSeries * maxParallelStrings;

  // Calculate optimal configuration for target power
  const requiredPanelsForPower = Math.ceil(targetPower * 1000 / maxPower);

  // Optimize configuration within inverter limits
  let optimalSeries = Math.min(maxPanelsInSeries, requiredPanelsForPower);
  let optimalParallel = Math.ceil(requiredPanelsForPower / optimalSeries);

  // Ensure within limits
  optimalSeries = Math.max(1, Math.min(optimalSeries, maxPanelsInSeries));
  optimalParallel = Math.max(1, Math.min(optimalParallel, maxParallelStrings));

  // Verify configuration respects current limits
  const maxCurrent = temperatureData.currentAt85 * optimalParallel * 1.25;
  if (maxCurrent > maxInputCurrent) {
    // Adjust parallel strings to meet current limit
    optimalParallel = Math.floor(maxInputCurrent / (temperatureData.currentAt85 * 1.25));
    optimalParallel = Math.max(1, optimalParallel);
  }

  const totalPanels = optimalSeries * optimalParallel;

  return {
    maxPanelsInSeries,
    maxParallelStrings,
    totalPanels: Math.min(theoreticalMaxPanels, totalPanels),
    optimalConfiguration: {
      seriesPerString: optimalSeries,
      parallelStrings: optimalParallel,
      totalPanels
    },
    temperatureData
  };
}

/**
 * Calculate cable sizing based on current and distance
 */
export function calculateCableSizing(inputs: CableSizingInputs): CableSizingResult {
  const { current, cableLength, ambientTemperature, installationMethod, cableType, maxVoltageDrop } = inputs;

  // Temperature correction factors
  const temperatureCorrectionFactors: Record<string, Record<string, Record<number, number>>> = {
    copper: {
      conduit: { 30: 1.0, 40: 0.88, 50: 0.75, 60: 0.58 },
      direct: { 30: 1.0, 40: 0.91, 50: 0.82, 60: 0.71 },
      tray: { 30: 1.0, 40: 0.91, 50: 0.82, 60: 0.71 }
    },
    aluminum: {
      conduit: { 30: 1.0, 40: 0.91, 50: 0.82, 60: 0.71 },
      direct: { 30: 1.0, 40: 0.94, 50: 0.88, 60: 0.82 },
      tray: { 30: 1.0, 40: 0.94, 50: 0.88, 60: 0.82 }
    }
  };

  // Standard cable sizes (mm²)
  const standardSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

  // Get temperature correction factor
  const tempCorrectionTable = temperatureCorrectionFactors[cableType]?.[installationMethod];
  const tempCorrection = tempCorrectionTable?.[ambientTemperature] || 1.0;

  // Base current carrying capacity for copper cables (AWG to mm² conversion)
  const baseCurrentCapacity: Record<number, number> = {
    1.5: 18, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76,
    25: 101, 35: 125, 50: 151, 70: 192, 95: 232,
    120: 269, 150: 309, 185: 353, 240: 415
  };

  // Adjust for aluminum
  const aluminumFactor = cableType === 'aluminum' ? 0.84 : 1.0;

  // Find minimum suitable cable size
  let recommendedSize = 1.5;
  let currentCapacity = 0;
  let actualVoltageDrop = 100; // Start with worst case

  for (const size of standardSizes) {
    const adjustedCapacity = (baseCurrentCapacity[size] || 0) * tempCorrection * aluminumFactor;

    if (adjustedCapacity >= current * 1.25) { // 1.25 safety factor
      // Calculate voltage drop (V = I × R, simplified calculation)
      const resistance = (0.0175 / size) * cableLength * 2; // Resistivity × length × round trip
      const voltage = 230; // Assume single-phase 230V
      actualVoltageDrop = (current * resistance / voltage) * 100;

      if (actualVoltageDrop <= maxVoltageDrop) {
        recommendedSize = size;
        currentCapacity = adjustedCapacity;
        break;
      }
    }
  }

  const isAdequate = actualVoltageDrop <= maxVoltageDrop && currentCapacity >= current * 1.25;

  // Find alternative sizes
  const alternatives = standardSizes.filter(size =>
    size !== recommendedSize &&
    size >= recommendedSize * 0.5 &&
    size <= recommendedSize * 2
  );

  return {
    recommendedSize,
    actualVoltageDrop,
    currentCapacity,
    isAdequate,
    alternatives
  };
}

/**
 * Calculate protection device requirements
 */
export function calculateProtectionDevices(inputs: ProtectionDeviceInputs): ProtectionDeviceResult {
  const { isc, systemVoltage, temperatureCoefficient, ambientTemperature } = inputs;

  // Calculate Isc at worst case temperature (typically 85°C)
  const temperatureDiff = 85 - 25; // Difference from STC
  const iscAtHighTemp = isc * (1 + (temperatureCoefficient / 100) * temperatureDiff);

  // Calculate minimum fuse rating (1.25 × Isc at highest temperature)
  const minFuseSize = iscAtHighTemp * 1.25;

  // Standard fuse sizes (A)
  const standardFuseSizes = [2, 4, 6, 8, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

  // Find next standard size
  const fuseSize = standardFuseSizes.find(size => size >= minFuseSize) || 250;

  // Calculate breaker size (same as fuse for DC, typically 125% of Isc)
  const minBreakerSize = iscAtHighTemp * 1.25;
  const breakerSize = standardFuseSizes.find(size => size >= minBreakerSize) || 250;

  // Disconnect switch rating (minimum 125% of max current)
  const disconnectRating = Math.ceil(Math.max(fuseSize, breakerSize) * 1.25 / 10) * 10; // Round to nearest 10A

  // Surge protection requirements
  const surgeProtectionRequired = systemVoltage >= 48; // Typically required for systems >= 48V

  // Generate recommendations
  const recommendations: string[] = [];

  if (surgeProtectionRequired) {
    recommendations.push('Install DC surge protection device (SPD)');
  }

  if (systemVoltage >= 600) {
    recommendations.push('Consider rapid shutdown requirements per NEC 690.12');
  }

  recommendations.push(`Label all protection devices with appropriate ratings`);
  recommendations.push(`Ensure proper grounding of all metallic components`);

  return {
    fuseSize,
    breakerSize,
    disconnectRating,
    surgeProtectionRequired,
    recommendations
  };
}

/**
 * Verify voltage and current limits
 */
export function verifyElectricalLimits(
  arrayConfig: ArrayConfigurationResult,
  inverterLimits: { maxVoltage: number; maxCurrent: number; maxPower: number }
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const { optimalConfiguration, temperatureData } = arrayConfig;

  // Check voltage limits
  const maxSystemVoltage = optimalConfiguration.seriesPerString * temperatureData.voltageAtMinus10;
  if (maxSystemVoltage > inverterLimits.maxVoltage) {
    violations.push(`System voltage (${maxSystemVoltage.toFixed(1)}V) exceeds inverter limit (${inverterLimits.maxVoltage}V)`);
  }

  // Check current limits
  const maxSystemCurrent = optimalConfiguration.parallelStrings * temperatureData.currentAt85 * 1.25;
  if (maxSystemCurrent > inverterLimits.maxCurrent) {
    violations.push(`System current (${maxSystemCurrent.toFixed(2)}A) exceeds inverter limit (${inverterLimits.maxCurrent}A)`);
  }

  // Check power limits
  const estimatedMaxPower = optimalConfiguration.totalPanels * inverterLimits.maxPower / optimalConfiguration.totalPanels;
  if (estimatedMaxPower > inverterLimits.maxPower) {
    violations.push(`System power may exceed inverter maximum power rating`);
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}