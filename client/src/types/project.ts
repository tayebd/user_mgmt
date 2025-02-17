import { z } from 'zod';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Equipment {
  id: string;
  manufacturer: string;
  modelNumber: string;
  quantity: number;
}

export interface ProjectData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  dcSystemSize: number;
  arrayType: 'Ground' | 'Roof Mount' | 'Tracking';
  systemLosses: number;
  tilt: number;
  azimuth: number;
  bifacial: boolean;
  // PV Panel Selection
  selectedPanelId: string;
  pvPanelQuantity: number;
  // Inverter Selection
  selectedInverterId: string;
  inverterQuantity: number;
  // Mounting
  mountingType: 'Flat Roof' | 'Pitched Roof' | 'Ground Mount';
  roofMaterial?: string;
  // Derived Equipment (read-only in UI)
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
}

export const projectValidationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  dcSystemSize: z.number().min(0),
  arrayType: z.enum(['Ground', 'Roof Mount', 'Tracking']),
  systemLosses: z.number().min(0).max(100),
  tilt: z.number().min(0).max(90),
  azimuth: z.number().min(0).max(360),
  bifacial: z.boolean(),
  selectedPanelId: z.string().min(1, 'PV Panel selection is required'),
  pvPanelQuantity: z.number().min(1, 'At least one panel is required'),
  selectedInverterId: z.string().min(1, 'Inverter selection is required'),
  inverterQuantity: z.number().min(1, 'At least one inverter is required'),
  mountingType: z.enum(['Flat Roof', 'Pitched Roof', 'Ground Mount']),
  roofMaterial: z.string().optional(),
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
