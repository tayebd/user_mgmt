/**
 * Equipment Data Validator
 * Core validation logic for solar equipment data
 * Extracted from dataValidation.ts
 */

import {
  EnhancedPVPanel,
  EnhancedInverter,
  EnhancedBatteryBank,
  DataQualityMetrics,
  AISelectionContext
} from '@/shared/types/ai-enhanced';
import {
  ValidationResult,
  ValidationConfig,
  DEFAULT_VALIDATION_CONFIG,
  PANEL_VALIDATION_RULES,
  INVERTER_VALIDATION_RULES
} from './validation-types';

/**
 * Equipment Data Validator Class
 * Provides comprehensive validation for solar equipment data
 */
export class EquipmentDataValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  }

  /**
   * Comprehensive validation for enhanced panel data
   */
  validatePanelData(panel: EnhancedPVPanel): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    const suggestions: any[] = [];

    // Required fields validation
    for (const field of PANEL_VALIDATION_RULES.requiredFields) {
      if (!panel[field as keyof EnhancedPVPanel]) {
        errors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing`,
          severity: 'critical',
          recommendedAction: 'Provide manufacturer data for this field'
        });
      }
    }

    // Numeric range validation
    for (const [field, range] of Object.entries(PANEL_VALIDATION_RULES.numericRanges)) {
      const value = panel[field as keyof EnhancedPVPanel];
      if (typeof value === 'number') {
        if (value < range.min || value > range.max) {
          warnings.push({
            field,
            type: 'out_of_range',
            message: `Field '${field}' value ${value} is outside expected range [${range.min}, ${range.max}]`,
            severity: 'warning',
            recommendation: 'Verify manufacturer specifications'
          });
        }
      }
    }

    // String pattern validation
    for (const [field, pattern] of Object.entries(PANEL_VALIDATION_RULES.stringPatterns)) {
      const value = panel[field as keyof EnhancedPVPanel];
      if (typeof value === 'string' && !pattern.test(value)) {
        warnings.push({
          field,
          type: 'invalid',
          message: `Field '${field}' value '${value}' does not match expected pattern`,
          severity: 'warning',
          recommendation: 'Check for typos or formatting issues'
        });
      }
    }

    // Data quality assessment
    this.assessPanelDataQuality(panel, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      cleanedData: this.cleanPanelData(panel)
    };
  }

  /**
   * Comprehensive validation for enhanced inverter data
   */
  validateInverterData(inverter: EnhancedInverter): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    const suggestions: any[] = [];

    // Required fields validation
    for (const field of INVERTER_VALIDATION_RULES.requiredFields) {
      if (!inverter[field as keyof EnhancedInverter]) {
        errors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing`,
          severity: 'critical',
          recommendedAction: 'Provide manufacturer data for this field'
        });
      }
    }

    // Numeric range validation
    for (const [field, range] of Object.entries(INVERTER_VALIDATION_RULES.numericRanges)) {
      const value = inverter[field as keyof EnhancedInverter];
      if (typeof value === 'number') {
        if (value < range.min || value > range.max) {
          warnings.push({
            field,
            type: 'out_of_range',
            message: `Field '${field}' value ${value} is outside expected range [${range.min}, ${range.max}]`,
            severity: 'warning',
            recommendation: 'Verify manufacturer specifications'
          });
        }
      }
    }

    // Data quality assessment
    this.assessInverterDataQuality(inverter, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      cleanedData: this.cleanInverterData(inverter)
    };
  }

  /**
   * Assess data quality for panel data
   */
  private assessPanelDataQuality(panel: EnhancedPVPanel, warnings: any[], suggestions: any[]): void {
    // Check for outdated technology
    if (panel.efficiency && panel.efficiency < 0.18) {
      suggestions.push({
        field: 'efficiency',
        type: 'improvement',
        message: 'Consider newer panels with higher efficiency (>20%)',
        priority: 'medium',
        estimatedImpact: '10-15% higher energy production'
      });
    }

    // Check temperature coefficients
    if (panel.tempCoeffPmax && panel.tempCoeffPmax > -0.35) {
      warnings.push({
        field: 'tempCoeffPmax',
        type: 'suspicious',
        message: 'Temperature coefficient may be too high for optimal performance',
        severity: 'warning',
        recommendation: 'Verify coefficient with manufacturer'
      });
    }

    // Check for AI attributes if available
    if (panel.aiAttributes) {
      this.assessAIAttributes(panel.aiAttributes, warnings, suggestions);
    }
  }

  /**
   * Assess data quality for inverter data
   */
  private assessInverterDataQuality(inverter: EnhancedInverter, warnings: any[], suggestions: any[]): void {
    // Check efficiency
    if (inverter.efficiency && inverter.efficiency < 0.95) {
      suggestions.push({
        field: 'efficiency',
        type: 'improvement',
        message: 'Consider higher efficiency inverters (>97%)',
        priority: 'medium',
        estimatedImpact: '2-5% higher system efficiency'
      });
    }

    // Check for AI attributes if available
    if (inverter.aiAttributes) {
      this.assessAIAttributes(inverter.aiAttributes, warnings, suggestions);
    }
  }

  /**
   * Assess AI attributes for data quality
   */
  private assessAIAttributes(aiAttributes: any, warnings: any[], suggestions: any[]): void {
    // Check reliability score
    if (aiAttributes.reliabilityScore && aiAttributes.reliabilityScore < 70) {
      warnings.push({
        field: 'reliabilityScore',
        type: 'suspicious',
        message: 'Low reliability score may indicate potential issues',
        severity: 'warning',
        recommendation: 'Verify equipment reliability with manufacturer'
      });
    }

    // Check value rating
    if (aiAttributes.valueRating && aiAttributes.valueRating < 60) {
      suggestions.push({
        field: 'valueRating',
        type: 'improvement',
        message: 'Consider equipment with better value rating',
        priority: 'medium',
        estimatedImpact: 'Better cost-performance ratio'
      });
    }
  }

  /**
   * Clean and normalize panel data
   */
  private cleanPanelData(panel: EnhancedPVPanel): EnhancedPVPanel {
    const cleaned = { ...panel };

    // Normalize string fields
    if (cleaned.maker) cleaned.maker = cleaned.maker.trim();
    if (cleaned.model) cleaned.model = cleaned.model.trim();

    // Ensure numeric fields are numbers
    if (typeof cleaned.power === 'string') cleaned.power = parseFloat(cleaned.power);
    if (typeof cleaned.efficiency === 'string') cleaned.efficiency = parseFloat(cleaned.efficiency);

    return cleaned;
  }

  /**
   * Clean and normalize inverter data
   */
  private cleanInverterData(inverter: EnhancedInverter): EnhancedInverter {
    const cleaned = { ...inverter };

    // Normalize string fields
    if (cleaned.maker) cleaned.maker = cleaned.maker.trim();
    if (cleaned.model) cleaned.model = cleaned.model.trim();

    // Ensure numeric fields are numbers
    if (typeof cleaned.maxOutputPower === 'string') cleaned.maxOutputPower = parseFloat(cleaned.maxOutputPower);
    if (typeof cleaned.efficiency === 'string') cleaned.efficiency = parseFloat(cleaned.efficiency);

    return cleaned;
  }

  /**
   * Calculate data quality metrics
   */
  calculateDataQualityMetrics(data: any[]): DataQualityMetrics {
    const totalRecords = data.length;
    let validRecords = 0;
    let completeRecords = 0;
    let estimatedValues = 0;
    const issues: any[] = [];

    for (const record of data) {
      const validation = this.validatePanelData(record);
      if (validation.isValid) validRecords++;
      if (validation.errors.length === 0) completeRecords++;
      if (validation.warnings.some(w => w.type === 'estimated')) estimatedValues++;

      // Collect issues
      validation.errors.forEach(error => {
        issues.push({
          type: 'missing' as const,
          description: error.message,
          severity: error.severity === 'critical' ? 'high' : 'medium'
        });
      });

      validation.warnings.forEach(warning => {
        issues.push({
          type: 'inconsistent' as const,
          description: warning.message,
          severity: 'medium'
        });
      });
    }

    const completeness = (completeRecords / totalRecords) * 100;
    const accuracy = (validRecords / totalRecords) * 100;
    const consistency = ((totalRecords - estimatedValues) / totalRecords) * 100;

    return {
      completeness,
      accuracy,
      consistency,
      timeliness: 100, // Assume data is current
      relevance: 100, // Assume data is relevant
      lastValidated: new Date(),
      issues
    };
  }
}