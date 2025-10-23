/**
 * Test file for financial calculations
 * Validates financial metrics calculations with known inputs and expected outputs
 */

import {
  calculateFinancialMetrics,
  calculateSimplePaybackPeriod,
  calculateDiscountedPaybackPeriod,
  calculateLifetimeMetrics,
  calculateCO2Savings
} from '../financial';
import type { FinancialInputs } from '../types';

describe('Financial Calculations', () => {
  describe('calculateFinancialMetrics', () => {
    it('should calculate financial metrics correctly', () => {
      const inputs: FinancialInputs = {
        systemCost: 1.5, // $/W
        installationCost: 0.5, // $/W
        electricityRate: 0.12, // $/kWh
        systemSize: 5, // kW
        annualProduction: 7000, // kWh/year
        discountRate: 5, // %
        projectLifetime: 25, // years
        maintenanceCost: 0.5 // % of system cost/year
      };

      const result = calculateFinancialMetrics(inputs);

      expect(result.systemCost).toBe(7500); // 1.5 * 5 * 1000
      expect(result.installationCost).toBe(2500); // 0.5 * 5 * 1000
      expect(result.totalCost).toBe(10000); // 7500 + 2500

      // Annual savings = 7000 * 0.12 = 840
      // Annual maintenance = 10000 * 0.005 = 50
      // Net annual cash flow = 840 - 50 = 790
      // Payback period = 10000 / 790 ≈ 12.66 years
      expect(result.paybackPeriod).toBeCloseTo(12.66, 1);

      expect(result.roi).toBeGreaterThan(0);
      expect(result.npv).toBeDefined();
      expect(result.irr).toBeDefined();
      expect(result.lcoe).toBeGreaterThan(0);
    });

    it('should handle zero electricity rate', () => {
      const inputs: FinancialInputs = {
        systemCost: 1.0,
        installationCost: 0.5,
        electricityRate: 0, // Free electricity
        systemSize: 3,
        annualProduction: 4000,
        discountRate: 5,
        projectLifetime: 25,
        maintenanceCost: 1
      };

      const result = calculateFinancialMetrics(inputs);

      expect(result.paybackPeriod).toBe(Infinity); // No savings, infinite payback
      expect(result.roi).toBeLessThan(0); // Negative ROI
    });

    it('should calculate LCOE correctly', () => {
      const inputs: FinancialInputs = {
        systemCost: 1.0,
        installationCost: 0.5,
        electricityRate: 0.10,
        systemSize: 10,
        annualProduction: 14000,
        discountRate: 3,
        projectLifetime: 25,
        maintenanceCost: 0.5
      };

      const result = calculateFinancialMetrics(inputs);

      // LCOE should be reasonable (typically $0.05-0.15/kWh for solar)
      expect(result.lcoe).toBeGreaterThan(0.02);
      expect(result.lcoe).toBeLessThan(0.30);
    });
  });

  describe('calculateSimplePaybackPeriod', () => {
    it('should calculate simple payback period', () => {
      const totalCost = 10000;
      const annualSavings = 1000;
      const annualMaintenanceCost = 100;

      const result = calculateSimplePaybackPeriod(totalCost, annualSavings, annualMaintenanceCost);

      expect(result).toBe(totalCost / (annualSavings - annualMaintenanceCost));
      expect(result).toBeCloseTo(11.11, 1);
    });

    it('should handle zero net savings', () => {
      const totalCost = 10000;
      const annualSavings = 500;
      const annualMaintenanceCost = 500; // Same as savings

      const result = calculateSimplePaybackPeriod(totalCost, annualSavings, annualMaintenanceCost);

      expect(result).toBe(Infinity);
    });
  });

  describe('calculateDiscountedPaybackPeriod', () => {
    it('should calculate discounted payback period longer than simple', () => {
      const totalCost = 10000;
      const annualSavings = 1500;
      const annualMaintenanceCost = 200;
      const discountRate = 5;

      const simplePayback = calculateSimplePaybackPeriod(totalCost, annualSavings, annualMaintenanceCost);
      const discountedPayback = calculateDiscountedPaybackPeriod(totalCost, annualSavings, annualMaintenanceCost, discountRate);

      // Discounted payback should be longer than simple payback
      expect(discountedPayback).toBeGreaterThan(simplePayback);
      expect(discountedPayback).toBeLessThan(Infinity);
    });
  });

  describe('calculateLifetimeMetrics', () => {
    it('should calculate 25-year production with degradation', () => {
      const initialAnnualProduction = 10000;
      const degradationRate = 0.5; // %/year
      const electricityRateEscalation = 2; // %/year

      const result = calculateLifetimeMetrics(initialAnnualProduction, degradationRate, electricityRateEscalation, 25);

      expect(result.totalProduction).toBeGreaterThan(0);
      expect(result.totalSavings).toBeGreaterThan(0);
      expect(result.productionByYear).toHaveLength(25);
      expect(result.savingsByYear).toHaveLength(25);

      // Production should decrease over time due to degradation
      expect(result.productionByYear[0]).toBeGreaterThan(result.productionByYear[24]);

      // Savings should increase over time due to electricity rate escalation
      expect(result.savingsByYear[24]).toBeGreaterThan(result.savingsByYear[0]);

      // Total production should be reasonable (degraded average over 25 years)
      const averageAnnualProduction = result.totalProduction / 25;
      expect(averageAnnualProduction).toBeLessThan(initialAnnualProduction);
      expect(averageAnnualProduction).toBeGreaterThan(initialAnnualProduction * 0.8);
    });

    it('should handle zero degradation', () => {
      const initialAnnualProduction = 8000;
      const degradationRate = 0;
      const electricityRateEscalation = 3;

      const result = calculateLifetimeMetrics(initialAnnualProduction, degradationRate, electricityRateEscalation, 25);

      // With zero degradation, production should be constant
      expect(result.productionByYear[0]).toBe(initialAnnualProduction);
      expect(result.productionByYear[24]).toBe(initialAnnualProduction);

      // But savings should still increase due to electricity rate escalation
      expect(result.savingsByYear[24]).toBeGreaterThan(result.savingsByYear[0]);
    });
  });

  describe('calculateCO2Savings', () => {
    it('should calculate CO2 savings correctly', () => {
      const annualProduction = 10000; // kWh/year
      const gridEmissionFactor = 0.5; // kg CO2/kWh

      const result = calculateCO2Savings(annualProduction, gridEmissionFactor);

      expect(result).toBe(5000); // 10000 * 0.5
    });

    it('should use default emission factor when not provided', () => {
      const annualProduction = 8000;

      const result = calculateCO2Savings(annualProduction);

      expect(result).toBe(4000); // 8000 * 0.5 (default)
    });

    it('should handle zero production', () => {
      const result = calculateCO2Savings(0);
      expect(result).toBe(0);
    });
  });
});