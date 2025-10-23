/**
 * Solar Calculator
 * Shared calculation utilities for solar PV projects
 * Used by both Regular and AI Project Wizards
 */

import type { PVPanel, Inverter, PVProject } from '@/shared/types';

export interface ArrayConfigurationResult {
  maxPanelsInSeries: number;
  maxParallelStrings: number;
  totalPanels: number;
  optimalConfiguration: {
    seriesPerString: number;
    parallelStrings: number;
    totalPanels: number;
  };
  temperatureData: {
    voltageAtMinus10: number;
    currentAt85: number;
    voltageAtSTC: number;
    currentAtSTC: number;
  };
}

export interface SystemSizingResult {
  requiredPanels: number;
  requiredInverter: number;
  roofAreaNeeded: number;
  systemSizekW: number;
  annualProduction: number;
  co2Savings: number;
}

export interface FinancialCalculationResult {
  systemCost: number;
  installationCost: number;
  totalCost: number;
  paybackPeriod: number;
  roi: number;
  npv: number;
  irp: number;
  lcoe: number;
}

export interface PerformanceSimulationResult {
  hourlyProduction: number[];
  monthlyProduction: number[];
  annualProduction: number;
  performanceRatio: number;
  specificYield: number;
  temperatureLosses: number;
  systemLosses: number;
}

export class SolarCalculator {
  // Temperature coefficients (typical values)
  private static readonly TEMP_COEFF_VOLTAGE = -0.003; // -0.3% per °C
  private static readonly TEMP_COEFF_CURRENT = 0.0004; // +0.04% per °C

  // Standard test conditions
  private static readonly STC_TEMPERATURE = 25; // °C
  private static readonly MIN_TEMPERATURE = -10; // °C
  private static readonly MAX_TEMPERATURE = 85; // °C

  // System losses (typical values)
  private static readonly SYSTEM_LOSSES = 0.14; // 14% total system losses
  private static readonly PERFORMANCE_RATIO = 0.86; // 86% performance ratio

  /**
   * Calculate optimal array configuration
   */
  static calculateArrayConfiguration(
    panel: PVPanel,
    inverter: Inverter,
    availableRoofArea: number,
    targetPower: number
  ): ArrayConfigurationResult {
    // Temperature calculations
    const voltageAtMinus10 = panel.openCircuitVoltage * (1 + this.TEMP_COEFF_VOLTAGE * (this.MIN_TEMPERATURE - this.STC_TEMPERATURE));
    const currentAt85 = panel.shortCircuitCurrent * (1 + this.TEMP_COEFF_CURRENT * (this.MAX_TEMPERATURE - this.STC_TEMPERATURE));

    // Maximum panels in series (based on inverter max DC voltage)
    const maxPanelsInSeries = Math.floor(inverter.maxStringVoltage / voltageAtMinus10);

    // Maximum parallel strings (based on inverter max DC current)
    const maxParallelStrings = Math.floor(inverter.maxStringCurrent / currentAt85);

    // Calculate optimal configuration based on target power
    const targetPanelCount = Math.ceil(targetPower / (panel.power / 1000));

    // Find optimal series/parallel combination
    let optimalConfiguration = {
      seriesPerString: Math.min(maxPanelsInSeries, targetPanelCount),
      parallelStrings: 1,
      totalPanels: 0,
    };

    // Try different configurations to find the best fit
    for (let series = 1; series <= maxPanelsInSeries; series++) {
      for (let parallel = 1; parallel <= maxParallelStrings; parallel++) {
        const totalPanels = series * parallel;

        if (totalPanels >= targetPanelCount && totalPanels <= this.getMaxPanelsByArea(panel, availableRoofArea)) {
          if (optimalConfiguration.totalPanels === 0 || totalPanels < optimalConfiguration.totalPanels) {
            optimalConfiguration = {
              seriesPerString: series,
              parallelStrings: parallel,
              totalPanels,
            };
          }
        }
      }
    }

    return {
      maxPanelsInSeries,
      maxParallelStrings,
      totalPanels: optimalConfiguration.totalPanels,
      optimalConfiguration,
      temperatureData: {
        voltageAtMinus10,
        currentAt85,
        voltageAtSTC: panel.openCircuitVoltage,
        currentAtSTC: panel.shortCircuitCurrent,
      },
    };
  }

  /**
   * Calculate system sizing requirements
   */
  static calculateSystemSizing(
    targetPower: number, // kW
    panel: PVPanel,
    location: {
      latitude: number;
      longitude: number;
      annualIrradiance: number; // kWh/m²/year
    },
    roofArea: number // m²
  ): SystemSizingResult {
    const panelPowerKW = panel.power / 1000;
    const panelArea = (panel.length * panel.width) / 1000000; // Convert mm² to m²

    // Required number of panels
    const requiredPanels = Math.ceil(targetPower / panelPowerKW);
    const roofAreaNeeded = requiredPanels * panelArea;

    // Check if roof area is sufficient
    if (roofAreaNeeded > roofArea) {
      const maxPanels = Math.floor(roofArea / panelArea);
      const actualSystemSize = maxPanels * panelPowerKW;
      targetPower = actualSystemSize;
    }

    // Required inverter size (with 10% oversizing allowance)
    const requiredInverter = targetPower * 1.1;

    // Annual production estimation
    const annualProduction = targetPower * location.annualIrradiance * this.PERFORMANCE_RATIO;

    // CO2 savings (typical factor: 0.5 kg CO2 per kWh)
    const co2Savings = annualProduction * 0.5 / 1000; // tons per year

    return {
      requiredPanels,
      requiredInverter,
      roofAreaNeeded,
      systemSizekW: targetPower,
      annualProduction,
      co2Savings,
    };
  }

