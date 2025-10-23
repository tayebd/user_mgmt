/**
 * Solar PV Calculation Services
 * Pure mathematical functions for solar PV system calculations
 * No UI dependencies - suitable for testing and reuse
 */

// Export all calculation types
export * from './types';

// Export electrical calculations
export * from './electrical';

// Export financial calculations
export * from './financial';

// Export compliance calculations
export * from './compliance';

// Re-export commonly used functions for convenience
export {
  calculateTemperatureCorrection,
  calculateArrayConfiguration,
  calculateCableSizing,
  calculateProtectionDevices,
  verifyElectricalLimits
} from './electrical';

export {
  calculateFinancialMetrics,
  calculateSimplePaybackPeriod,
  calculateDiscountedPaybackPeriod,
  calculateLifetimeMetrics,
  calculateCO2Savings
} from './financial';

export {
  checkUTECompliance,
  calculateDocumentationRequirements
} from './compliance';