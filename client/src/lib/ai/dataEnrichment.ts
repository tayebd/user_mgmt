// Data Enrichment Scripts for AI Solar PV Design
// This script adds AI-specific attributes to existing equipment data

import {
  EnhancedPVPanel,
  EnhancedInverter,
  EnhancedBatteryBank,
  EnhancedProtectionDevice,
  EnhancedWire,
  EnhancedMountingHardware,
  AIEquipmentAttributes,
  AIRequirements,
  DataQualityMetrics
} from '@/types/ai-enhanced';

import { PVPanel, Inverter, BatteryBank, ProtectionDevice, Wire, MountingHardware } from '@/types/solar';

// Equipment market data and characteristics for AI enrichment
const EQUIPMENT_MARKET_DATA = {
  // Panel market data
  panels: {
    brandRatings: {
      'SunPower': 95,
      'LG': 90,
      'Canadian Solar': 80,
      'Jinko Solar': 85,
      'Q Cells': 88,
      'Trina Solar': 82,
      'First Solar': 87,
      'REC Group': 86
    },
    performanceClasses: {
      'SunPower': 'premium' as const,
      'LG': 'premium' as const,
      'Q Cells': 'premium' as const,
      'REC Group': 'standard' as const,
      'Canadian Solar': 'standard' as const,
      'Jinko Solar': 'standard' as const,
      'Trina Solar': 'budget' as const,
      'First Solar': 'standard' as const
    },
    reliabilityScores: {
      'SunPower': 98,
      'LG': 95,
      'Q Cells': 92,
      'REC Group': 90,
      'Canadian Solar': 85,
      'Jinko Solar': 87,
      'Trina Solar': 82,
      'First Solar': 88
    }
  },
  // Inverter market data
  inverters: {
    brandRatings: {
      'SMA': 92,
      'SolarEdge': 94,
      'Fronius': 90,
      'ABB': 88,
      'Enphase': 95,
      'Huawei': 86,
      'Growatt': 82
    },
    performanceClasses: {
      'SMA': 'premium' as const,
      'SolarEdge': 'premium' as const,
      'Fronius': 'premium' as const,
      'Enphase': 'premium' as const,
      'ABB': 'standard' as const,
      'Huawei': 'standard' as const,
      'Growatt': 'budget' as const
    },
    reliabilityScores: {
      'SMA': 95,
      'SolarEdge': 94,
      'Fronius': 92,
      'Enphase': 93,
      'ABB': 88,
      'Huawei': 85,
      'Growatt': 80
    }
  }
};

// Data enrichment utilities
export class EquipmentDataEnricher {

