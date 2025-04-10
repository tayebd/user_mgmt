const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
// Initialize Prisma Client
const prisma = new PrismaClient();
// Define the shared types path
const SHARED_TYPES_PATH = path.join(__dirname, '../../shared/types');
const SHARED_TYPES_FILE = path.join(SHARED_TYPES_PATH, 'index.ts');
// Ensure the shared types directory exists
fs.mkdirSync(SHARED_TYPES_PATH, { recursive: true });
// Define Zod schemas for PV-related types
const pvPanelSchema = z.object({
    id: z.number().optional(),
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    power: z.number(),
    shortCircuitCurrent: z.number(),
    openCircuitVoltage: z.number(),
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
    price: z.number().optional(),
});
const inverterSchema = z.object({
    id: z.number().optional(),
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    phaseType: z.string(),
    outputVoltage: z.number(),
    maxOutputCurrent: z.number(),
    maxOutputPower: z.number(),
    efficiency: z.number(),
    minInputVoltage: z.number(),
    maxInputVoltage: z.number(),
    warranty: z.number(),
    price: z.number().optional(),
    phases: z.number(),
});
const batteryBankSchema = z.object({
    id: z.number().optional(),
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    capacity: z.number(),
    voltage: z.number(),
    chemistry: z.string(),
    cycleLife: z.number(),
    dod: z.number(),
    price: z.number().optional(),
});
const chargeControllerSchema = z.object({
    id: z.number().optional(),
    maker: z.string(),
    model: z.string(),
    description: z.string().optional(),
    maxInputVoltage: z.number(),
    maxOutputCurrent: z.number(),
    maxPvInputPower: z.number(),
    price: z.number().optional(),
});
const pvArraySchema = z.object({
    id: z.number().optional(),
    panelId: z.number(),
    quantity: z.number(),
    tilt: z.number(),
    azimuth: z.number(),
    losses: z.number(),
    racking: z.string(),
    bifacial: z.boolean().optional(),
});
const siteSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
    elevation: z.number().optional(),
    albedo: z.number().optional(),
});
const loadSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    power: z.number(),
    voltage: z.number(),
    hours: z.number(),
    quantity: z.number(),
});
const pvProjectSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    siteId: z.number(),
    arrays: z.array(pvArraySchema),
    inverters: z.array(inverterSchema),
    batteryBanks: z.array(batteryBankSchema).optional(),
    chargeControllers: z.array(chargeControllerSchema).optional(),
    loads: z.array(loadSchema).optional(),
    status: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});
// Generate the types file content
const typesContent = `// This file is auto-generated. Do not edit manually.
import { z } from 'zod';

// Zod Schemas
export const pvPanelSchema = ${pvPanelSchema.toString()};
export const inverterSchema = ${inverterSchema.toString()};
export const batteryBankSchema = ${batteryBankSchema.toString()};
export const chargeControllerSchema = ${chargeControllerSchema.toString()};
export const pvArraySchema = ${pvArraySchema.toString()};
export const siteSchema = ${siteSchema.toString()};
export const loadSchema = ${loadSchema.toString()};
export const pvProjectSchema = ${pvProjectSchema.toString()};

// TypeScript Types
export type PVPanel = z.infer<typeof pvPanelSchema>;
export type Inverter = z.infer<typeof inverterSchema>;
export type BatteryBank = z.infer<typeof batteryBankSchema>;
export type ChargeController = z.infer<typeof chargeControllerSchema>;
export type PVArray = z.infer<typeof pvArraySchema>;
export type Site = z.infer<typeof siteSchema>;
export type Load = z.infer<typeof loadSchema>;
export type PVProject = z.infer<typeof pvProjectSchema>;
`;
// Write the types file
fs.writeFileSync(SHARED_TYPES_FILE, typesContent);
console.log('Generated shared types at:', SHARED_TYPES_FILE);
