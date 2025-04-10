import { UseFormReturn } from 'react-hook-form';
import type { PVProject, PVPanel, Inverter } from '@/shared/types';

export interface StepProps {
  form: UseFormReturn<PVProject>;
  pvProject: PVProject;
  setPVProject?: React.Dispatch<React.SetStateAction<PVProject>>;
}