  /**
   * Enrich panel data with AI-specific attributes
   */
  static enrichPanelData(panel: PVPanel): EnhancedPVPanel {
    const brandRating = EQUIPMENT_MARKET_DATA.panels.brandRatings[panel.maker as keyof typeof EQUIPMENT_MARKET_DATA.panels.brandRatings] || 75;
    const performanceClass = EQUIPMENT_MARKET_DATA.panels.performanceClasses[panel.maker as keyof typeof EQUIPMENT_MARKET_DATA.panels.performanceClasses] || 'standard';
    const reliabilityScore = EQUIPMENT_MARKET_DATA.panels.reliabilityScores[panel.maker as keyof typeof EQUIPMENT_MARKET_DATA.panels.reliabilityScores] || 80;

    // Calculate AI-specific metrics
    const efficiencyRating = this.calculateEfficiencyRating(panel.efficiency);
    const spaceEfficiency = this.calculateSpaceEfficiency(panel);
    const temperaturePerformance = this.calculateTemperaturePerformance(panel);
    const costAnalysis = this.calculatePanelCostAnalysis(panel);

    const aiAttributes: AIEquipmentAttributes = {
      performanceClass,
      efficiencyRating,
      reliabilityScore,
      valueRating: this.calculateValueRating(panel, efficiencyRating, brandRating),
      compatibilityScore: this.calculateCompatibilityScore(panel),
      temperaturePerformance,
      spaceEfficiency,
      installationComplexity: panel.weight > 20 ? 'medium' : 'low',
      handlingRequirements: this.calculateHandlingRequirements(panel),
      specialTools: [],
      compatibilityMatrix: this.generatePanelCompatibilityMatrix(panel),
      marketData: this.generateMarketData(panel.maker),
      costAnalysis,
      performanceAnalytics: this.generatePerformanceAnalytics(panel, reliabilityScore),
      complianceData: this.generateComplianceData(panel),
      aiMetadata: {
        lastUpdated: new Date(),
        dataQualityScore: this.calculateDataQualityScore(panel),
        sourceReliability: 85,
        modelTrainingDataIncluded: false,
        annotationStatus: 'provisional'
      }
    };

    return {
      ...panel,
      aiAttributes: {
        ...aiAttributes,
        // Panel-specific AI attributes
        cellTechnology: this.determineCellTechnology(panel) as 'bifacial' | 'monocrystalline' | 'polycrystalline' | 'thin-film' | 'heterojunction',
        bifacialGain: panel.description?.toLowerCase().includes('bifacial') ? 10 : 0,
        shadingTolerance: this.calculateShadingTolerance(panel),
        soilingLosses: 2.5, // Industry average
        lightInducedDegradation: 1.5, // Industry average for monocrystalline
        lowLightPerformance: this.calculateLowLightPerformance(panel),
        temperatureCoefficientOptimized: !!(panel.tempCoeffVoc && Math.abs(panel.tempCoeffVoc) < 0.3),
        hotSpotProtection: true, // Most modern panels have this
        potentialInducedDegradationResistance: 85,
        aestheticRating: this.calculateAestheticRating(panel),
        colorOptions: ['black', 'silver', 'blue'],
        frameDesign: 'standard',
        weightClass: panel.weight > 20 ? 'heavyweight' : panel.weight > 16 ? 'standard' : 'lightweight',
        integratedOptimizers: false,
        monitoringCapabilities: false,
        iotEnabled: false,
        carbonFootprint: this.calculateCarbonFootprint(panel),
        recyclability: 85,
        sustainableMaterials: panel.maker === 'SunPower' || panel.maker === 'LG'
      }
    };
  }

