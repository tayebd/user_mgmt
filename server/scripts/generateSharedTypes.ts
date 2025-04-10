import * as fs from 'node:fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the shared types path
const SHARED_TYPES_PATH = join(__dirname, '../shared/types');
const SHARED_TYPES_FILE = join(SHARED_TYPES_PATH, 'index.ts');

// Ensure the shared types directory exists
const ensureDir = async () => {
  await fs.mkdir(SHARED_TYPES_PATH, { recursive: true });
};

// Define Zod schemas for PV-related types
const pvPanelSchema = z.object({
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
  price: z.number().optional(),
});

const inverterSchema = z.object({
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
  price: z.number().optional(),
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
  albedo: z.number().optional(),
  losses: z.number(),
  racking: z.string(),
  bifacial: z.boolean().optional(),
});

const wireSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  Iz: z.number(),  // Current rating in A
  section: z.number(),  // section area in mm2
  acFlag: z.boolean().optional(),
  length: z.number(),
  price: z.number().optional(),
});

const loadSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  power: z.number(),
  voltage: z.number(),
  hours: z.number(),
  quantity: z.number(),
});

const protectionDeviceSchema = z.object({
  id: z.number().optional(),
  maker: z.string(),
  refType: z.string(),
  circuitType: z.string(),
  type: z.string(),
  ratedCurrent: z.number().optional(),
  ratedVoltage: z.number().optional(),
  protectionLevel: z.string().optional(),
  nominalDischarge: z.string().optional(),
  shortCircuitCurrent: z.number().optional(),
});

const mountingHardwareSchema = z.object({
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
  price: z.number().optional(),
});

const pvProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  panels: z.array(pvPanelSchema),
  arrays: z.array(pvArraySchema.omit({ id: true })),
  inverters: z.array(inverterSchema.omit({ id: true })),
  numberInverters: z.number().optional(),
  numberPanels: z.number().optional(),
  batteryBanks: z.array(batteryBankSchema.omit({ id: true })).optional(),
  chargeControllers: z.array(chargeControllerSchema.omit({ id: true })).optional(),
  loads: z.array(loadSchema.omit({ id: true })).optional(),
  protectionDevices: z.array(protectionDeviceSchema.omit({ id: true })).optional(),
  wires: z.array(wireSchema.omit({ id: true })).optional(),
  mountingHardware: z.array(mountingHardwareSchema.omit({ id: true })).optional(),
  status: z.string(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
    elevation: z.number().optional(),
});

// Generate TypeScript types from Zod schemas
const generateTypeFromSchema = (schema: z.ZodObject<any>, typeName: string): string => {
  const generateZodType = (value: z.ZodTypeAny): string => {
    if (value._def.typeName === 'ZodOptional') {
      return `${generateZodType(value._def.innerType)}.optional()`;
    }
    if (value._def.typeName === 'ZodArray') {
      return `z.array(${generateZodType(value._def.type)})`;
    }
    if (value._def.typeName === 'ZodObject') {
      const innerSchema = Object.entries((value as z.ZodObject<any>).shape).reduce<Record<string, string>>((acc, [key, val]) => {
        acc[key] = generateZodType(val as z.ZodTypeAny);
        return acc;
      }, {});
      return `z.object({\n${Object.entries(innerSchema)
        .map(([key, val]) => `    ${key}: ${val}`)
        .join(',\n')}\n  })`;
    }
    return `z.${value._def.typeName.replace('Zod', '').toLowerCase()}()`;
  };

  const schemaObj = Object.entries(schema.shape).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = generateZodType(value as z.ZodTypeAny);
    return acc;
  }, {});

  const schemaStr = `z.object({\n${Object.entries(schemaObj)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join(',\n')}\n})`;

  return `export type ${typeName} = z.infer<typeof ${typeName}Schema>;

export const ${typeName}Schema = ${schemaStr};\n`;
};

// Generate the types file content
const generateTypesFileContent = () => {
  const types = [
    generateTypeFromSchema(pvPanelSchema, 'PVPanel'),
    generateTypeFromSchema(inverterSchema, 'Inverter'),
    generateTypeFromSchema(batteryBankSchema, 'BatteryBank'),
    generateTypeFromSchema(chargeControllerSchema, 'ChargeController'),
    generateTypeFromSchema(pvArraySchema, 'PVArray'),
    generateTypeFromSchema(loadSchema, 'Load'),
    generateTypeFromSchema(pvProjectSchema, 'PVProject'),
    generateTypeFromSchema(protectionDeviceSchema, 'ProtectionDevice'),
    generateTypeFromSchema(wireSchema, 'Wire'),
    generateTypeFromSchema(mountingHardwareSchema, 'MountingHardware'),
  ];

  return `// This file is auto-generated. Do not edit it manually.
import { z } from 'zod';

${types.join('\n')};
`;
};

// Write the types to the shared directory
const writeTypesToFile = async () => {
  const typesContent = generateTypesFileContent();
  await fs.writeFile(SHARED_TYPES_FILE, typesContent);
  console.log(`Types have been written to ${SHARED_TYPES_FILE}`);
};

// Main function to run the script
const main = async () => {
  try {
    await ensureDir();
    await writeTypesToFile();
    console.log('Successfully generated shared types!');
  } catch (error) {
    console.error('Error generating shared types:', error);
    process.exit(1);
  }
};

// Run the script
main();

// Generate the types file content
const typesContent = `// This file is auto-generated. Do not edit manually.
import { z } from 'zod';

// Zod Schemas
export const pvPanelSchema = ${pvPanelSchema.toString()};
export const inverterSchema = ${inverterSchema.toString()};
export const batteryBankSchema = ${batteryBankSchema.toString()};
export const chargeControllerSchema = ${chargeControllerSchema.toString()};
export const pvArraySchema = ${pvArraySchema.toString()};
export const loadSchema = ${loadSchema.toString()};
export const wireSchema = ${wireSchema.toString()};
export const protectionDeviceSchema = ${protectionDeviceSchema.toString()};
export const mountingHardwareSchema = ${mountingHardwareSchema.toString()};
export const pvProjectSchema = ${pvProjectSchema.toString()};

// TypeScript Types
export type PVPanel = z.infer<typeof pvPanelSchema>;
export type Inverter = z.infer<typeof inverterSchema>;
export type BatteryBank = z.infer<typeof batteryBankSchema>;
export type ChargeController = z.infer<typeof chargeControllerSchema>;
export type PVArray = z.infer<typeof pvArraySchema>;
export type Site = z.infer<typeof siteSchema>;
export type Load = z.infer<typeof loadSchema>;
export type Wire = z.infer<typeof wireSchema>;
export type ProtectionDevice = z.infer<typeof protectionDeviceSchema>;
export type MountingHardware = z.infer<typeof mountingHardwareSchema>;
export type PVProject = z.infer<typeof pvProjectSchema>;
`;

// Write the types file
fs.writeFile(SHARED_TYPES_FILE, typesContent);

console.log('Generated shared types at:', SHARED_TYPES_FILE);
