/* eslint-disable @typescript-eslint/no-explicit-any */
// Data Validation and Cleaning Tools for AI Solar PV Design
// Simplified version - imports from modularized validation components

export { EquipmentDataValidator } from './equipment-validator';
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  ValidationConfig
} from './validation-types';
export {
  DEFAULT_VALIDATION_CONFIG,
  PANEL_VALIDATION_RULES,
  INVERTER_VALIDATION_RULES
} from './validation-types';

import { EquipmentDataValidator } from './equipment-validator';

/**
 * Legacy function for backward compatibility
 * Validates entire equipment database
 */
export const validateEquipmentDatabase = (equipmentData: any[], config?: any) => {
  const validator = new EquipmentDataValidator(config);
  const results = {
    panels: [] as any[],
    inverters: [] as any[],
    overallMetrics: validator.calculateDataQualityMetrics(equipmentData),
    summary: {
      totalRecords: equipmentData.length,
      validRecords: 0,
      criticalErrors: 0,
      warnings: 0
    }
  };

  for (const equipment of equipmentData) {
    let validation;

    if (equipment.type === 'panel' || equipment.power) {
      validation = validator.validatePanelData(equipment);
      results.panels.push(validation);
    } else if (equipment.type === 'inverter' || equipment.maxOutputPower) {
      validation = validator.validateInverterData(equipment);
      results.inverters.push(validation);
    }

    if (validation) {
      if (validation.isValid) results.summary.validRecords++;
      results.summary.criticalErrors += validation.errors.filter(e => e.severity === 'critical').length;
      results.summary.warnings += validation.warnings.length;
    }
  }

  return results;
};