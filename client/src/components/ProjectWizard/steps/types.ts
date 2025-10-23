import { UseFormReturn } from 'react-hook-form';
import type { PVProject, PVPanel, Inverter } from '@/shared/types';

interface SimulationResults {
  success: boolean;
  message?: string;
  service_percentage?: number;
  overview?: {
    text: string;
  };
  monthly_performance?: {
    monthly_averages: Array<Record<string, unknown>>;
    best_day: Array<Record<string, unknown>>;
    worst_day: Array<Record<string, unknown>>;
  };
  power_flow?: {
    data: Array<Record<string, unknown>>;
  };
}

export interface StepProps {
  form: UseFormReturn<PVProject>;
  pvProject: PVProject;
  setPVProject?: React.Dispatch<React.SetStateAction<PVProject>>;
  simulationResults?: SimulationResults | null;
  isSimulating?: boolean;
}
