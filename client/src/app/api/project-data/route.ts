import { NextResponse } from 'next/server';
import type { PVPanel, Inverter, PVArray } from '@/shared/types';

// This is a mock of the project data - replace with actual data fetching
const mockProjectData: {
  panel: PVPanel;
  inverter: Inverter;
  array: PVArray;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
} = {
  panel: {
    maker: 'SunPower',
    model: 'SPR-X22-360',
    power: 360,
    shortCircuitCurrent: 6.48,
    openCircuitVoltage: 69.5,
    tempCoeffPmax: -0.29,
    tempCoeffIsc: 0.05,
    tempCoeffVoc: -0.25,
    length: 1690,
    width: 1046,
    height: 40,
    weight: 18.6,
    efficiency: 22.1,
    performanceWarranty: '25 years',
    productWarranty: '25 years',
    currentAtPmax: 0,
    voltageAtPmax: 0
  },
  inverter: {
    maker: 'SMA',
    model: 'Sunny Boy 5.0',
    phaseType: 'single',
    outputVoltage: 230,
    maxOutputCurrent: 22,
    maxOutputPower: 5000,
    efficiency: 97.6,
    minInputVoltage: 125,
    maxInputVoltage: 600,
    nominalOutputPower: 0,
    maxInputCurrent: 0,
    minInputCurrent: 0,
    maxShortCircuitCurrent: 0,
    maxStringVoltage: 0,
    maxStringCurrent: 0,
    mpptChannels: 0,
    productWarranty: ''
  },
  array: {
    panelId: 1,
    quantity: 14,
    tilt: 30,
    azimuth: 180,
    losses: 14,
    racking: 'fixed'
  },
  name: 'Sample Site',
  address: '123 Solar Street',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
  elevation: 35
};

export async function GET() {
  try {
    // In a real implementation, you would fetch this data from your backend
    return NextResponse.json(mockProjectData);
  } catch (error) {
    console.error('Error fetching project data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
      { status: 500 }
    );
  }
}
