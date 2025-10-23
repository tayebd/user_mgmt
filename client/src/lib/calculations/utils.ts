/**
 * Calculation Utilities
 * Helper functions for solar PV calculations
 * No UI dependencies, pure functions only
 */

/**
 * Convert between different units
 */
export class UnitConverter {
  /**
   * Convert watts to kilowatts
   */
  static wattsToKilowatts(watts: number): number {
    return watts / 1000;
  }

  /**
   * Convert kilowatts to watts
   */
  static kilowattsToWatts(kilowatts: number): number {
    return kilowatts * 1000;
  }

  /**
   * Convert square meters to square feet
   */
  static squareMetersToSquareFeet(sqm: number): number {
    return sqm * 10.7639;
  }

  /**
   * Convert square feet to square meters
   */
  static squareFeetToSquareMeters(sqft: number): number {
    return sqft / 10.7639;
  }

  /**
   * Convert temperature from Celsius to Fahrenheit
   */
  static celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  /**
   * Convert temperature from Fahrenheit to Celsius
   */
  static fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5/9;
  }
}

/**
 * Mathematical utility functions
 */
export class MathUtils {
  /**
   * Round number to specified decimal places
   */
  static round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Calculate percentage
   */
  static percentage(value: number, total: number): number {
    return total !== 0 ? (value / total) * 100 : 0;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Interpolate between two values
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * MathUtils.clamp(factor, 0, 1);
  }

  /**
   * Calculate compound growth over years
   */
  static compoundGrowth(initial: number, rate: number, years: number): number {
    return initial * Math.pow(1 + rate / 100, years);
  }

  /**
   * Calculate geometric mean
   */
  static geometricMean(values: number[]): number {
    if (values.length === 0) return 0;
    const product = values.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / values.length);
  }
}

/**
 * Solar calculation utilities
 */
export class SolarUtils {
  /**
   * Calculate system performance ratio
   */
  static calculatePerformanceRatio(
    actualProduction: number,
    theoreticalProduction: number
  ): number {
    return MathUtils.percentage(actualProduction, theoreticalProduction);
  }

  /**
   * Calculate system capacity factor
   */
  static calculateCapacityFactor(
    annualProduction: number,
    systemSize: number // kW
  ): number {
    const theoreticalMaxProduction = systemSize * 8760; // hours per year
    return MathUtils.percentage(annualProduction, theoreticalMaxProduction);
  }

  /**
   * Estimate annual production based on location and system size
   */
  static estimateAnnualProduction(
    systemSize: number, // kW
    irradiance: number, // kWh/m²/year
    performanceRatio: number = 0.75, // 75% typical
    panelEfficiency: number = 0.20 // 20% typical
  ): number {
    return systemSize * irradiance * performanceRatio * panelEfficiency;
  }

  /**
   * Calculate roof area required for system
   */
  static calculateRoofAreaRequired(
    systemSize: number, // kW
    panelEfficiency: number = 0.20, // 20% typical
    spacingFactor: number = 1.3 // 30% extra for spacing
  ): number {
    // 1 kW of panels typically requires about 5-7 m² at 20% efficiency
    const baseArea = systemSize * (1 / panelEfficiency) * 5;
    return baseArea * spacingFactor;
  }

  /**
   * Calculate optimal tilt angle based on latitude
   */
  static calculateOptimalTilt(latitude: number): number {
    // Simple rule: tilt angle ≈ latitude for year-round production
    return Math.abs(latitude);
  }

  /**
   * Calculate optimal azimuth angle (direction panels face)
   */
  static calculateOptimalAzimuth(latitude: number, hemisphere: 'north' | 'south' = 'north'): number {
    // In northern hemisphere, optimal is south (180°)
    // In southern hemisphere, optimal is north (0°/360°)
    return hemisphere === 'north' ? 180 : 0;
  }

  /**
   * Estimate shading losses based on object height and distance
   */
  static estimateShadingLosses(
    objectHeight: number, // meters
    distance: number, // meters
    tiltAngle: number // degrees
  ): number {
    // Simple shading calculation
    const shadowLength = objectHeight / Math.tan((90 - tiltAngle) * Math.PI / 180);

    if (shadowLength >= distance) {
      return 100; // Complete shading
    }

    const shadingFactor = shadowLength / distance;
    return Math.min(shadingFactor * 100, 100); // Percentage loss
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate that value is a positive number
   */
  static isPositiveNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value) && value > 0;
  }

  /**
   * Validate that value is a non-negative number
   */
  static isNonNegativeNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
  }

  /**
   * Validate percentage (0-100)
   */
  static isValidPercentage(value: any): boolean {
    return ValidationUtils.isNonNegativeNumber(value) && value <= 100;
  }

  /**
   * Validate voltage range
   */
  static isValidVoltage(voltage: number): boolean {
    return ValidationUtils.isPositiveNumber(voltage) && voltage >= 0 && voltage <= 1500;
  }

  /**
   * Validate current range
   */
  static isValidCurrent(current: number): boolean {
    return ValidationUtils.isPositiveNumber(current) && current >= 0 && current <= 1000;
  }

  /**
   * Validate power range
   */
  static isValidPower(power: number): boolean {
    return ValidationUtils.isPositiveNumber(power) && power >= 0 && power <= 1000000; // 1MW max
  }

  /**
   * Validate temperature range
   */
  static isValidTemperature(temperature: number): boolean {
    return typeof temperature === 'number' && !isNaN(temperature) && temperature >= -40 && temperature <= 85;
  }

  /**
   * Validate coordinate (latitude/longitude)
   */
  static isValidCoordinate(coord: number): boolean {
    return typeof coord === 'number' && !isNaN(coord) && Math.abs(coord) <= 90;
  }

  /**
   * Validate system configuration
   */
  static validateSystemConfiguration(config: {
    panelsInSeries: number;
    parallelStrings: number;
    systemVoltage: number;
    systemCurrent: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!ValidationUtils.isPositiveNumber(config.panelsInSeries) || config.panelsInSeries > 50) {
      errors.push('Panels in series must be a positive number less than 50');
    }

    if (!ValidationUtils.isPositiveNumber(config.parallelStrings) || config.parallelStrings > 100) {
      errors.push('Parallel strings must be a positive number less than 100');
    }

    if (!ValidationUtils.isValidVoltage(config.systemVoltage)) {
      errors.push('System voltage must be between 0 and 1500V');
    }

    if (!ValidationUtils.isValidCurrent(config.systemCurrent)) {
      errors.push('System current must be between 0 and 1000A');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Error handling utilities
 */
export class CalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * Safe calculation wrapper with error handling
 */
export function safeCalculation<T>(
  calculation: () => T,
  fallback: T,
  errorMessage?: string
): T {
  try {
    const result = calculation();

    // Validate result is not NaN or Infinity
    if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
      throw new CalculationError(
        errorMessage || 'Calculation resulted in invalid number',
        'INVALID_RESULT'
      );
    }

    return result;
  } catch (error) {
    console.warn('Calculation error:', error instanceof Error ? error.message : error);
    return fallback;
  }
}

/**
 * Create calculation pipeline for complex calculations
 */
export function createCalculationPipeline<T>(
  steps: Array<(input: T) => T>
): (input: T) => T {
  return (input: T) => {
    return steps.reduce((acc, step) => step(acc), input);
  };
}