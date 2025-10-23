/**
 * Equipment Mock Data
 * Extracted from initialData.ts for better organization
 */

import { PVPanel, Inverter, MountingHardware, ProtectionDevice, Wire, ChargeController } from '@/shared/types';

export const MOCK_PV_PANELS: PVPanel[] = [
  {
    id: 1,
    maker: 'LG',
    model: 'LG395N1C-V5',
    power: 395,
    efficiency: 0.214,
    shortCircuitCurrent: 10.6,
    openCircuitVoltage: 48.4,
    currentAtPmax: 10.0,
    voltageAtPmax: 39.5,
    tempCoeffPmax: -0.34,
    tempCoeffIsc: 0.05,
    tempCoeffVoc: -0.26,
    length: 1700,
    width: 1016,
    height: 40,
    weight: 19.5,
    performanceWarranty: '25 years',
    productWarranty: '12 years',
    price: 280
  },
  {
    id: 2,
    maker: 'SunPower',
    model: 'X22-370',
    power: 370,
    efficiency: 0.225,
    shortCircuitCurrent: 6.14,
    openCircuitVoltage: 68.7,
    currentAtPmax: 5.65,
    voltageAtPmax: 65.5,
    tempCoeffPmax: -0.29,
    tempCoeffIsc: 0.03,
    tempCoeffVoc: -0.27,
    length: 1559,
    width: 1046,
    height: 46,
    weight: 19.0,
    performanceWarranty: '25 years',
    productWarranty: '25 years',
    price: 320
  },
  {
    id: 3,
    maker: 'Canadian Solar',
    model: 'CS3W-395MS',
    power: 395,
    efficiency: 0.198,
    shortCircuitCurrent: 10.6,
    openCircuitVoltage: 41.8,
    currentAtPmax: 10.0,
    voltageAtPmax: 39.5,
    tempCoeffPmax: -0.35,
    tempCoeffIsc: 0.05,
    tempCoeffVoc: -0.26,
    length: 1765,
    width: 1040,
    height: 35,
    weight: 20.5,
    performanceWarranty: '25 years',
    productWarranty: '12 years',
    price: 220
  }
];

export const MOCK_INVERTERS: Inverter[] = [
  {
    id: 1,
    maker: 'SMA',
    model: 'Sunny Tripower 15000TL',
    efficiency: 0.985,
    maxOutputPower: 15000,
    nominalOutputPower: 15000,
    phaseType: 'three',
    productWarranty: '10 years',
    minInputVoltage: 320,
    maxInputVoltage: 800,
    maxInputCurrent: 25,
    minInputCurrent: 0,
    maxOutputCurrent: 21.7,
    maxShortCircuitCurrent: 30,
    outputVoltage: 400,
    maxStringVoltage: 1000,
    maxStringCurrent: 15,
    mpptChannels: 3,
    price: 2500
  },
  {
    id: 2,
    maker: 'Fronius',
    model: 'Symo 10.0-3-M',
    efficiency: 0.981,
    maxOutputPower: 10000,
    nominalOutputPower: 10000,
    phaseType: 'three',
    productWarranty: '10 years',
    minInputVoltage: 200,
    maxInputVoltage: 800,
    maxInputCurrent: 20,
    minInputCurrent: 0,
    maxOutputCurrent: 14.5,
    maxShortCircuitCurrent: 25,
    outputVoltage: 400,
    maxStringVoltage: 1000,
    maxStringCurrent: 12,
    mpptChannels: 2,
    price: 1800
  },
  {
    id: 3,
    maker: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    efficiency: 0.988,
    maxOutputPower: 10000,
    nominalOutputPower: 10000,
    phaseType: 'three',
    productWarranty: '10 years',
    minInputVoltage: 200,
    maxInputVoltage: 1000,
    maxInputCurrent: 20,
    minInputCurrent: 0,
    maxOutputCurrent: 14.5,
    maxShortCircuitCurrent: 25,
    outputVoltage: 400,
    maxStringVoltage: 1500,
    maxStringCurrent: 12,
    mpptChannels: 2,
    price: 1600
  }
];

export const MOCK_MOUNTING_HARDWARE: MountingHardware[] = [
  {
    id: 1,
    maker: 'IronRidge',
    model: 'X-Rail 100',
    description: 'Aluminum rail for rooftop mounting',
    type: 'rail',
    material: 'aluminum',
    maxLoad: 75,
    maxWindSpeed: 150,
    maxSnowLoad: 50,
    warranty: '25 years',
    price: 45
  },
  {
    id: 2,
    maker: 'Unirac',
    model: 'SolarMount ULA-R',
    description: 'Universal rail for various roof types',
    type: 'rail',
    material: 'aluminum',
    maxLoad: 80,
    maxWindSpeed: 140,
    maxSnowLoad: 45,
    warranty: '20 years',
    price: 50
  }
];

export const MOCK_PROTECTION_DEVICES: ProtectionDevice[] = [
  {
    id: 1,
    maker: 'ABB',
    refType: 'S201',
    circuitType: 'AC',
    type: 'circuit-breaker',
    ratedCurrent: 16,
    ratedVoltage: 1000,
    protectionLevel: 'IP20',
    shortCircuitCurrent: 6000
  },
  {
    id: 2,
    maker: 'Schneider Electric',
    refType: 'Acti9 iC60',
    circuitType: 'DC',
    type: 'circuit-breaker',
    ratedCurrent: 20,
    ratedVoltage: 1000,
    protectionLevel: 'IP20',
    shortCircuitCurrent: 6000
  }
];

export const MOCK_WIRES: Wire[] = [
  {
    id: 1,
    maker: 'Nexans',
    type: 'solar-cable',
    description: 'DC solar cable with double insulation',
    Iz: 55,
    section: 4,
    length: 100,
    acFlag: false,
    price: 1.5
  },
  {
    id: 2,
    maker: 'Lapp',
    type: 'solar-cable',
    description: 'UV resistant solar cable',
    Iz: 70,
    section: 6,
    length: 100,
    acFlag: false,
    price: 2.0
  }
];

export const MOCK_CHARGE_CONTROLLERS: ChargeController[] = [
  {
    id: 1,
    maker: 'Victron Energy',
    model: 'SmartSolar MPPT 100/50',
    description: 'MPPT charge controller for off-grid systems',
    maxInputVoltage: 100,
    maxOutputCurrent: 50,
    maxPvInputPower: 2900,
    price: 350
  }
];