/**
 * Validation Types and Interfaces
 * Extracted from dataValidation.ts for better organization
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  cleanedData?: any;
}

export interface ValidationError {
  field: string;
  type: 'missing' | 'invalid' | 'inconsistent' | 'out_of_range';
  message: string;
  severity: 'critical' | 'error';
  recommendedAction: string;
}

export interface ValidationWarning {
  field: string;
  type: 'suspicious' | 'outdated' | 'estimated';
  message: string;
  severity: 'warning';
  recommendation: string;
}

export interface ValidationSuggestion {
  field: string;
  type: 'improvement' | 'enhancement' | 'verification';
  message: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
}

// Validation configuration

export interface ValidationConfig {
  strictMode: boolean;
  allowEstimates: boolean;
  requireManufacturerData: boolean;
  validateCompatibility: boolean;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  strictMode: false,
  allowEstimates: true,
  requireManufacturerData: false,
  validateCompatibility: true,
};

// Equipment-specific validation rules

export interface PanelValidationRules {
  requiredFields: string[];
  numericRanges: Record<string, { min: number; max: number }>;
  stringPatterns: Record<string, RegExp>;
  dependencies: Record<string, string[]>;
}

export interface InverterValidationRules {
  requiredFields: string[];
  numericRanges: Record<string, { min: number; max: number }>;
  compatibilityRules: Record<string, any>;
}

export const PANEL_VALIDATION_RULES: PanelValidationRules = {
  requiredFields: ['maker', 'model', 'power', 'efficiency'],
  numericRanges: {
    power: { min: 100, max: 1000 },
    efficiency: { min: 0.15, max: 0.25 },
    temperatureCoefficient: { min: -0.5, max: -0.3 },
  },
  stringPatterns: {
    maker: /^[A-Za-z\s\-&]+$/,
    model: /^[A-Za-z0-9\s\-]+$/,
  },
  dependencies: {
    power: ['efficiency'],
    efficiency: ['power'],
  },
};

export const INVERTER_VALIDATION_RULES: InverterValidationRules = {
  requiredFields: ['maker', 'model', 'maxOutputPower', 'efficiency'],
  numericRanges: {
    maxOutputPower: { min: 1000, max: 100000 },
    efficiency: { min: 0.85, max: 0.99 },
    inputVoltageMin: { min: 100, max: 1000 },
    inputVoltageMax: { min: 500, max: 1500 },
  },
  compatibilityRules: {
    phaseType: ['single', 'three'],
    gridConnection: ['on-grid', 'off-grid', 'hybrid'],
  },
};