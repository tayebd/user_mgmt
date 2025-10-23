// Enhanced Mock Data with AI Attributes
// This file contains the existing mock data enriched with AI-specific attributes

import { enrichPanels, enrichInverters, enrichBatteries, validateDataQuality } from './dataEnrichment';
import { mockInverters, samplePanels, chargeControllers, devices, wireData, mountingHardware } from '@/components/ProjectWizard/calculations/mockData';
import { BatteryBank } from '@/shared/types';

// Enrich the existing mock data with AI attributes
export const enhancedPanels = enrichPanels(samplePanels);
export const enhancedInverters = enrichInverters(mockInverters);

// Create sample battery data and enrich it
const sampleBatteries: BatteryBank[] = [
  {
    id: 1,
    maker: "Tesla",
    model: "Powerwall 2",
    description: "Integrated battery system for home energy storage",
    capacity: 13.5,
    voltage: 48,
    chemistry: "Lithium-ion",
    cycleLife: 5000,
    dod: 100,
    price: 7500
  },
  {
    id: 2,
    maker: "LG Chem",
    model: "RESU 10H",
    description: "Compact home energy storage solution",
    capacity: 9.8,
    voltage: 400,
    chemistry: "Lithium-ion",
    cycleLife: 6000,
    dod: 90,
    price: 6500
  },
  {
    id: 3,
    maker: "BYD",
    model: "B-Box HVS",
    description: "High-voltage modular battery system",
    capacity: 13.8,
    voltage: 400,
    chemistry: "Lithium iron phosphate",
    cycleLife: 4000,
    dod: 80,
    price: 5800
  }
];

export const enhancedBatteries = enrichBatteries(sampleBatteries);

// Validate data quality
export const panelDataQuality = validateDataQuality(samplePanels);
export const inverterDataQuality = validateDataQuality(mockInverters);
export const batteryDataQuality = validateDataQuality(sampleBatteries);

// Export data quality summary
export const dataQualitySummary = {
  panels: panelDataQuality,
  inverters: inverterDataQuality,
  batteries: batteryDataQuality,
  overall: {
    completeness: (panelDataQuality.completeness + inverterDataQuality.completeness + batteryDataQuality.completeness) / 3,
    accuracy: (panelDataQuality.accuracy + inverterDataQuality.accuracy + batteryDataQuality.accuracy) / 3,
    consistency: (panelDataQuality.consistency + inverterDataQuality.consistency + batteryDataQuality.consistency) / 3,
    timeliness: (panelDataQuality.timeliness + inverterDataQuality.timeliness + batteryDataQuality.timeliness) / 3,
    relevance: (panelDataQuality.relevance + inverterDataQuality.relevance + batteryDataQuality.relevance) / 3,
  }
};

// Export enhanced equipment collections
export const enhancedEquipmentDatabase = {
  panels: enhancedPanels,
  inverters: enhancedInverters,
  batteries: enhancedBatteries,
  // TODO: Add enriched versions of other equipment types
  protectionDevices: devices,
  wires: wireData,
  chargeControllers: chargeControllers,
  mountingHardware: mountingHardware,
  dataQuality: dataQualitySummary
};

// Utility functions for AI equipment selection
export const getTopPanelsByEfficiency = (limit: number = 5) => {
  return enhancedPanels
    .sort((a, b) => b.aiAttributes.efficiencyRating - a.aiAttributes.efficiencyRating)
    .slice(0, limit);
};

export const getTopInvertersByEfficiency = (limit: number = 5) => {
  return enhancedInverters
    .sort((a, b) => b.aiAttributes.efficiencyRating - a.aiAttributes.efficiencyRating)
    .slice(0, limit);
};

export const getBestValuePanels = (limit: number = 5) => {
  return enhancedPanels
    .sort((a, b) => b.aiAttributes.valueRating - a.aiAttributes.valueRating)
    .slice(0, limit);
};

export const getMostReliableEquipment = (type: 'panels' | 'inverters' | 'batteries', limit: number = 3) => {
  const equipment = enhancedEquipmentDatabase[type];
  return equipment
    .sort((a, b) => b.aiAttributes.reliabilityScore - a.aiAttributes.reliabilityScore)
    .slice(0, limit);
};

export const getEquipmentByBudget = (type: 'panels' | 'inverters' | 'batteries', maxBudget: number, quantity: number = 1) => {
  const equipment = enhancedEquipmentDatabase[type];
  return equipment.filter(item => (item.price || 0) * quantity <= maxBudget);
};

export const getCompatibleEquipment = (panelId: number, inverterId: number) => {
  const panel = enhancedPanels.find(p => p.id === panelId);
  const inverter = enhancedInverters.find(i => i.id === inverterId);

  if (!panel || !inverter) return null;

  // Basic compatibility check - would be enhanced with actual electrical calculations
  const voltageCompatible = panel.openCircuitVoltage * 10 < inverter.maxInputVoltage; // Assuming 10 panels per string
  const currentCompatible = panel.shortCircuitCurrent < inverter.maxInputCurrent;
  const powerCompatible = panel.power * 20 <= inverter.maxOutputPower * 1.3; // Assuming 20 panels, 130% oversizing allowed

  return {
    voltageCompatible,
    currentCompatible,
    powerCompatible,
    overallCompatible: voltageCompatible && currentCompatible && powerCompatible,
    recommendations: voltageCompatible && currentCompatible && powerCompatible ?
      [] :
      [
        !voltageCompatible && "Consider reducing the number of panels per string",
        !currentCompatible && "Check if the inverter can handle the panel current",
        !powerCompatible && "Consider a larger inverter or fewer panels"
      ].filter(Boolean)
  };
};

console.log('Enhanced Equipment Database Loaded');
console.log('Data Quality Summary:', dataQualitySummary);
console.log('Top 3 Most Efficient Panels:', getTopPanelsByEfficiency(3).map(p => `${p.maker} ${p.model} (${p.aiAttributes.efficiencyRating}%)`));
console.log('Top 3 Most Reliable Inverters:', getMostReliableEquipment('inverters', 3).map(i => `${i.maker} ${i.model} (${i.aiAttributes.reliabilityScore}%)`));