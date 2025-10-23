/**
 * Validation Utilities
 * Shared validation schemas and utilities for solar PV projects
 * Used by both Regular and AI Project Wizards
 */

import { z } from 'zod';
import type { PVPanel, Inverter, PVProject } from '@/shared/types';

// Define the missing schemas here for validation
const PVProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  // Add other project fields as needed
});

// Base validation schemas
export const LocationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  elevation: z.number().min(0).optional(),
  timezone: z.string().optional(),
});

export const ArrayConfigurationSchema = z.object({
  panelId: z.number().positive('Panel must be selected'),
  inverterId: z.number().positive('Inverter must be selected'),
  panelsPerString: z.number().min(1).max(50, 'Panels per string must be between 1 and 50'),
  parallelStrings: z.number().min(1).max(20, 'Parallel strings must be between 1 and 20'),
  tiltAngle: z.number().min(0).max(90, 'Tilt angle must be between 0 and 90 degrees'),
  azimuth: z.number().min(0).max(360, 'Azimuth must be between 0 and 360 degrees'),
  mountingType: z.enum(['roof-mounted', 'ground-mounted', 'carport', 'floating'], {
    errorMap: () => ({ message: 'Please select a valid mounting type' }),
  }),
});

export const SystemRequirementsSchema = z.object({
  targetPower: z.number().min(1).max(10000, 'Target power must be between 1 and 10,000 kW'),
  availableRoofArea: z.number().min(1).max(100000, 'Roof area must be between 1 and 100,000 m²'),
  budget: z.number().min(0).max(10000000, 'Budget must be between 0 and $10,000,000'),
  priority: z.enum(['cost', 'efficiency', 'space', 'reliability'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  constraints: z.array(z.string()).optional(),
});

export const ElectricalParametersSchema = z.object({
  systemVoltage: z.enum(['230V', '400V', '480V'], {
    errorMap: () => ({ message: 'Please select a valid system voltage' }),
  }),
  phaseType: z.enum(['single-phase', 'three-phase'], {
    errorMap: () => ({ message: 'Please select a valid phase type' }),
  }),
  backupPower: z.boolean().optional(),
  batteryStorage: z.boolean().optional(),
  evCharging: z.boolean().optional(),
});

export const ProjectInfoSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number').optional(),
  expectedStartDate: z.string().optional(),
  projectType: z.enum(['residential', 'commercial', 'industrial', 'utility'], {
    errorMap: () => ({ message: 'Please select a valid project type' }),
  }),
});

// Combined validation schema for complete project
export const PVProjectValidationSchema = PVProjectSchema.extend({
  location: LocationSchema,
  arrayConfiguration: ArrayConfigurationSchema,
  systemRequirements: SystemRequirementsSchema,
  electricalParameters: ElectricalParametersSchema,
  projectInfo: ProjectInfoSchema,
});

export type LocationFormData = z.infer<typeof LocationSchema>;
export type ArrayConfigurationFormData = z.infer<typeof ArrayConfigurationSchema>;
export type SystemRequirementsFormData = z.infer<typeof SystemRequirementsSchema>;
export type ElectricalParametersFormData = z.infer<typeof ElectricalParametersSchema>;
export type ProjectInfoFormData = z.infer<typeof ProjectInfoSchema>;

/**
 * Validation utility class
 */
