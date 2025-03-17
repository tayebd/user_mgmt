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

export type PVPanel = {
  id : number;
  manufacturer: string;
  modelNumber: string;
  description: string;
  power: number;
  shortCircuitCurrent: number;
  openCircuitVoltage: number;
  tempCoeffPmax: number;
  tempCoeffIsc: number;
  tempCoeffVoc: number;
  shortSide: number;
  longSide: number;
  weight: number;
  performanceWarranty: string;
  productWarranty: string;
  length: number;
  width: number;
  height: number;
  efficiency: number;
  price: number;
};

export type Inverter = {
  id : number;
  manufacturer: string;
  modelNumber: string;
  description: string;
  phaseType: string;
  outputVoltage: number;
  maxOutputCurrent: number;
  maxOutputPower: number;
  efficiency: number; // Efficiency percentage  
  inputVoltage: { min: number; max: number };
  warranty: number;
  price: number;
  phases: number;
};

export type SolarProject = {
  id : number;
  address: string;
  coordinates: { lat: number; lng: number };
  dcSystemSize: number;
  arrayType: string;
  systemLosses: number;
  tilt: number;
  azimuth: number;
  bifacial: boolean;
  selectedPanelId: number;
  pvPanelQuantity: number;
  selectedInverterId: number;
  inverterQuantity: number;
  mountingType: string;
  roofMaterial?: string;
  roofSlope?: number;
  roofOrientation?: string;
  roofArea?: number;
  roofLoadCapacity?: number;
  groundArea?: number;
  groundSlope?: number;
  groundOrientation?: string;
  groundLoadCapacity?: number;
  trackingType?: string;
  trackingSlope?: number;
  trackingOrientation?: string;
  trackingLoadCapacity?: number;

  derivedEquipment: {
    fuses: number;
    dcSurgeProtector: number;
    dcDisconnectSwitches: number;
    acSurgeProtector: number;
    generalDisconnectSwitch: number;
    residualCurrentBreaker: number;
    generalCircuitBreaker: number;
    dcCableLength: number;
    acCableLength: number;
    earthingCableLength: number;
    mc4ConnectorPairs: number;
    splitters: number;
    cableTrayLength: number;
  };
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Equipment {
  id: number;
  manufacturer: string;
  modelNumber: string;
  quantity: number;
}

import { z } from 'zod';
export const projectValidationSchema = z.object({
  id: z.number(),
  address: z.string().min(1, 'Address is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  dcSystemSize: z.number().min(0),
  arrayType: z.string(),
  systemLosses: z.number().min(0).max(100),
  tilt: z.number().min(0).max(90),
  azimuth: z.number().min(0).max(360),
  bifacial: z.boolean(),
  selectedPanelId: z.number().min(1, 'PV Panel selection is required'),
  pvPanelQuantity: z.number().min(1, 'At least one panel is required'),
  selectedInverterId: z.number().min(1, 'Inverter selection is required'),
  inverterQuantity: z.number().min(1, 'At least one inverter is required'),
  mountingType: z.string(),
  roofMaterial: z.string().optional(),
  roofSlope: z.number().optional(),
  roofOrientation: z.string().optional(),
  roofArea: z.number().optional(),
  roofLoadCapacity: z.number().optional(),
  groundArea: z.number().optional(),
  groundSlope: z.number().optional(),
  groundOrientation: z.string().optional(),
  groundLoadCapacity: z.number().optional(),
  trackingType: z.string().optional(),
  trackingSlope: z.number().optional(),
  trackingOrientation: z.string().optional(),
  trackingLoadCapacity: z.number().optional(),
  derivedEquipment: z.object({
    fuses: z.number(),
    dcSurgeProtector: z.number(),
    dcDisconnectSwitches: z.number(),
    acSurgeProtector: z.number(),
    generalDisconnectSwitch: z.number(),
    residualCurrentBreaker: z.number(),
    generalCircuitBreaker: z.number(),
    dcCableLength: z.number(),
    acCableLength: z.number(),
    earthingCableLength: z.number(),
    mc4ConnectorPairs: z.number(),
    splitters: z.number(),
    cableTrayLength: z.number(),
  })
});


