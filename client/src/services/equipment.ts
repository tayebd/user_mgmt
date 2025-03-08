import { fetchInverters, fetchPVPanels } from '../state/api';

import { PVPanel, Inverter } from '@/types';

const MOCK_PV_PANELS: PVPanel[] = [
  {
    id: 1,
    manufacturer: 'LG',
    modelNumber: 'LG370Q1C-A5',
    description: 'High-efficiency solar panel',
    power: 370,
    efficiency: 21.1,
    shortCircuitCurrent: 9.8,
    openCircuitVoltage: 46.1,
    tempCoeffPmax: -0.34,
    tempCoeffIsc: 0.05,
    tempCoeffVoc: -0.29,
    longSide: 1690,
    shortSide: 1046,
    weight: 18.6,
    productWarranty: '25',
    price: 450,
    length: 1690,
    width: 1046,
    height: 40,
    performanceWarranty: '25'
  },
  {
    id: 2,
    manufacturer: 'Canadian Solar',
    modelNumber: 'CS3K-395MS',
    description: 'High-performance solar panel',
    power: 395,
    efficiency: 20.4,
    shortCircuitCurrent: 10.2,
    openCircuitVoltage: 45.5,
    tempCoeffPmax: -0.35,
    tempCoeffIsc: 0.06,
    tempCoeffVoc: -0.30,
    longSide: 2000,
    shortSide: 1000,
    weight: 19.3,
    productWarranty: '25',
    price: 480,
    length: 2000,
    width: 1000,
    height: 40,
    performanceWarranty: '25'
  },
  // Add more panels...
];

const MOCK_INVERTERS: Inverter[] = [
  {
    id: 1,
    manufacturer: 'SMA',
    modelNumber: 'Sunny Boy 3.0',
    description: 'High-efficiency single-phase inverter',
    phaseType: 'Single Phase',
    maxPower: 3000,
    efficiency: 97.7,
    inputVoltage: {
      min: 120,
      max: 500,
    },
    outputVoltage: 230,
    maxCurrent: 13,
    warranty: 10,
    price: 1200,
    phases: 1
  },
  {
    id: 2,
    manufacturer: 'Fronius',
    modelNumber: 'Primo 6.0-1',
    description: 'Advanced single-phase inverter',
    phaseType: 'Single Phase',
    maxPower: 6000,
    efficiency: 98.1,
    inputVoltage: {
      min: 80,
      max: 500,
    },
    outputVoltage: 230,
    maxCurrent: 26,
    warranty: 10,
    price: 1400,
    phases: 1
  },
  // Add more inverters...
];

export async function getPVPanels(): Promise<PVPanel[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PV_PANELS;
}

export async function getInverters(): Promise<Inverter[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_INVERTERS;
} 
// export async function getPVPanels() {
//   return fetchPVPanels(1, 50);
// }

// export async function getInverters() {
//   return fetchInverters(1, 50);
// }
