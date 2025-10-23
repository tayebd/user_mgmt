/**
 * Equipment API Service
 * Mock API functions for equipment data
 * Extracted from initialData.ts
 */

import { PVPanel, Inverter, MountingHardware, ProtectionDevice, Wire, ChargeController } from '@/shared/types';
import {
  MOCK_PV_PANELS,
  MOCK_INVERTERS,
  MOCK_MOUNTING_HARDWARE,
  MOCK_PROTECTION_DEVICES,
  MOCK_WIRES,
  MOCK_CHARGE_CONTROLLERS
} from './equipment-mocks';

/**
 * Simulate API delay
 */
const simulateApiDelay = (delay = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, delay));

/**
 * Fetch PV panels from API
 */
export async function getPVPanels(): Promise<PVPanel[]> {
  await simulateApiDelay();
  return MOCK_PV_PANELS;
}

/**
 * Fetch inverters from API
 */
export async function getInverters(): Promise<Inverter[]> {
  await simulateApiDelay();
  return MOCK_INVERTERS;
}

/**
 * Fetch mounting hardware from API
 */
export async function getMountingHardware(): Promise<MountingHardware[]> {
  await simulateApiDelay();
  return MOCK_MOUNTING_HARDWARE;
}

/**
 * Fetch protection devices from API
 */
export async function getProtectionDevices(): Promise<ProtectionDevice[]> {
  await simulateApiDelay();
  return MOCK_PROTECTION_DEVICES;
}

/**
 * Fetch wires from API
 */
export async function getWires(): Promise<Wire[]> {
  await simulateApiDelay();
  return MOCK_WIRES;
}

/**
 * Fetch charge controllers from API
 */
export async function getChargeControllers(): Promise<ChargeController[]> {
  await simulateApiDelay();
  return MOCK_CHARGE_CONTROLLERS;
}

/**
 * Get equipment by ID
 */
export async function getPVPanelById(id: number): Promise<PVPanel | null> {
  await simulateApiDelay(200);
  return MOCK_PV_PANELS.find(panel => panel.id === id) || null;
}

export async function getInverterById(id: number): Promise<Inverter | null> {
  await simulateApiDelay(200);
  return MOCK_INVERTERS.find(inverter => inverter.id === id) || null;
}

/**
 * Search equipment by criteria
 */
export async function searchPVPanels(criteria: {
  minPower?: number;
  maxPower?: number;
  maker?: string;
}): Promise<PVPanel[]> {
  await simulateApiDelay(300);

  return MOCK_PV_PANELS.filter(panel => {
    if (criteria.minPower && panel.power < criteria.minPower) return false;
    if (criteria.maxPower && panel.power > criteria.maxPower) return false;
    if (criteria.maker && !panel.maker.toLowerCase().includes(criteria.maker.toLowerCase())) return false;
    return true;
  });
}

export async function searchInverters(criteria: {
  minPower?: number;
  maxPower?: number;
  phaseType?: string;
}): Promise<Inverter[]> {
  await simulateApiDelay(300);

  return MOCK_INVERTERS.filter(inverter => {
    if (criteria.minPower && inverter.maxOutputPower < criteria.minPower) return false;
    if (criteria.maxPower && inverter.maxOutputPower > criteria.maxPower) return false;
    if (criteria.phaseType && inverter.phaseType !== criteria.phaseType) return false;
    return true;
  });
}