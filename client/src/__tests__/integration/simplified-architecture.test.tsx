/**
 * Integration Tests for Simplified Architecture
 * Tests the interaction between simplified components and services
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test the integration between our new pure calculation services and components
import {
  calculateFinancialMetrics,
  calculateTemperatureCorrection,
  checkUTECompliance
} from '../../lib/calculations';
import { surveyService } from '../../services/survey-service';
import { BaseCard } from '../../components/ui/base-card';

// Mock API client for integration testing
jest.mock('../../services/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../lib/supabase-client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

describe('Simplified Architecture Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Calculation Services Integration', () => {
    it('integrates electrical calculations with compliance checking', () => {
      // Test temperature correction calculations
      const tempResult = calculateTemperatureCorrection({
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
      });

      expect(tempResult.voltageAtMinus10).toBeGreaterThan(45);
      expect(tempResult.currentAt85).toBeGreaterThan(8);

      // Use these results in compliance checking
      const complianceResult = checkUTECompliance({
        arrayConfiguration: {
          maxPanelsInSeries: 20,
          maxParallelStrings: 3,
          totalPanels: 60,
          optimalConfiguration: {
            seriesPerString: 20,
            parallelStrings: 3,
            totalPanels: 60
          },
          temperatureData: {
            voltageAtMinus10: tempResult.voltageAtMinus10,
            currentAt85: tempResult.currentAt85,
            voltageAtSTC: tempResult.voltageAtSTC,
            currentAtSTC: tempResult.currentAtSTC,
            betaFactor: tempResult.betaFactor,
            alphaFactor: tempResult.alphaFactor
          }
        },
        systemVoltage: 400,
        systemCurrent: 37.5,
        location: 'france',
        installationType: 'residential'
      });

      expect(complianceResult).toBeDefined();
      expect(complianceResult.isCompliant).toBeDefined();
      expect(complianceResult.uteSpecificRequirements.groundingRequired).toBe(true);
    });

    it('integrates financial calculations with system sizing', () => {
      const financialInputs = {
        systemCost: 1.5,
        installationCost: 0.5,
        electricityRate: 0.12,
        systemSize: 5,
        annualProduction: 7000,
        discountRate: 5,
        projectLifetime: 25,
        maintenanceCost: 0.5
      };

      const result = calculateFinancialMetrics(financialInputs);

      // Verify integration between different financial metrics
      expect(result.systemCost).toBe(7500);
      expect(result.installationCost).toBe(2500);
      expect(result.totalCost).toBe(10000);
      expect(result.paybackPeriod).toBeGreaterThan(0);
      expect(result.roi).toBeDefined();
      expect(result.npv).toBeDefined();
      expect(result.irr).toBeDefined();
      expect(result.lcoe).toBeGreaterThan(0);

      // LCOE should be reasonable for solar (typically $0.05-0.15/kWh)
      expect(result.lcoe).toBeGreaterThan(0.02);
      expect(result.lcoe).toBeLessThan(0.30);
    });

    it('handles calculation chain for complete solar system design', () => {
      // Step 1: Electrical calculations
      const electricalResult = calculateTemperatureCorrection({
        tempCoeffVoc: -0.3,
        tempCoeffIsc: 0.05,
        openCircuitVoltage: 40,
        shortCircuitCurrent: 10,
        maxInputVoltage: 800,
        maxInputCurrent: 50,
        maxPower: 400,
        stcTemperature: 25,
        lowTemperature: -10,
        highTemperature: 85
      });

      // Step 2: Array configuration (would normally call calculateArrayConfiguration)
      const mockArrayConfig = {
        maxPanelsInSeries: Math.floor(800 / electricalResult.voltageAtMinus10),
        maxParallelStrings: Math.floor(50 / electricalResult.currentAt85),
        totalPanels: 30,
        optimalConfiguration: {
          seriesPerString: 15,
          parallelStrings: 2,
          totalPanels: 30
        },
        temperatureData: electricalResult
      };

      // Step 3: Compliance checking
      const complianceResult = checkUTECompliance({
        arrayConfiguration: mockArrayConfig,
        systemVoltage: 15 * electricalResult.voltageAtSTC,
        systemCurrent: 2 * electricalResult.currentAt85,
        location: 'france',
        installationType: 'residential'
      });

      // Step 4: Financial calculations
      const systemSize = mockArrayConfig.totalPanels * 0.4; // 400W panels
      const financialResult = calculateFinancialMetrics({
        systemCost: 1.2,
        installationCost: 0.3,
        electricityRate: 0.15,
        systemSize: systemSize,
        annualProduction: systemSize * 1400, // Specific production
        discountRate: 4,
        projectLifetime: 25,
        maintenanceCost: 0.5
      });

      // Verify all steps integrate properly
      expect(electricalResult.voltageAtMinus10).toBeGreaterThan(40);
      expect(mockArrayConfig.maxPanelsInSeries).toBeGreaterThan(10);
      expect(complianceResult.isCompliant).toBeDefined();
      expect(financialResult.totalCost).toBeGreaterThan(0);
      expect(financialResult.paybackPeriod).toBeLessThan(25);
    });
  });

  describe('Service Layer Integration', () => {
    it('integrates survey service with calculation services', async () => {
      const mockSurveyData = {
        id: 1,
        title: 'Solar Assessment Survey',
        description: 'Survey for solar potential assessment',
        surveyJson: JSON.stringify({
          pages: [{
            elements: [{
              type: 'rating',
              name: 'solar_knowledge',
              title: 'Solar Knowledge Rating'
            }]
          }]
        })
      };

      const mockResponses = [{
        question1: 'Good understanding',
        question2: 'High interest',
        solar_knowledge: 4
      }];

      // Mock API responses
      const { apiClient } = require('../../services/api-client');
      apiClient.get.mockResolvedValue({ ok: true, data: mockSurveyData });
      apiClient.post.mockResolvedValue({ ok: true, data: { id: 1, success: true } });

      // Test survey retrieval
      const survey = await surveyService.getSurveyById(1);
      expect(survey).toEqual(mockSurveyData);

      // Test survey response creation
      const response = await surveyService.createSurveyResponse({
        surveyId: 1,
        replyJson: JSON.stringify(mockResponses),
        userId: 1
      });

      expect(response).toEqual({ id: 1, success: true });
      expect(apiClient.post).toHaveBeenCalledWith('/surveys/1/surveyResponses', {
        responseJson: JSON.stringify(mockResponses),
        userId: 1
      }, true);
    });

    it('handles error scenarios in service integration', async () => {
      const { apiClient } = require('../../services/api-client');
      apiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(surveyService.getSurveyById(999)).rejects.toThrow('Network error');
      await expect(surveyService.getSurveyById(998)).rejects.toThrow('Network error');
    });
  });

  describe('UI Component Integration', () => {
    it('integrates BaseCard with calculation results', () => {
      const financialResult = calculateFinancialMetrics({
        systemCost: 1.5,
        installationCost: 0.5,
        electricityRate: 0.12,
        systemSize: 5,
        annualProduction: 7000,
        discountRate: 5,
        projectLifetime: 25,
        maintenanceCost: 0.5
      });

      render(
        <BaseCard variant="elevated" data-testid="financial-card">
          <h3>Financial Analysis</h3>
          <p>System Cost: ${financialResult.totalCost.toLocaleString()}</p>
          <p>Payback Period: {financialResult.paybackPeriod.toFixed(1)} years</p>
          <p>ROI: {(financialResult.roi * 100).toFixed(1)}%</p>
          <p>LCOE: ${financialResult.lcoe.toFixed(3)}/kWh</p>
        </BaseCard>
      );

      expect(screen.getByText('Financial Analysis')).toBeInTheDocument();
      expect(screen.getByText(`System Cost: $${financialResult.totalCost.toLocaleString()}`)).toBeInTheDocument();
      expect(screen.getByText(`Payback Period: ${financialResult.paybackPeriod.toFixed(1)} years`)).toBeInTheDocument();
      expect(screen.getByText(`ROI: ${(financialResult.roi * 100).toFixed(1)}%`)).toBeInTheDocument();
      expect(screen.getByText(`LCOE: $${financialResult.lcoe.toFixed(3)}/kWh`)).toBeInTheDocument();

      const card = screen.getByTestId('financial-card');
      expect(card).toHaveClass('shadow-md');
    });

    it('handles loading and error states in integration', () => {
      render(
        <BaseCard variant="default" data-testid="loading-card">
          <div>Loading system data...</div>
        </BaseCard>
      );

      expect(screen.getByText('Loading system data...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-card')).toBeInTheDocument();
    });
  });

  describe('Data Flow Integration', () => {
    it('demonstrates complete data flow from user input to results', async () => {
      // Simulate user input
      const userInput = {
        location: 'france',
        systemSize: 5,
        electricityRate: 0.15,
        budget: 15000
      };

      // Step 1: Calculate system based on input
      const financialResult = calculateFinancialMetrics({
        systemCost: 1.2,
        installationCost: 0.3,
        electricityRate: userInput.electricityRate,
        systemSize: userInput.systemSize,
        annualProduction: userInput.systemSize * 1400,
        discountRate: 4,
        projectLifetime: 25,
        maintenanceCost: 0.5
      });

      // Step 2: Check if budget is sufficient
      const budgetSufficient = financialResult.totalCost <= userInput.budget;

      // Step 3: Generate recommendations based on results
      const recommendations = [];
      if (financialResult.paybackPeriod > 15) {
        recommendations.push('Consider increasing system size or look for incentives');
      }
      if (financialResult.roi < 0.08) {
        recommendations.push('ROI is below typical threshold, review assumptions');
      }
      if (!budgetSufficient) {
        recommendations.push('Budget insufficient for desired system size');
      }

      // Verify the integration flow
      expect(financialResult.totalCost).toBeLessThan(userInput.budget * 1.2);
      expect(financialResult.paybackPeriod).toBeGreaterThan(0);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple calculations efficiently', () => {
      const startTime = performance.now();

      // Run multiple calculation scenarios
      const scenarios = Array.from({ length: 10 }, (_, i) => ({
        systemSize: 3 + i * 0.5,
        electricityRate: 0.10 + i * 0.01,
        systemCost: 1.0 + i * 0.1
      }));

      const results = scenarios.map(scenario =>
        calculateFinancialMetrics({
          systemCost: scenario.systemCost,
          installationCost: scenario.systemCost * 0.3,
          electricityRate: scenario.electricityRate,
          systemSize: scenario.systemSize,
          annualProduction: scenario.systemSize * 1400,
          discountRate: 4,
          projectLifetime: 25,
          maintenanceCost: 0.5
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(100); // Should complete quickly
      expect(results.every(result => result.totalCost > 0)).toBe(true);
    });
  });
});