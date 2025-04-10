// export type PVPanel = {
//   id : number;
//   maker: string;
//   model: string;
//   description: string;
//   power: number;
//   shortCircuitCurrent: number;
//   openCircuitVoltage: number;
//   tempCoeffPmax: number;
//   tempCoeffIsc: number;
//   tempCoeffVoc: number;
//   shortSide: number;
//   longSide: number;
//   weight: number;
//   performanceWarranty: string;
//   productWarranty: string;
//   length: number;
//   width: number;
//   height: number;
//   efficiency: number;
//   price: number;
// };

// export type Inverter = {
//   id : number;
//   maker: string;
//   model: string;
//   description: string;
//   phaseType: string;
//   outputVoltage: number;
//   maxOutputCurrent: number;
//   maxOutputPower: number;
//   efficiency: number; // Efficiency percentage
//   inputVoltage: { min: number; max: number };
//   warranty: number;
//   price: number;
//   phases: number;
// };

// export interface Site {
//   address: string;
//   country: string;
//   latitude: number;
//   longitude: number;
//   city: string;
//   client: string;
//   elevation: number;
//   timezone: number;
//   gridVoltage: number;
//   gridFrequency: number;
// }

// export interface PVArray {
//   panelId: number;
//   quantity: number;
//   tilt: number;
//   azimuth: number;
//   losses: number;
//   racking: string;
//   bifacial?: boolean;
//   roofType?: string;
//   roofMaterial?: string;
//   shading?: number;
// }

// export interface Load {
//   name: string;
//   power: number;
//   hours: number;
//   quantity: number;
//   avgDailyConsumption?: number;
//   peakDemand?: number;
//   voltageRequired?: number;
// }

// export interface ProtectionDevice {
//   id: number;
//   type: string;
//   rating: number;
//   quantity: number;
// }

// export interface Wire {
//   type: string;
//   section: number;
//   length: number;
//   isAC: boolean;
// }

// export interface BatteryBank {
//   id: number;
//   quantity: number;
//   voltageConfig: number;
// }

// export interface PVProject {
//   id?: number;
//   name: string;
//   site: Site;
//   arrays: PVArray[];
//   loads: Load[];
//   inverters: {
//     id: number;
//     quantity: number;
//   }[];
//   protectionDevices: ProtectionDevice[];
//   wiring: Wire[];
//   batteryBank?: BatteryBank;
//   systemType: 'grid-tied' | 'off-grid' | 'hybrid';
//   dcSystemSize: number;
//   systemLosses: number;
//   numberPanels: number; // Added property
// };

export type Company = {
  id : number;
  name: string;
  address: string;
  website: string;
  iconUrl?: string;
  phone: string;
  email?: string;
  logo: string;
  established: Date;
  web_validity?: boolean;
  capabilities?: string;
  fb_handle?: string;
  residential?: boolean;
  commercial?: boolean;
  descriptions?: Description[];
  badge: string;
  rating: number;
  reviews?: number;
};

export type Description = {
  id : number;
  language: string;
  text: string;
};

export type Review = {
  id : number;
  userId: number;
  companyId: number;
  rating: number;
  comment?: string;
  user: User;
};

export type User = {
  id : number;
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  profilePictureUrl?: string;
  phone?: string;
};

export interface Survey {
  id : number;
  title: string;
  description: string;
  surveyJson: string;
  status: SurveyStatus;
  targetResponses: number;
  userId: number;
  expiresAt?: Date;
  responses?: SurveyResponse[];
}

import { SurveyStatus, ProjectStatus, TaskStatus, TaskPriority } from './enums';

export { SurveyStatus, ProjectStatus, TaskStatus, TaskPriority };
export interface CreateSurveyParams {
  title: string;
  description: string;
  active: boolean;
  userId: number;
  surveyJson: string;
  responseCount: number;
  targetResponses: number;
}

import { ProcessedMetrics } from './metrics';

export interface SurveyResponse {
  id: number;
  surveyId: number;
  responseJson: string;
  userId: number;
  companyId: number;
  processedMetrics?: ProcessedMetrics;
}

export interface Project {
  id : number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  members: User[];
}

export interface Task {
  id : number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  project: Project;
  assignedToId: number;
  assignedTo?: User;
}
