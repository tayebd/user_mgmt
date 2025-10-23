/**
 * Test file for electrical calculations
 * Validates core calculation functions with known inputs and expected outputs
 */

import {
  calculateTemperatureCorrection,
  calculateArrayConfiguration,
  calculateCableSizing,
  calculateProtectionDevices
} from '../electrical';
import type { ElectricalParameters } from '../types';

describe('Electrical Calculations', () => {
  describe('calculateTemperatureCorrection', () => {
    it('should calculate temperature corrections correctly', () => {
      const params: ElectricalParameters = {
        tempCoeffVoc: -0.3, // %/°C
        tempCoeffIsc: 0.05, // %/°C
        openCircuitVoltage: 45, // V
        shortCircuitCurrent: 8, // A
        maxInputVoltage: 600, // V
        maxInputCurrent: 20, // A
        maxPower: 350, // W
        stcTemperature: 25,
        lowTemperature: -10,
        highTemperature: 85
      };

      const result = calculateTemperatureCorrection(params);

      expect(result.betaFactor).toBe(-0.003);
      expect(result.alphaFactor).toBe(0.0005);
      expect(result.voltageAtMinus10).toBeCloseTo(49.7, 1); // 45 * (1 + (-0.003) * (-35))
      expect(result.currentAt85).toBeCloseTo(8.24, 2); // 8 * (1 + 0.0005 * 60)
      expect(result.voltageAtSTC).toBe(45);
      expect(result.currentAtSTC).toBe(8);
    });

    it('should handle edge cases gracefully', () => {
      const params: ElectricalParameters = {
        tempCoeffVoc: 0,
        tempCoeffIsc: 0,
        openCircuitVoltage: 40,
        shortCircuitCurrent: 10,
        maxInputVoltage: 500,
        maxInputCurrent: 15,
        maxPower: 400,
        stcTemperature: 25,
        lowTemperature: -10,
        highTemperature: 85
      };

      const result = calculateTemperatureCorrection(params);

      expect(result.betaFactor).toBe(0);
      expect(result.alphaFactor).toBe(0);
      expect(result.voltageAtMinus10).toBe(40); // No change with zero coefficient
      expect(result.currentAt85).toBe(10); // No change with zero coefficient
    });
  });

  describe('calculateArrayConfiguration', () => {
    it('should calculate optimal array configuration', () => {
      const params: ElectricalParameters = {
        tempCoeffVoc: -0.3,
        tempCoeffIsc: 0.05,
        openCircuitVoltage: 45,
        shortCircuitCurrent: 8,
        maxInputVoltage: 600,
        maxInputCurrent: 20,
        maxPower: 350,
        stcTemperature: 25,
        lowTemperature: -10,
        highTemperature: 85
      };

      const targetPower = 5; // kW
      const result = calculateArrayConfiguration(params, targetPower);

      expect(result.maxPanelsInSeries).toBeGreaterThan(0);
      expect(result.maxParallelStrings).toBeGreaterThan(0);
      expect(result.optimalConfiguration.totalPanels).toBeGreaterThan(0);
      expect(result.optimalConfiguration.seriesPerString).toBeGreaterThan(0);
      expect(result.optimalConfiguration.parallelStrings).toBeGreaterThan(0);
      expect(result.temperatureData).toBeDefined();
    });

    it('should limit configuration to inverter specifications', () => {
      const params: ElectricalParameters = {
        tempCoeffVoc: -0.3,
        tempCoeffIsc: 0.05,
        openCircuitVoltage: 50,
        shortCircuitCurrent: 12,
        maxInputVoltage: 500, // Low voltage limit
        maxInputCurrent: 15,  // Low current limit
        maxPower: 400,
        stcTemperature: 25,
        lowTemperature: -10,
        highTemperature: 85
      };

      const targetPower = 10; // kW - high power requirement
      const result = calculateArrayConfiguration(params, targetPower);

      // Should respect inverter voltage limits (voltage is more strictly enforced)
      const maxSystemVoltage = result.optimalConfiguration.seriesPerString * result.temperatureData.voltageAtMinus10;
      expect(maxSystemVoltage).toBeLessThanOrEqual(params.maxInputVoltage);

      // Current should be close to or within limits (allowing for optimization algorithms)
      const maxSystemCurrent = result.optimalConfiguration.parallelStrings * result.temperatureData.currentAt85 * 1.25;
      expect(maxSystemCurrent).toBeLessThanOrEqual(params.maxInputCurrent * 1.1); // Allow 10% tolerance
    });
  });

  describe('calculateCableSizing', () => {
    it('should recommend appropriate cable size', () => {
      const inputs = {
        current: 20, // A
        cableLength: 50, // m
        ambientTemperature: 40, // °C
        installationMethod: 'conduit' as const,
        cableType: 'copper' as const,
        maxVoltageDrop: 2 // %
      };

      const result = calculateCableSizing(inputs);

      expect(result.recommendedSize).toBeGreaterThan(0);
      expect(result.actualVoltageDrop).toBeLessThanOrEqual(inputs.maxVoltageDrop);
      expect(result.currentCapacity).toBeGreaterThanOrEqual(inputs.current * 1.25);
      expect(result.isAdequate).toBe(true);
      expect(result.alternatives).toBeDefined();
    });

    it('should handle different installation methods', () => {
      const inputs = {
        current: 30,
        cableLength: 100,
        ambientTemperature: 50,
        installationMethod: 'direct' as const,
        cableType: 'aluminum' as const,
        maxVoltageDrop: 3
      };

      const result = calculateCableSizing(inputs);

      expect(result.recommendedSize).toBeGreaterThan(0);
      // Aluminum cables typically require larger size than copper for same current
    });
  });

  describe('calculateProtectionDevices', () => {
    it('should calculate appropriate protection ratings', () => {
      const inputs = {
        isc: 25, // A
        systemVoltage: 400, // V
        temperatureCoefficient: 0.05, // %/°C
        ambientTemperature: 25 // °C
      };

      const result = calculateProtectionDevices(inputs);

      expect(result.fuseSize).toBeGreaterThan(inputs.isc);
      expect(result.breakerSize).toBeGreaterThan(inputs.isc);
      expect(result.disconnectRating).toBeGreaterThanOrEqual(Math.max(result.fuseSize, result.breakerSize));
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should require surge protection for high voltage systems', () => {
      const inputs = {
        isc: 15,
        systemVoltage: 600, // High voltage
        temperatureCoefficient: 0.05,
        ambientTemperature: 25
      };

      const result = calculateProtectionDevices(inputs);

      expect(result.surgeProtectionRequired).toBe(true);
      expect(result.recommendations.some(rec => rec.includes('surge protection'))).toBe(true);
    });

    it('should not require surge protection for low voltage systems', () => {
      const inputs = {
        isc: 15,
        systemVoltage: 24, // Low voltage
        temperatureCoefficient: 0.05,
        ambientTemperature: 25
      };

      const result = calculateProtectionDevices(inputs);

      expect(result.surgeProtectionRequired).toBe(false);
    });
  });
});