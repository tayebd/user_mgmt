// This file is auto-generated. Do not edit it manually.
import { z } from 'zod';

export type PVPanel = z.infer<typeof PVPanelSchema>;

export const PVPanelSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  model: z.string(),
  description: z.string().optional(),
  power: z.number(),
  shortCircuitCurrent: z.number(),
  openCircuitVoltage: z.number(),
  maxSeriesFuseRating: z.number().optional(),
  currentAtPmax: z.number(),
  voltageAtPmax: z.number(),
  tempCoeffPmax: z.number(),
  tempCoeffIsc: z.number(),
  tempCoeffVoc: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  weight: z.number(),
  efficiency: z.number(),
  performanceWarranty: z.string(),
  productWarranty: z.string(),
  price: z.number().optional()
});

export type Inverter = z.infer<typeof InverterSchema>;

export const InverterSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  model: z.string(),
  description: z.string().optional(),
  phaseType: z.string(),
  maxOutputPower: z.number(),
  nominalOutputPower: z.number(),
  efficiency: z.number(),
  minInputVoltage: z.number(),
  maxInputVoltage: z.number(),
  maxInputCurrent: z.number(),
  minInputCurrent: z.number(),
  maxOutputCurrent: z.number(),
  maxShortCircuitCurrent: z.number(),
  outputVoltage: z.number(),
  maxStringVoltage: z.number(),
  maxStringCurrent: z.number(),
  mpptChannels: z.number(),
  productWarranty: z.string(),
  price: z.number().optional()
});

export type BatteryBank = z.infer<typeof BatteryBankSchema>;

export const BatteryBankSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  model: z.string(),
  description: z.string().optional(),
  capacity: z.number(),
  voltage: z.number(),
  chemistry: z.string(),
  cycleLife: z.number(),
  dod: z.number(),
  price: z.number().optional()
});

export type ChargeController = z.infer<typeof ChargeControllerSchema>;

export const ChargeControllerSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  model: z.string(),
  description: z.string().optional(),
  maxInputVoltage: z.number(),
  maxOutputCurrent: z.number(),
  maxPvInputPower: z.number(),
  price: z.number().optional()
});

export type PVArray = z.infer<typeof PVArraySchema>;

export const PVArraySchema = z.object({
  id: z.number().optional(),
  panelId: z.number(),
  quantity: z.number(),
  tilt: z.number(),
  azimuth: z.number(),
  albedo: z.number().optional(),
  losses: z.number(),
  racking: z.string(),
  bifacial: z.boolean().optional()
});

export type Load = z.infer<typeof LoadSchema>;

export const LoadSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  power: z.number(),
  voltage: z.number(),
  hours: z.number(),
  quantity: z.number()
});

export type PVProject = z.infer<typeof PVProjectSchema>;

export const PVProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  panels: z.array(z.object({
    id: z.number().optional(),
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    power: z.number(),
    shortCircuitCurrent: z.number(),
    openCircuitVoltage: z.number(),
    maxSeriesFuseRating: z.number().optional(),
    currentAtPmax: z.number(),
    voltageAtPmax: z.number(),
    tempCoeffPmax: z.number(),
    tempCoeffIsc: z.number(),
    tempCoeffVoc: z.number(),
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
    efficiency: z.number(),
    performanceWarranty: z.string(),
    productWarranty: z.string(),
    price: z.number().optional()
  })),
  arrays: z.array(z.object({
    panelId: z.number(),
    quantity: z.number(),
    tilt: z.number(),
    azimuth: z.number(),
    albedo: z.number().optional(),
    losses: z.number(),
    racking: z.string(),
    bifacial: z.boolean().optional()
  })),
  inverters: z.array(z.object({
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    phaseType: z.string(),
    maxOutputPower: z.number(),
    nominalOutputPower: z.number(),
    efficiency: z.number(),
    minInputVoltage: z.number(),
    maxInputVoltage: z.number(),
    maxInputCurrent: z.number(),
    minInputCurrent: z.number(),
    maxOutputCurrent: z.number(),
    maxShortCircuitCurrent: z.number(),
    outputVoltage: z.number(),
    maxStringVoltage: z.number(),
    maxStringCurrent: z.number(),
    mpptChannels: z.number(),
    productWarranty: z.string(),
    price: z.number().optional()
  })),
  numberInverters: z.number().optional(),
  numberPanels: z.number().optional(),
  batteryBanks: z.array(z.object({
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    capacity: z.number(),
    voltage: z.number(),
    chemistry: z.string(),
    cycleLife: z.number(),
    dod: z.number(),
    price: z.number().optional()
  })).optional(),
  chargeControllers: z.array(z.object({
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    maxInputVoltage: z.number(),
    maxOutputCurrent: z.number(),
    maxPvInputPower: z.number(),
    price: z.number().optional()
  })).optional(),
  loads: z.array(z.object({
    name: z.string(),
    power: z.number(),
    voltage: z.number(),
    hours: z.number(),
    quantity: z.number()
  })).optional(),
  protectionDevices: z.array(z.object({
    maker: z.string(),
    refType: z.string(),
    circuitType: z.string(),
    type: z.string(),
    ratedCurrent: z.number().optional(),
    ratedVoltage: z.number().optional(),
    protectionLevel: z.string().optional(),
    nominalDischarge: z.string().optional(),
    shortCircuitCurrent: z.number().optional()
  })).optional(),
  wires: z.array(z.object({
    maker: z.string(),
    type: z.string().optional(),
    description: z.string().optional(),
    Iz: z.number(),
    section: z.number(),
    acFlag: z.boolean().optional(),
    length: z.number(),
    price: z.number().optional()
  })).optional(),
  mountingHardware: z.array(z.object({
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    type: z.string(),
    material: z.string(),
    maxLoad: z.number(),
    maxWindSpeed: z.number(),
    maxSnowLoad: z.number(),
    warranty: z.string(),
    price: z.number().optional()
  })).optional(),
  status: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  elevation: z.number().optional()
});

export type ProtectionDevice = z.infer<typeof ProtectionDeviceSchema>;

export const ProtectionDeviceSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  refType: z.string(),
  circuitType: z.string(),
  type: z.string(),
  ratedCurrent: z.number().optional(),
  ratedVoltage: z.number().optional(),
  protectionLevel: z.string().optional(),
  nominalDischarge: z.string().optional(),
  shortCircuitCurrent: z.number().optional()
});

export type Wire = z.infer<typeof WireSchema>;

export const WireSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  Iz: z.number(),
  section: z.number(),
  acFlag: z.boolean().optional(),
  length: z.number(),
  price: z.number().optional()
});

export type MountingHardware = z.infer<typeof MountingHardwareSchema>;

export const MountingHardwareSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  model: z.string(),
  description: z.string().optional(),
  type: z.string(),
  material: z.string(),
  maxLoad: z.number(),
  maxWindSpeed: z.number(),
  maxSnowLoad: z.number(),
  warranty: z.string(),
  price: z.number().optional()
});