  /**
   * Calculate financial metrics
   */
  static calculateFinancialMetrics(
    systemSize: number, // kW
    panel: PVPanel,
    inverter: Inverter,
    electricityRate: number, // $/kWh
    installationCostPerWatt: number, // $/W
    annualProduction: number, // kWh/year
    projectLifespan: number = 25 // years
  ): FinancialCalculationResult {
    // Equipment costs
    const systemCost = systemSize * 1000 * installationCostPerWatt; // Convert kW to W

    // Installation labor and other costs (typically 20-30% of equipment cost)
    const installationCost = systemCost * 0.25;
    const totalCost = systemCost + installationCost;

    // Annual savings
    const annualSavings = annualProduction * electricityRate;

    // Simple payback period
    const paybackPeriod = totalCost / annualSavings;

    // Net Present Value (NPV) calculation
    const discountRate = 0.05; // 5% discount rate
    let npv = -totalCost;
    for (let year = 1; year <= projectLifespan; year++) {
      npv += annualSavings / Math.pow(1 + discountRate, year);
    }

    // Internal Rate of Return (IRR) - simplified calculation
    const irr = this.calculateIRR(totalCost, annualSavings, projectLifespan);

    // Levelized Cost of Energy (LCOE)
    const totalProduction = annualProduction * projectLifespan;
    const lcoe = totalCost / totalProduction;

    return {
      systemCost,
      installationCost,
      totalCost,
      paybackPeriod,
      roi: (annualSavings / totalCost) * 100,
      npv,
      irp: irr,
      lcoe,
    };
  }

  /**
   * Simulate system performance
   */
  static simulateSystemPerformance(
    systemSize: number, // kW
    panel: PVPanel,
    inverter: Inverter,
    location: {
      latitude: number;
      longitude: number;
      annualIrradiance: number;
      temperatureCoefficient?: number;
    },
    installationDetails: {
      tilt: number; // degrees
      azimuth: number; // degrees (180 = south)
      shading?: number; // 0-100 percentage
    }
  ): PerformanceSimulationResult {
    const hoursPerYear = 8760;
    const hourlyProduction: number[] = [];
    const monthlyProduction = new Array(12).fill(0);

    // Simplified hourly simulation
    for (let hour = 0; hour < hoursPerYear; hour++) {
      const dayOfYear = Math.floor(hour / 24);
      const hourOfDay = hour % 24;

      // Calculate solar position and irradiance (simplified)
      const irradiance = this.calculateHourlyIrradiance(
        location.latitude,
        dayOfYear,
        hourOfDay,
        installationDetails.tilt,
        installationDetails.azimuth
      );

      // Temperature correction
      const ambientTemp = 25 + 10 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365); // Simplified temperature model
      const cellTemp = ambientTemp + (irradiance / 800) * 25; // NOCT temperature model

      const tempCoefficient = location.temperatureCoefficient || this.TEMP_COEFF_VOLTAGE;
      const tempFactor = 1 + tempCoefficient * (cellTemp - this.STC_TEMPERATURE);

      // System efficiency factor
      const efficiencyFactor = this.PERFORMANCE_RATIO * tempFactor;

      // Apply shading losses
      const shadingFactor = installationDetails.shading
        ? (1 - installationDetails.shading / 100)
        : 1;

      // Calculate hourly production
      const hourlyOutput = systemSize * irradiance * efficiencyFactor * shadingFactor;
      hourlyProduction.push(hourlyOutput);

      // Add to monthly total
      const month = Math.floor(dayOfYear / 30);
      if (month < 12) {
        monthlyProduction[month] += hourlyOutput;
      }
    }

    // Calculate totals and averages
    const annualProduction = hourlyProduction.reduce((sum, value) => sum + value, 0);
    const performanceRatio = annualProduction / (systemSize * location.annualIrradiance);
    const specificYield = annualProduction / systemSize; // kWh/kWp

    // Calculate losses
    const idealProduction = systemSize * location.annualIrradiance;
    const systemLosses = idealProduction - annualProduction;
    const temperatureLosses = systemLosses * 0.15; // Approximate temperature losses