  /**
   * Enrich inverter data with AI-specific attributes
   */
  static enrichInverterData(inverter: Inverter): EnhancedInverter {
    const brandRating = EQUIPMENT_MARKET_DATA.inverters.brandRatings[inverter.maker as keyof typeof EQUIPMENT_MARKET_DATA.inverters.brandRatings] || 75;
    const performanceClass = EQUIPMENT_MARKET_DATA.inverters.performanceClasses[inverter.maker as keyof typeof EQUIPMENT_MARKET_DATA.inverters.performanceClasses] || 'standard';
    const reliabilityScore = EQUIPMENT_MARKET_DATA.inverters.reliabilityScores[inverter.maker as keyof typeof EQUIPMENT_MARKET_DATA.inverters.reliabilityScores] || 80;

    const efficiencyRating = this.calculateInverterEfficiencyRating(inverter.efficiency);
    const costAnalysis = this.calculateInverterCostAnalysis(inverter);

    const aiAttributes: AIEquipmentAttributes = {
      performanceClass,
      efficiencyRating,
      reliabilityScore,
      valueRating: this.calculateValueRating(inverter, efficiencyRating, brandRating),
      compatibilityScore: this.calculateInverterCompatibilityScore(inverter),
      temperaturePerformance: {
        hotClimatePerformance: 0.8,
        coldClimatePerformance: 0.9,
        optimalTemperatureRange: { min: -10, max: 50 }
      },
      spaceEfficiency: {
        powerPerSquareMeter: inverter.maxOutputPower / 0.1, // Assuming 0.1m² footprint
        compactnessScore: this.calculateCompactnessScore(inverter),
        rooftopCompatibility: 'good'
      },
      installationComplexity: 'medium',
      handlingRequirements: ['lifting equipment required'],
      specialTools: ['torque wrench', 'multimeter'],
      compatibilityMatrix: this.generateInverterCompatibilityMatrix(inverter),
      marketData: this.generateMarketData(inverter.maker),
      costAnalysis,
      performanceAnalytics: this.generateInverterPerformanceAnalytics(inverter, reliabilityScore),
      complianceData: this.generateComplianceData(inverter),
      aiMetadata: {
        lastUpdated: new Date(),
        dataQualityScore: this.calculateDataQualityScore(inverter),
        sourceReliability: 85,
        modelTrainingDataIncluded: false,
        annotationStatus: 'provisional'
      }
    };

    return {
      ...inverter,
      aiAttributes: {
        ...aiAttributes,
        // Inverter-specific AI attributes
        inverterTopology: this.determineInverterTopology(inverter) as 'string' | 'microinverter' | 'power-optimizer' | 'hybrid' | 'battery-hybrid',
        mpptEfficiency: 99.5, // Industry average
        partLoadEfficiency: this.calculatePartLoadEfficiency(inverter),
        overloadCapability: 110, // 10% overload capability
        integratedRapidShutdown: inverter.maker === 'SolarEdge' || inverter.maker === 'Enphase',
        arcFaultDetection: true, // Most modern inverters
        builtInMonitoring: true,
        remoteConfiguration: true,
        firmwareUpdateCapability: true,
        gridSupportFeatures: ['frequency ride-through', 'voltage ride-through'],
        antiIslandingProtection: true,
        reactivePowerControl: true,
        frequencyControl: false,
        operatingTemperatureRange: { min: -25, max: 60 },
        coolingSystem: inverter.maxOutputPower > 5000 ? 'active' : 'passive',
        weatherProtection: 'standard',
        altitudeDerating: 5, // 5% derating at 2000m
        noiseLevel: inverter.maxOutputPower > 5000 ? 35 : 25,
        sizeClass: inverter.maxOutputPower > 10000 ? 'large' : inverter.maxOutputPower > 3000 ? 'standard' : 'compact',
        installationOrientation: 'vertical',
        aestheticRating: 75,
        energyManagementFeatures: [],
        batteryIntegration: false,
        evChargingIntegration: false,
        homeEnergyManagement: false,
        serviceabilityRating: 80,
        modularDesign: false,
        hotSwappableComponents: false,
        remoteDiagnostics: true
      }
    };
  }

  /**
   * Enrich battery data with AI-specific attributes
   */
  static enrichBatteryData(battery: BatteryBank): EnhancedBatteryBank {
    const aiAttributes: AIEquipmentAttributes = {
      performanceClass: battery.chemistry === 'Lithium-ion' ? 'premium' : 'standard',
      efficiencyRating: 90,
      reliabilityScore: 85,
      valueRating: 75,
      compatibilityScore: 80,
      temperaturePerformance: {
        hotClimatePerformance: 0.7,
        coldClimatePerformance: 0.8,
        optimalTemperatureRange: { min: 0, max: 35 }
      },
      spaceEfficiency: {
        powerPerSquareMeter: battery.capacity / 0.5, // Assuming 0.5m² footprint
        compactnessScore: 75,
        rooftopCompatibility: 'fair'
      },
      installationComplexity: 'high',
      handlingRequirements: ['specialized training required'],
      specialTools: ['battery tester', 'insulated tools'],
      compatibilityMatrix: {
        compatibleInverters: [1, 2, 3], // Compatible inverter IDs
        compatibleMounting: [],
        compatibleProtection: []
      },
      marketData: this.generateMarketData(battery.maker),
      costAnalysis: this.calculateBatteryCostAnalysis(battery),
      performanceAnalytics: {
        realWorldEfficiency: 88,
        degradationRate: 2.0,
        warrantyClaimRate: 3,
        failureRate: 1,
        customerSatisfactionScore: 85
      },
      complianceData: this.generateComplianceData(battery),
      aiMetadata: {
        lastUpdated: new Date(),
        dataQualityScore: 75,
        sourceReliability: 80,
        modelTrainingDataIncluded: false,
        annotationStatus: 'provisional'
      }
    };

    return {
      ...battery,
      aiAttributes: {
        ...aiAttributes,
        // Battery-specific AI attributes
        chemistrySpecific: {
          energyDensity: battery.chemistry === 'Lithium-ion' ? 200 : 50,
          powerDensity: battery.chemistry === 'Lithium-ion' ? 300 : 100,
          roundTripEfficiency: battery.chemistry === 'Lithium-ion' ? 95 : 80,
          calendarLife: battery.chemistry === 'Lithium-ion' ? 20 : 10,
          cycleLifeAt80Dod: battery.cycleLife
        },
        chargeDischargeRate: 1.0, // 1C rate
        operatingTemperatureRange: { min: -20, max: 50 },
        selfDischargeRate: battery.chemistry === 'Lithium-ion' ? 3 : 10,
        coldWeatherPerformance: 70,
        thermalRunawayProtection: battery.chemistry === 'Lithium-ion',
        batteryManagementSystem: battery.chemistry === 'Lithium-ion' ? 'advanced' : 'basic',
        safetyCertifications: ['UL 1973', 'IEC 62619'],
        failureRate: 1,
        modularScalability: true,
        indoorOutdoorCompatible: true,
        ventilationRequirements: battery.chemistry === 'Lithium-ion' ? 'passive' : 'active',
        smartMonitoring: true,
        remoteManagement: true,
        gridInteractionCapabilities: ['peak shaving', 'backup power'],
        recyclability: 70,
        secondLifeApplications: battery.chemistry === 'Lithium-ion',
        sustainableMaterials: false
      }
    };
  }

