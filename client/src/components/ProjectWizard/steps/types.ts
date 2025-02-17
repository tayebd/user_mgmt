import { UseFormReturn } from 'react-hook-form';
import { ProjectData } from '@/types/project';

export interface StepProps {
  form: UseFormReturn<ProjectData>;
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
} 