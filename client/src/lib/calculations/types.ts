/**
 * Pure Calculation Types
 * Type definitions for solar PV calculation services
 */

export interface ElectricalParameters {
  // Temperature coefficients
  tempCoeffVoc: number; // %/°C
  tempCoeffIsc: number; // %/°C

  // Voltage and current at STC
  openCircuitVoltage: number; // V
  shortCircuitCurrent: number; // A

  // System limits
  maxInputVoltage: number; // V
  maxInputCurrent: number; // A
  maxPower: number; // W

  // Temperature conditions
  stcTemperature: number; // 25°C
  lowTemperature: number; // -10°C
  highTemperature: number; // 85°C
}

export interface TemperatureCorrectionResult {
  voltageAtMinus10: number;
  currentAt85: number;
  voltageAtSTC: number;
  currentAtSTC: number;
  betaFactor: number;
  alphaFactor: number;
}

export interface ArrayConfigurationResult {
  maxPanelsInSeries: number;
  maxParallelStrings: number;
  totalPanels: number;
  optimalConfiguration: {
    seriesPerString: number;
    parallelStrings: number;
    totalPanels: number;
  };
  temperatureData: TemperatureCorrectionResult;
}

export interface SystemSizingInputs {
  targetPower: number; // kW
  panelMaxPower: number; // W
  panelEfficiency: number; // %
  availableRoofArea: number; // m²
  irradiance: number; // kWh/m²/year
  performanceRatio: number; // %
}

export interface SystemSizingResult {
  requiredPanels: number;
  requiredInverter: number; // kVA
  roofAreaNeeded: number; // m²
  systemSizekW: number;
  annualProduction: number; // kWh/year
  co2Savings: number; // kg/year
}

export interface FinancialInputs {
  systemCost: number; // $/W
  installationCost: number; // $/W
  electricityRate: number; // $/kWh
  systemSize: number; // kW
  annualProduction: number; // kWh/year
  discountRate: number; // %
  projectLifetime: number; // years
  maintenanceCost: number; // % of system cost/year
}

export interface FinancialCalculationResult {
  systemCost: number;
  installationCost: number;
  totalCost: number;
  paybackPeriod: number; // years
  roi: number; // %
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
  lcoe: number; // Levelized Cost of Energy ($/kWh)
}

export interface ComplianceRequirement {
  rule: string;
  description: string;
  minPanels: number;
  maxPanels: number;
  voltageLimit: number;
  currentLimit: number;
}

export interface ComplianceCheckResult {
  isCompliant: boolean;
  violations: ComplianceRequirement[];
  warnings: string[];
  recommendations: string[];
}

export interface CableSizingInputs {
  current: number; // A
  cableLength: number; // m
  ambientTemperature: number; // °C
  installationMethod: 'conduit' | 'direct' | 'tray';
  cableType: 'copper' | 'aluminum';
  maxVoltageDrop: number; // %
}

export interface CableSizingResult {
  recommendedSize: number; // mm²
  actualVoltageDrop: number; // %
  currentCapacity: number; // A
  isAdequate: boolean;
  alternatives: number[]; // mm²
}

export interface ProtectionDeviceInputs {
  isc: number; // A
  systemVoltage: number; // V
  temperatureCoefficient: number; // %/°C
  ambientTemperature: number; // °C
}

export interface ProtectionDeviceResult {
  fuseSize: number; // A
  breakerSize: number; // A
  disconnectRating: number; // A
  surgeProtectionRequired: boolean;
  recommendations: string[];
}

// UTE C 15-712-1 French electrical standards
export interface UTEComplianceInput {
  arrayConfiguration: ArrayConfigurationResult;
  systemVoltage: number;
  systemCurrent: number;
  location: 'france' | 'other';
  installationType: 'residential' | 'commercial' | 'industrial';
}

export interface UTEComplianceResult extends ComplianceCheckResult {
  uteSpecificRequirements: {
    groundingRequired: boolean;
    rapidShutdownRequired: boolean;
    arcFaultProtectionRequired: boolean;
    labelingRequirements: string[];
    inspectionRequirements: string[];
  };
}