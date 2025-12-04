import { UseFormReturn } from 'react-hook-form';
import type { PVProject, PVPanel, Inverter } from '@/shared/types';

interface SimulationResults {
  success: boolean;
  message?: string;
  service_percentage?: number;
  timestamp?: string;
  annual_energy?: number;
  capacity_factor?: number;
  peak_power?: number;
  performance_ratio?: number;
  monthly_energy?: Record<string, number>;
  daily_energy?: Record<string, number>;
  error_message?: string | null;
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
  powerOutput?: number[];
}

export interface StepProps {
  form: UseFormReturn<PVProject>;
  pvProject: PVProject;
  setPVProject?: React.Dispatch<React.SetStateAction<PVProject>>;
  simulationResults?: SimulationResults | null;
  isSimulating?: boolean;
}