    return {
      hourlyProduction,
      monthlyProduction,
      annualProduction,
      performanceRatio,
      specificYield,
      temperatureLosses,
      systemLosses,
    };
  }

  /**
   * Validate system compatibility
   */
  static validateSystemCompatibility(
    panel: PVPanel,
    inverter: Inverter,
    configuration: ArrayConfigurationResult
  ): {
    isCompatible: boolean;
    warnings: string[];
    errors: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];

    // Check voltage compatibility
    const stringVoltage = configuration.optimalConfiguration.seriesPerString * configuration.temperatureData.voltageAtSTC;
    if (stringVoltage > inverter.maxInputVoltage) {
      errors.push(`String voltage (${stringVoltage.toFixed(1)}V) exceeds inverter MPPT maximum (${inverter.maxInputVoltage}V)`);
    }

    if (stringVoltage < inverter.minInputVoltage) {
      errors.push(`String voltage (${stringVoltage.toFixed(1)}V) below inverter MPPT minimum (${inverter.minInputVoltage}V)`);
    }

    // Check current compatibility
    const stringCurrent = configuration.optimalConfiguration.parallelStrings * configuration.temperatureData.currentAtSTC;
    if (stringCurrent > inverter.maxStringCurrent) {
      errors.push(`String current (${stringCurrent.toFixed(2)}A) exceeds inverter DC maximum (${inverter.maxStringCurrent}A)`);
    }

    // Check power ratio (inverter to panel power)
    const totalPanelPower = configuration.optimalConfiguration.totalPanels * panel.power;
    const powerRatio = totalPanelPower / (inverter.nominalOutputPower * 1000);

    if (powerRatio > 1.3) {
      warnings.push(`Power ratio (${powerRatio.toFixed(2)}) is high - inverter may be undersized`);
    } else if (powerRatio < 0.9) {
      recommendations.push(`Power ratio (${powerRatio.toFixed(2)}) is low - consider larger inverter`);
    }

    // Check temperature considerations
    const voltageSwing = configuration.temperatureData.voltageAtMinus10 - configuration.temperatureData.voltageAtSTC;
    if (voltageSwing > 100) {
      warnings.push(`Large voltage swing (${voltageSwing.toFixed(1)}V) due to temperature variations`);
    }

    return {
      isCompatible: errors.length === 0,
      warnings,
      errors,
      recommendations,
    };
  }

  /**
   * Get maximum number of panels by roof area
   */
  private static getMaxPanelsByArea(panel: PVPanel, roofArea: number): number {
    const panelArea = (panel.length * panel.width) / 1000000; // Convert mm² to m²
    return Math.floor(roofArea / panelArea);
  }

  /**
   * Calculate hourly irradiance (simplified model)
   */
  private static calculateHourlyIrradiance(
    latitude: number,
    dayOfYear: number,
    hourOfDay: number,
    tilt: number,
    azimuth: number
  ): number {
    // Simplified irradiance model - returns value in kW/m²
    const solarDeclination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    const hourAngle = (hourOfDay - 12) * 15;

    // Simplified calculation - in reality, this would be much more complex
    const elevationAngle = latitude - solarDeclination;
    const irradiance = Math.max(0, 1000 * Math.cos((hourOfDay - 12) * Math.PI / 12));

    // Apply tilt and azimuth factors (simplified)
    const tiltFactor = Math.cos(tilt * Math.PI / 180);
    const azimuthFactor = Math.cos((azimuth - 180) * Math.PI / 180);

    return (irradiance / 1000) * tiltFactor * azimuthFactor; // Convert to kW/m²
  }

  /**
   * Calculate Internal Rate of Return (simplified)
   */
  private static calculateIRR(
    initialInvestment: number,
    annualCashFlow: number,
    years: number,
    guess: number = 0.1
  ): number {
    // Simplified IRR calculation - Newton-Raphson method
    let irr = guess;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let derivative = 0;

      for (let year = 1; year <= years; year++) {
        npv += annualCashFlow / Math.pow(1 + irr, year);
        derivative -= year * annualCashFlow / Math.pow(1 + irr, year + 1);
      }

      if (Math.abs(npv) < tolerance) {
        return irr;
      }

      irr = irr - npv / derivative;
    }

    return irr;
  }

  /**
   * Format financial values for display
   */
  static formatFinancialValue(value: number, type: 'currency' | 'percentage' | 'years' | 'kwh' | 'tons'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);

      case 'percentage':
        return `${value.toFixed(1)}%`;

      case 'years':
        return `${value.toFixed(1)} years`;

      case 'kwh':
        return `${Math.round(value).toLocaleString()} kWh`;

      case 'tons':
        return `${value.toFixed(2)} tons CO₂`;

      default:
        return value.toString();
    }
  }

  /**
   * Get system efficiency summary
   */
  static getEfficiencySummary(
    performanceResult: PerformanceSimulationResult,
    panel: PVPanel,
    inverter: Inverter
  ): {
    panelEfficiency: number;
    inverterEfficiency: number;
    systemEfficiency: number;
    performanceRatio: number;
    specificYield: number;
  } {
    return {
      panelEfficiency: panel.efficiency,
      inverterEfficiency: inverter.efficiency,
      systemEfficiency: performanceResult.performanceRatio * 100,
      performanceRatio: performanceResult.performanceRatio,
      specificYield: performanceResult.specificYield,
    };
  }
}