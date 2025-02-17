import { fetchInverters, fetchPVPanels } from '../state/api';

import { PVPanel, Inverter } from '@/types';

const MOCK_PV_PANELS: PVPanel[] = [
  {
    id: 'panel1',
    manufacturer: 'SunPower',
    modelNumber: 'SPR-X22-360',
    power: 360,
    efficiency: 22.7,
    shortSide: 1046,
    longSide: 1690,
    weight: 18.6,
    warranty: 25,
    price: 450
  },
  {
    id: 'panel2',
    manufacturer: 'LG',
    modelNumber: 'LG400N2W-A5',
    power: 400,
    efficiency: 21.3,
    longSide: 2000,
    shortSide: 1000,
    weight: 19.3,
    warranty: 25,
    price: 480
  },
  // Add more panels...
];

const MOCK_INVERTERS: Inverter[] = [
  {
    id: 'inv1',
    manufacturer: 'SMA',
    modelNumber: 'Sunny Boy 5.0',
    power: 5000,
    efficiency: 97.6,
    inputVoltage: {
      min: 175,
      max: 500,
    },
    outputVoltage: 230,
    phases: 'Single Phase',
    warranty: 10,
    price: 1200
  },
  {
    id: 'inv2',
    manufacturer: 'Fronius',
    modelNumber: 'Primo 6.0-1',
    power: 6000,
    efficiency: 98.1,
    inputVoltage: {
      min: 80,
      max: 600,
    },
    outputVoltage: 230,
    phases: 'Single Phase',
    warranty: 10,
    price: 1400
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
