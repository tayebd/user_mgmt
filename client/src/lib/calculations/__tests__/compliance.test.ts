/**
 * Compliance Calculations Tests - Fixed
 * Tests for UTE C 15-712-1 French electrical standards compliance checking
 */

import {
  checkUTECompliance,
  calculateDocumentationRequirements
} from '../compliance';
import type { UTEComplianceInput } from '../types';

describe('Compliance Calculations', () => {
  const mockArrayConfig = {
    maxPanelsInSeries: 20,
    maxParallelStrings: 3,
    totalPanels: 60,
    optimalConfiguration: {
      seriesPerString: 20,
      parallelStrings: 3,
      totalPanels: 60
    },
    temperatureData: {
      voltageAtMinus10: 550,
      currentAt85: 12.5,
      voltageAtSTC: 450,
      currentAtSTC: 10,
      betaFactor: -0.003,
      alphaFactor: 0.0005
    }
  };

  describe('checkUTECompliance', () => {
    it('should handle basic French residential system compliance', () => {
      const input: UTEComplianceInput = {
        arrayConfiguration: mockArrayConfig,
        systemVoltage: 400,
        systemCurrent: 37.5,
        location: 'france',
        installationType: 'residential'
      };

      const result = checkUTECompliance(input);

      expect(result).toBeDefined();
      expect(result.isCompliant).toBeDefined();
      expect(result.violations).toBeDefined();
      expect(Array.isArray(result.violations)).toBe(true);
      expect(result.uteSpecificRequirements).toBeDefined();
      expect(result.uteSpecificRequirements.groundingRequired).toBe(true);
      expect(result.uteSpecificRequirements.rapidShutdownRequired).toBe(true);
    });

    it('should handle high voltage systems', () => {
      const input: UTEComplianceInput = {
        arrayConfiguration: {
          ...mockArrayConfig,
          optimalConfiguration: {
            seriesPerString: 35,
            parallelStrings: 3,
            totalPanels: 105
          }
        },
        systemVoltage: 1925, // Over 1500V limit
        systemCurrent: 37.5,
        location: 'france',
        installationType: 'residential'
      };

      const result = checkUTECompliance(input);

      expect(result.isCompliant).toBeDefined();
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should handle non-French locations', () => {
      const input: UTEComplianceInput = {
        arrayConfiguration: mockArrayConfig,
        systemVoltage: 800,
        systemCurrent: 25,
        location: 'other',
        installationType: 'commercial'
      };

      const result = checkUTECompliance(input);

      expect(result.isCompliant).toBeDefined();
      expect(result.uteSpecificRequirements.groundingRequired).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      const input: UTEComplianceInput = {
        arrayConfiguration: {
          ...mockArrayConfig,
          optimalConfiguration: {
            seriesPerString: 18,
            parallelStrings: 3,
            totalPanels: 54
          }
        },
        systemVoltage: 720,
        systemCurrent: 18,
        location: 'france',
        installationType: 'residential'
      };

      const result = checkUTECompliance(input);

      expect(result.isCompliant).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('calculateDocumentationRequirements', () => {
    it('should generate appropriate documentation for residential systems', () => {
      const result = calculateDocumentationRequirements('residential', 10);

      expect(result.required).toContain('System schematic diagrams');
      expect(result.required).toContain('Equipment specifications and data sheets');
      expect(result.required).toContain('Test results and commissioning reports');
      expect(result.required).toContain('Grid connection agreement');
      expect(result.required).toContain('Electrical inspection certificate');

      expect(result.recommended).toContain('Maintenance schedule and logbook');
      expect(result.recommended).toContain('Performance monitoring data');
      expect(result.recommended).toContain('Warranty documentation');
      expect(result.recommended).toContain('Emergency contact information');
      expect(result.recommended).toContain('System owner manual');

      expect(result.periodic).toContain('Annual visual inspection');
      expect(result.periodic).toContain('Biennial electrical testing');
      expect(result.periodic).toContain('Periodic cleaning schedule');
      expect(result.periodic).toContain('Performance review and optimization');
      expect(result.periodic).toContain('Documentation updates');
    });

    it('should generate additional documentation for industrial systems', () => {
      const result = calculateDocumentationRequirements('industrial', 100);

      expect(result.required).toContain('Occupational safety documentation');
      expect(result.required).toContain('Lockout/tagout procedures');
      expect(result.periodic).toContain('Monthly thermal imaging of connections');
    });

    it('should add arc flash study for large systems', () => {
      const smallSystem = calculateDocumentationRequirements('residential', 3);
      const largeSystem = calculateDocumentationRequirements('commercial', 150);

      expect(smallSystem.required).not.toContain('Arc flash study report');
      expect(largeSystem.required).toContain('Arc flash study report');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty configurations gracefully', () => {
      const invalidInput: UTEComplianceInput = {
        arrayConfiguration: {
          maxPanelsInSeries: 0,
          maxParallelStrings: 0,
          totalPanels: 0,
          optimalConfiguration: {
            seriesPerString: 0,
            parallelStrings: 0,
            totalPanels: 0
          },
          temperatureData: {
            voltageAtMinus10: 0,
            currentAt85: 0,
            voltageAtSTC: 0,
            currentAtSTC: 0,
            betaFactor: 0,
            alphaFactor: 0
          }
        },
        systemVoltage: 0,
        systemCurrent: 0,
        location: 'france',
        installationType: 'residential'
      };

      const result = checkUTECompliance(invalidInput);

      expect(result).toBeDefined();
      expect(result.isCompliant).toBeDefined();
    });

    it('should handle very large systems appropriately', () => {
      const largeConfig = {
        ...mockArrayConfig,
        optimalConfiguration: {
          seriesPerString: 50,
          parallelStrings: 10,
          totalPanels: 500
        }
      };

      const input: UTEComplianceInput = {
        arrayConfiguration: largeConfig,
        systemVoltage: 15000,
        systemCurrent: 125,
        location: 'france',
        installationType: 'industrial'
      };

      const result = checkUTECompliance(input);

      expect(result).toBeDefined();
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle compliance checking efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const input: UTEComplianceInput = {
          arrayConfiguration: mockArrayConfig,
          systemVoltage: 400 + (i % 10) * 50,
          systemCurrent: 25 + (i % 5) * 5,
          location: 'france',
          installationType: i % 2 === 0 ? 'residential' : 'commercial'
        };

        checkUTECompliance(input);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete 100 checks in under 100ms
    });
  });
});