  // Helper methods for calculating AI attributes

  private static calculateEfficiencyRating(efficiency: number): number {
    // Convert efficiency percentage to 0-100 score
    return Math.min(100, Math.max(0, (efficiency - 15) * 4)); // 15% = 0, 40% = 100
  }

  private static calculateInverterEfficiencyRating(efficiency: number): number {
    return Math.min(100, Math.max(0, (efficiency - 90) * 20)); // 90% = 0, 95% = 100
  }

  private static calculateValueRating(
    equipment: Record<string, unknown>,
    efficiencyRating: number,
    brandRating: number
  ): number {
    const price = (equipment.price as number) || 1000;
    const baseCost = (equipment.power as number) ? price / (equipment.power as number) : price / 1000;
    const costScore = Math.max(0, 100 - baseCost * 10); // Lower cost per watt = higher score

    return Math.round((efficiencyRating * 0.4 + brandRating * 0.3 + costScore * 0.3));
  }

  private static calculateCompatibilityScore(equipment: Record<string, unknown>): number {
    // Base compatibility score - would be enhanced with actual compatibility data
    return 85;
  }

  private static calculateInverterCompatibilityScore(inverter: Record<string, unknown>): number {
    return 85;
  }

  private static calculateSpaceEfficiency(panel: PVPanel) {
    const area = (panel.length * panel.width) / 1000000; // Convert mm² to m²
    const powerPerSquareMeter = panel.power / area;

    return {
      powerPerSquareMeter,
      compactnessScore: Math.min(100, powerPerSquareMeter / 2), // 200 W/m² = 100 points
      rooftopCompatibility: (powerPerSquareMeter > 180 ? 'excellent' :
                         powerPerSquareMeter > 150 ? 'good' :
                         powerPerSquareMeter > 120 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor'
    };
  }

  private static calculateTemperaturePerformance(panel: PVPanel) {
    const vocCoeff = panel.tempCoeffVoc || -0.3;
    const hotClimatePerformance = Math.max(-1, Math.min(1, (vocCoeff + 0.4) * 2));
    const coldClimatePerformance = Math.max(-1, Math.min(1, 1 - hotClimatePerformance));

    return {
      hotClimatePerformance,
      coldClimatePerformance,
      optimalTemperatureRange: { min: -10, max: 45 }
    };
  }

  private static calculatePanelCostAnalysis(panel: PVPanel) {
    const costPerWatt = (panel.price || 1000) / panel.power;

    return {
      costPerWatt,
      installationCostFactor: panel.weight > 20 ? 1.2 : 1.0,
      shippingCostPerUnit: panel.weight > 20 ? 50 : 25,
      bulkDiscountTiers: [
        { quantity: 10, discountPercent: 5 },
        { quantity: 50, discountPercent: 10 },
        { quantity: 100, discountPercent: 15 }
      ],
      totalCostOfOwnership: {
        cost25Year: (panel.price || 1000) * 1.5, // Including maintenance
        maintenanceCosts: (panel.price || 1000) * 0.2,
        degradationCosts: (panel.price || 1000) * 0.3
      }
    };
  }

  private static calculateInverterCostAnalysis(inverter: Inverter) {
    const costPerWatt = (inverter.price || 1000) / inverter.maxOutputPower;

    return {
      costPerWatt,
      installationCostFactor: inverter.maxOutputPower > 5000 ? 1.3 : 1.0,
      shippingCostPerUnit: inverter.maxOutputPower > 5000 ? 100 : 50,
      bulkDiscountTiers: [
        { quantity: 5, discountPercent: 5 },
        { quantity: 20, discountPercent: 10 }
      ],
      totalCostOfOwnership: {
        cost25Year: (inverter.price || 1000) * 2, // Including replacement
        maintenanceCosts: (inverter.price || 1000) * 0.3,
        degradationCosts: (inverter.price || 1000) * 0.5
      }
    };
  }

  private static calculateBatteryCostAnalysis(battery: BatteryBank) {
    const costPerKWh = (battery.price || 1000) / battery.capacity;

    return {
      costPerWatt: costPerKWh / 1000,
      installationCostFactor: 1.5,
      shippingCostPerUnit: 200,
      bulkDiscountTiers: [
        { quantity: 2, discountPercent: 5 },
        { quantity: 10, discountPercent: 10 }
      ],
      totalCostOfOwnership: {
        cost25Year: (battery.price || 1000) * 1.8,
        maintenanceCosts: (battery.price || 1000) * 0.4,
        degradationCosts: (battery.price || 1000) * 0.4
      }
    };
  }

  private static generatePerformanceAnalytics(equipment: Record<string, unknown>, reliabilityScore: number) {
    return {
      realWorldEfficiency: 90,
      degradationRate: equipment.maker === 'SunPower' ? 0.25 : 0.5,
      warrantyClaimRate: 5 - reliabilityScore / 25,
      failureRate: 2 - reliabilityScore / 50,
      customerSatisfactionScore: reliabilityScore
    };
  }

  private static generateInverterPerformanceAnalytics(inverter: Record<string, unknown>, reliabilityScore: number) {
    return {
      realWorldEfficiency: (inverter.efficiency as number) - 2,
      degradationRate: 0.1,
      warrantyClaimRate: 5 - reliabilityScore / 25,
      failureRate: 2 - reliabilityScore / 50,
      customerSatisfactionScore: reliabilityScore
    };
  }

  private static generateComplianceData(equipment: Record<string, unknown>) {
    return {
      approvedJurisdictions: ['US', 'CA', 'EU'],
      certifications: ['UL', 'IEC', 'CE'],
      complianceScore: 95,
      specialRequirements: []
    };
  }

  private static calculateDataQualityScore(equipment: Record<string, unknown>): number {
    // Calculate data quality based on completeness of the record
    const requiredFields = ['power', 'efficiency', 'price'];
    const presentFields = requiredFields.filter(field => equipment[field] != null);
    return (presentFields.length / requiredFields.length) * 100;
  }

  private static determineCellTechnology(panel: PVPanel): string {
    if (panel.description?.toLowerCase().includes('mono')) return 'monocrystalline';
    if (panel.description?.toLowerCase().includes('poly')) return 'polycrystalline';
    if (panel.description?.toLowerCase().includes('thin')) return 'thin-film';
    if (panel.description?.toLowerCase().includes('bifacial')) return 'bifacial';
    return 'monocrystalline'; // Default assumption
  }

  private static determineInverterTopology(inverter: Inverter): string {
    if (inverter.maker === 'Enphase') return 'microinverter';
    if (inverter.maker === 'SolarEdge') return 'power-optimizer';
    if (inverter.maxOutputPower < 1000) return 'microinverter';
    return 'string';
  }

  private static calculateShadingTolerance(panel: PVPanel): number {
    // Based on panel type and technology
    if (panel.description?.toLowerCase().includes('microinverter')) return 90;
    if (panel.description?.toLowerCase().includes('optimizer')) return 80;
    return 60;
  }

  private static calculateLowLightPerformance(panel: PVPanel): number {
    // Higher efficiency panels generally perform better in low light
    return Math.min(100, panel.efficiency * 3);
  }

  private static calculateAestheticRating(panel: PVPanel): number {
    // Premium brands generally have better aesthetics
    if (panel.maker === 'SunPower') return 95;
    if (panel.maker === 'LG') return 90;
    if (panel.maker === 'Q Cells') return 88;
    return 75;
  }

  private static calculateCarbonFootprint(panel: PVPanel): number {
    // Estimate based on panel size and technology
    const weight = panel.weight || 20;
    return weight * 2; // kg CO2e per kg of panel
  }

  private static calculateHandlingRequirements(panel: PVPanel): string[] {
    const requirements = [];
    if (panel.weight > 20) requirements.push('two-person lift');
    if (panel.length > 1800) requirements.push('large handling area');
    return requirements;
  }

  private static calculatePartLoadEfficiency(inverter: Inverter): number {
    // Estimate part-load efficiency based on rated efficiency
    return Math.max(85, inverter.efficiency - 10);
  }

  private static calculateCompactnessScore(inverter: Record<string, unknown>): number {
    // Would be calculated based on actual dimensions
    return 75;
  }

  private static generatePanelCompatibilityMatrix(panel: PVPanel) {
    return {
      compatibleInverters: [1, 2, 3, 4, 5, 6], // All inverters in mock data
      compatibleMounting: [1, 2, 3, 4, 5, 6], // All mounting systems
      compatibleProtection: [1, 2] // All protection devices
    };
  }

  private static generateInverterCompatibilityMatrix(inverter: Inverter) {
    return {
      compatibleInverters: [],
      compatibleMounting: [1, 2, 3, 4, 5, 6],
      compatibleProtection: [1, 2]
    };
  }

  private static generateMarketData(brand: string) {
    return {
      availabilityStatus: 'in-stock' as const,
      leadTimeDays: 14,
      supplierRatings: { [brand]: 85 },
      regionalAvailability: { 'US': true, 'CA': true, 'EU': true }
    };
  }
}

// Export the enrichment functions
export const enrichPanels = (panels: PVPanel[]): EnhancedPVPanel[] =>
  panels.map(panel => EquipmentDataEnricher.enrichPanelData(panel));

export const enrichInverters = (inverters: Inverter[]): EnhancedInverter[] =>
  inverters.map(inverter => EquipmentDataEnricher.enrichInverterData(inverter));

export const enrichBatteries = (batteries: BatteryBank[]): EnhancedBatteryBank[] =>
  batteries.map(battery => EquipmentDataEnricher.enrichBatteryData(battery));

// Data quality validation
export const validateDataQuality = (equipment: Record<string, unknown>[]): DataQualityMetrics => {
  const totalRecords = equipment.length;
  let completeRecords = 0;
  let inconsistencies = 0;
  const issues: Array<{type: 'missing' | 'inconsistent' | 'outdated' | 'unreliable'; description: string; severity: 'medium' | 'low' | 'high'}> = [];

  equipment.forEach(item => {
    // Check for required fields
    const requiredFields = ['power', 'efficiency', 'price'];
    const missingFields = requiredFields.filter(field => !item[field]);

    if (missingFields.length === 0) {
      completeRecords++;
    } else {
      issues.push({
        type: 'missing',
        description: `Missing fields: ${missingFields.join(', ')}`,
        severity: 'medium'
      });
    }

    // Check for inconsistencies
    if ((item.power as number) && (item.price as number) && (item.price as number) / (item.power as number) > 5) {
      inconsistencies++;
      issues.push({
        type: 'inconsistent',
        description: 'Price per watt seems unusually high',
        severity: 'low'
      });
    }
  });

  return {
    completeness: (completeRecords / totalRecords) * 100,
    accuracy: 85, // Estimated
    consistency: Math.max(0, 100 - (inconsistencies / totalRecords) * 100),
    timeliness: 90,
    relevance: 95,
    lastValidated: new Date(),
    issues
  };
};