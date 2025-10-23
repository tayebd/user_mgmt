import { useEffect, useState, useCallback } from 'react';
import type { PVProject, PVPanel, Inverter, PVArray } from '@/shared/types';

interface ArrayCalculatorProps {
  project: PVProject,
  panel: PVPanel;
  inverter: Inverter;
  array: PVArray;
}

interface CalculationResults {
  betaFactor: number;
  alphaFactor: number;
  vocAtLowTemp: number;
  maxPanelsInSeries: number;
}

export function ArrayCalculator({ project, panel, inverter, array }: ArrayCalculatorProps) {
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);

  const calculateArrayConfiguration = useCallback(() => {
    // Temperature coefficients
    const betaFactor = panel.tempCoeffVoc / 100.0; // %/°C
    const alphaFactor = panel.tempCoeffIsc / 100.0; // %/°C

    // Calculate Voc at -10°C
    const vocAtLowTemp = panel.openCircuitVoltage * (1 + betaFactor * (-10 - 25));

    // Calculate maximum number of panels in series
    const maxPanelsInSeries = Math.floor(inverter.maxInputVoltage / vocAtLowTemp);

    // Store calculation results
    setCalculationResults({
      betaFactor,
      alphaFactor,
      vocAtLowTemp,
      maxPanelsInSeries
    });
  }, [panel, inverter]);

  useEffect(() => {
    calculateArrayConfiguration();
  }, [calculateArrayConfiguration]);

  if (!calculationResults) {
    return <div>Calculating...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Array Configuration Results</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Temperature Coefficient (Voltage):</span>
          <span className="ml-2">{calculationResults.betaFactor.toFixed(4)} %/°C</span>
        </div>
        <div>
          <span className="font-medium">Temperature Coefficient (Current):</span>
          <span className="ml-2">{calculationResults.alphaFactor.toFixed(4)} %/°C</span>
        </div>
        <div>
          <span className="font-medium">Voc at -10°C:</span>
          <span className="ml-2">{calculationResults.vocAtLowTemp.toFixed(2)} V</span>
        </div>
        <div>
          <span className="font-medium">Max Panels in Series:</span>
          <span className="ml-2">{calculationResults.maxPanelsInSeries}</span>
        </div>
      </div>
    </div>
  );
}
