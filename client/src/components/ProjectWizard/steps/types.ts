import { UseFormReturn } from 'react-hook-form';
import { PVPanel, Inverter, SolarProject } from '@/types';

export interface StepProps {
  form: UseFormReturn<SolarProject>;
  projectData: SolarProject;
  setSolarProject: React.Dispatch<React.SetStateAction<SolarProject>>;
  pvPanels?: PVPanel[];
  inverters?: Inverter[];
}