export class ValidationUtils {
  /**
   * Validate complete PV project data
   */
  static validatePVProject(data: Partial<PVProject>): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const result = PVProjectValidationSchema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string[]> = {};

      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: {},
    };
  }

  /**
   * Validate array configuration compatibility
   */
  static validateArrayCompatibility(
    panel: PVPanel,
    inverter: Inverter,
    configuration: ArrayConfigurationFormData
  ): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Calculate voltage at minimum temperature (-10°C)
    const voltageAtMinus10 = panel.openCircuitVoltage * (1 + panel.tempCoeffVoc * -35); // -35°C difference from STC

    // Check series voltage limits
    const stringVoltage = configuration.panelsPerString * voltageAtMinus10;
    if (stringVoltage > inverter.maxStringVoltage) {
      errors.push(`String voltage (${stringVoltage.toFixed(1)}V) exceeds inverter maximum DC voltage (${inverter.maxStringVoltage}V)`);
    }

    // Check MPPT voltage range
    const stringVoltageSTC = configuration.panelsPerString * panel.openCircuitVoltage;
    if (stringVoltageSTC > inverter.maxInputVoltage) {
      errors.push(`String voltage at STC (${stringVoltageSTC.toFixed(1)}V) exceeds inverter MPPT maximum (${inverter.maxInputVoltage}V)`);
    }

    if (stringVoltageSTC < inverter.minInputVoltage) {
      errors.push(`String voltage at STC (${stringVoltageSTC.toFixed(1)}V) below inverter MPPT minimum (${inverter.minInputVoltage}V)`);
    }

    // Check current limits
    const stringCurrent = configuration.parallelStrings * panel.shortCircuitCurrent;
    if (stringCurrent > inverter.maxStringCurrent) {
      errors.push(`String current (${stringCurrent.toFixed(2)}A) exceeds inverter maximum DC current (${inverter.maxStringCurrent}A)`);
    }

    // Check power ratio (DC to AC)
    const totalDCPower = configuration.panelsPerString * configuration.parallelStrings * panel.power;
    const powerRatio = totalDCPower / (inverter.nominalOutputPower * 1000);

    if (powerRatio > 1.3) {
      warnings.push(`DC/AC power ratio is ${powerRatio.toFixed(2)} - inverter may be undersized`);
    } else if (powerRatio < 0.8) {
      warnings.push(`DC/AC power ratio is ${powerRatio.toFixed(2)} - inverter may be oversized`);
    }

    // Check temperature effects
    if (Math.abs(panel.tempCoeffVoc) > 0.004) {
      warnings.push('High temperature coefficient - consider temperature effects in design');
    }

    // Check mounting type considerations
    if (configuration.mountingType === 'roof-mounted' && configuration.tiltAngle < 10) {
      warnings.push('Low tilt angle may reduce self-cleaning and increase soiling losses');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Validate system sizing
   */
  static validateSystemSizing(
    requirements: SystemRequirementsFormData,
    panel: PVPanel,
    availableRoofArea: number
  ): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
    recommendedPanels: number;
    maxPanels: number;
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Calculate required panels
    const panelPowerKW = panel.power / 1000;
    const requiredPanels = Math.ceil(requirements.targetPower / panelPowerKW);

    // Calculate maximum panels by area
    const panelArea = (panel.length * panel.width) / 1000000; // Convert mm² to m²
    const maxPanels = Math.floor(availableRoofArea / panelArea);

    // Check if target power is achievable with available area
    if (requiredPanels > maxPanels) {
      errors.push(`Target power requires ${requiredPanels} panels, but only ${maxPanels} panels fit on available roof area`);
    }

    // Check budget feasibility
    const estimatedCost = requiredPanels * (panel.price ?? 200); // Default $200/W if no price
    if (estimatedCost > requirements.budget) {
      warnings.push(`Estimated system cost ($${(estimatedCost / 1000).toFixed(0)}k) exceeds budget by $${((estimatedCost - requirements.budget) / 1000).toFixed(0)}k`);
    }

    // Check power sizing
    if (requirements.targetPower < 1) {
      warnings.push('Very small system size - consider if installation costs justify such a small system');
    } else if (requirements.targetPower > 100) {
      warnings.push('Very large system size - ensure electrical infrastructure can support this size');
    }

    // Check priority alignment
    const actualPowerRatio = (requiredPanels * panelPowerKW) / requirements.targetPower;
    if (requirements.priority === 'efficiency' && panel.efficiency < 18) {
      warnings.push('Efficiency priority selected, but panel efficiency is below 18%');
    } else if (requirements.priority === 'space' && panel.efficiency < 20) {
      warnings.push('Space optimization priority selected, consider higher efficiency panels');
    } else if (requirements.priority === 'cost' && (panel.price ?? 200) > 300) {
      warnings.push('Cost optimization priority selected, but panel price is above average');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      recommendedPanels: requiredPanels,
      maxPanels,
    };
  }

  /**
   * Validate location data
   */
  static validateLocation(location: LocationFormData): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check coordinate validity
    if (Math.abs(location.latitude) > 85) {
      warnings.push('Location is near polar regions - solar irradiance may be very low');
    }

    // Check if location has good solar potential
    if (Math.abs(location.latitude) > 60) {
      warnings.push('High latitude location - consider seasonal production variations');
    }

    // Check address format
    if (location.address.length < 5) {
      warnings.push('Address seems incomplete - please verify the full address');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Validate electrical parameters
   */
  static validateElectricalParameters(
    parameters: ElectricalParametersFormData,
    systemSize: number // kW
  ): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check voltage compatibility with system size
    if (parameters.systemVoltage === '230V' && systemSize > 5) {
      warnings.push('Single-phase 230V system for >5kW may require special approval');
    }

    if (parameters.systemVoltage === '400V' && systemSize < 3) {
      warnings.push('Three-phase system for <3kW may be unnecessarily complex');
    }

    // Check backup power implications
    if (parameters.backupPower && systemSize < 5) {
      warnings.push('Backup power capability may require larger system size');
    }

    // Check battery storage considerations
    if (parameters.batteryStorage && !parameters.backupPower) {
      warnings.push('Battery storage without backup power capability may have limited usefulness');
    }

    // Check EV charging compatibility
    if (parameters.evCharging && systemSize < 10) {
      warnings.push('EV charging may require larger system size for effective charging');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Get validation summary for wizard step
   */
  static getValidationSummary(
    step: 'location' | 'array' | 'requirements' | 'electrical' | 'project',
    data: LocationFormData | ArrayConfigurationFormData | SystemRequirementsFormData | ElectricalParametersFormData | ProjectInfoFormData
  ): {
    isValid: boolean;
    warningCount: number;
    errorCount: number;
    messages: string[];
  } {
    let isValid = true;
    let warningCount = 0;
    let errorCount = 0;
    const messages: string[] = [];

    switch (step) {
      case 'location': {
        const result = this.validateLocation(data as LocationFormData);
        isValid = result.isValid;
        warningCount = result.warnings.length;
        errorCount = result.errors.length;
        messages.push(...result.warnings, ...result.errors);
        break;
      }

      case 'array': {
        // Need panel and inverter data for this validation
        const result = {
          isValid: true,
          warnings: [],
          errors: [],
        };
        isValid = result.isValid;
        warningCount = result.warnings.length;
        errorCount = result.errors.length;
        messages.push(...result.warnings, ...result.errors);
        break;
      }

      case 'requirements': {
        // Need panel data and roof area for this validation
        const result = {
          isValid: true,
          warnings: [],
          errors: [],
        };
        isValid = result.isValid;
        warningCount = result.warnings.length;
        errorCount = result.errors.length;
        messages.push(...result.warnings, ...result.errors);
        break;
      }

      case 'electrical': {
        // Need system size for this validation
        const result = {
          isValid: true,
          warnings: [],
          errors: [],
        };
        isValid = result.isValid;
        warningCount = result.warnings.length;
        errorCount = result.errors.length;
        messages.push(...result.warnings, ...result.errors);
        break;
      }

      case 'project': {
        const result = ProjectInfoSchema.safeParse(data as ProjectInfoFormData);
        isValid = result.success;
        if (!result.success) {
          errorCount = result.error.issues.length;
          messages.push(...result.error.issues.map(issue => issue.message));
        }
        break;
      }
    }

    return {
      isValid,
      warningCount,
      errorCount,
      messages,
    };
  }

  /**
   * Format validation message for display
   */
  static formatValidationMessage(
    type: 'error' | 'warning' | 'info',
    message: string
  ): {
    type: 'error' | 'warning' | 'info';
    message: string;
    icon: string;
    color: string;
  } {
    const config = {
      error: {
        type: 'error' as const,
        icon: '❌',
        color: 'text-red-600',
      },
      warning: {
        type: 'warning' as const,
        icon: '⚠️',
        color: 'text-yellow-600',
      },
      info: {
        type: 'info' as const,
        icon: 'ℹ️',
        color: 'text-blue-600',
      },
    };

    return {
      ...config[type],
      message,
    };
  }

  /**
   * Get field-specific validation rules
   */
  static getFieldValidationRules(field: string): Record<string, ValidationRule> {
    const rules: Record<string, Record<string, ValidationRule>> = {
      projectInfo: {
        name: { required: true, maxLength: 100 },
        customerName: { required: true, maxLength: 100 },
        customerEmail: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          custom: (value: string | number) => {
            const email = String(value);
            if (!email.includes('.')) return 'Email must contain a domain';
            return null;
          }
        },
        customerPhone: {
          required: false, // Phone number is optional
          pattern: /^[+]?[\d\s\-\(\)]+$/,
          custom: (value: string | number) => {
            const phone = String(value);
            const digits = phone.replace(/\D/g, '');
            if (digits.length < 10) return 'Phone number must have at least 10 digits';
            return null;
          }
        },
      },
      location: {
        address: { required: true, minLength: 5 },
        latitude: { required: true, min: -90, max: 90 },
        longitude: { required: true, min: -180, max: 180 },
      },
      systemRequirements: {
        targetPower: { required: true, min: 1, max: 10000 },
        availableRoofArea: { required: true, min: 1, max: 100000 },
        budget: { required: true, min: 0, max: 10000000 },
      },
      arrayConfiguration: {
        panelsPerString: { required: true, min: 1, max: 50 },
        parallelStrings: { required: true, min: 1, max: 20 },
        tiltAngle: { required: true, min: 0, max: 90 },
        azimuth: { required: true, min: 0, max: 360 },
      },
    };

    return rules[field] || { required: false };
  }
}

// Export common validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validatePower = (power: number, min = 1, max = 10000): boolean => {
  return power >= min && power <= max;
};

export const validateArea = (area: number, min = 1, max = 100000): boolean => {
  return area >= min && area <= max;
};

// Define the validation rule type for reuse
type ValidationRule = {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string | number) => string | null;
};