// AI-Enhanced Type Definitions for Solar PV Equipment
// This module contains enhanced types with AI-specific attributes and metadata

import { z } from 'zod';
import * as SolarTypes from './solar';

// Base AI Attributes that apply to all equipment types
export const AIEquipmentAttributesSchema = z.object({
  performanceClass: z.enum(['budget', 'standard', 'premium']),
  efficiencyRating: z.number().min(0).max(100),
  reliabilityScore: z.number().min(0).max(100),
  valueRating: z.number().min(0).max(100),
  compatibilityScore: z.number().min(0).max(100),
  temperaturePerformance: z.object({
    hotClimatePerformance: z.number(),
    coldClimatePerformance: z.number(),
    optimalTemperatureRange: z.object({
      min: z.number(),
      max: z.number()
    })
  }),
  spaceEfficiency: z.object({
    powerPerSquareMeter: z.number(),
    compactnessScore: z.number(),
    rooftopCompatibility: z.enum(['excellent', 'good', 'fair', 'poor'])
  }),
  installationComplexity: z.enum(['low', 'medium', 'high']),
  handlingRequirements: z.array(z.string()),
  specialTools: z.array(z.string()),
  compatibilityMatrix: z.object({
    compatibleInverters: z.array(z.number()),
    compatibleMounting: z.array(z.number()),
    compatibleProtection: z.array(z.number())
  }),
  marketData: z.object({
    availabilityStatus: z.enum(['in-stock', 'limited', 'out-of-stock']),
    leadTimeDays: z.number(),
    supplierRatings: z.record(z.number()),
    regionalAvailability: z.record(z.boolean())
  }),
  costAnalysis: z.object({
    costPerWatt: z.number(),
    installationCostFactor: z.number(),
    shippingCostPerUnit: z.number(),
    bulkDiscountTiers: z.array(z.object({
      quantity: z.number(),
      discountPercent: z.number()
    })),
    totalCostOfOwnership: z.object({
      cost25Year: z.number(),
      maintenanceCosts: z.number(),
      degradationCosts: z.number()
    })
  }),
  performanceAnalytics: z.object({
    realWorldEfficiency: z.number(),
    degradationRate: z.number(),
    warrantyClaimRate: z.number(),
    failureRate: z.number(),
    customerSatisfactionScore: z.number()
  }),
  complianceData: z.object({
    approvedJurisdictions: z.array(z.string()),
    certifications: z.array(z.string()),
    complianceScore: z.number(),
    specialRequirements: z.array(z.string())
  }),
  aiMetadata: z.object({
    lastUpdated: z.date(),
    dataQualityScore: z.number().min(0).max(100),
    sourceReliability: z.number().min(0).max(100),
    modelTrainingDataIncluded: z.boolean(),
    annotationStatus: z.enum(['provisional', 'validated', 'verified'])
  })
});

export type AIEquipmentAttributes = z.infer<typeof AIEquipmentAttributesSchema>;

// Panel-specific AI attributes
export const PanelAIAttributesSchema = z.object({
  cellTechnology: z.enum(['bifacial', 'monocrystalline', 'polycrystalline', 'thin-film', 'heterojunction']),
  bifacialGain: z.number(),
  shadingTolerance: z.number(),
  soilingLosses: z.number(),
  lightInducedDegradation: z.number(),
  lowLightPerformance: z.number(),
  temperatureCoefficientOptimized: z.boolean(),
  hotSpotProtection: z.boolean(),
  potentialInducedDegradationResistance: z.number(),
  aestheticRating: z.number(),
  colorOptions: z.array(z.string()),
  frameDesign: z.string(),
  weightClass: z.enum(['lightweight', 'standard', 'heavyweight']),
  integratedOptimizers: z.boolean(),
  monitoringCapabilities: z.boolean(),
  iotEnabled: z.boolean(),
  carbonFootprint: z.number(),
  recyclability: z.number(),
  sustainableMaterials: z.boolean()
});

// Enhanced PV Panel type
export const EnhancedPVPanelSchema = SolarTypes.PVPanelSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...PanelAIAttributesSchema.shape
  })
});

export type EnhancedPVPanel = z.infer<typeof EnhancedPVPanelSchema>;

// Inverter-specific AI attributes
export const InverterAIAttributesSchema = z.object({
  inverterTopology: z.enum(['string', 'microinverter', 'power-optimizer', 'hybrid', 'battery-hybrid']),
  mpptEfficiency: z.number(),
  partLoadEfficiency: z.number(),
  overloadCapability: z.number(),
  integratedRapidShutdown: z.boolean(),
  arcFaultDetection: z.boolean(),
  builtInMonitoring: z.boolean(),
  remoteConfiguration: z.boolean(),
  firmwareUpdateCapability: z.boolean(),
  gridSupportFeatures: z.array(z.string()),
  antiIslandingProtection: z.boolean(),
  reactivePowerControl: z.boolean(),
  frequencyControl: z.boolean(),
  operatingTemperatureRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  coolingSystem: z.enum(['passive', 'active']),
  weatherProtection: z.string(),
  altitudeDerating: z.number(),
  noiseLevel: z.number(),
  sizeClass: z.enum(['compact', 'standard', 'large']),
  installationOrientation: z.string(),
  aestheticRating: z.number(),
  energyManagementFeatures: z.array(z.string()),
  batteryIntegration: z.boolean(),
  evChargingIntegration: z.boolean(),
  homeEnergyManagement: z.boolean(),
  serviceabilityRating: z.number(),
  modularDesign: z.boolean(),
  hotSwappableComponents: z.boolean(),
  remoteDiagnostics: z.boolean()
});

// Enhanced Inverter type
export const EnhancedInverterSchema = SolarTypes.InverterSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...InverterAIAttributesSchema.shape
  })
});

export type EnhancedInverter = z.infer<typeof EnhancedInverterSchema>;

// Battery-specific AI attributes
export const BatteryAIAttributesSchema = z.object({
  chemistrySpecific: z.object({
    energyDensity: z.number(),
    powerDensity: z.number(),
    roundTripEfficiency: z.number(),
    calendarLife: z.number(),
    cycleLifeAt80Dod: z.number()
  }),
  chargeDischargeRate: z.number(),
  operatingTemperatureRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  selfDischargeRate: z.number(),
  coldWeatherPerformance: z.number(),
  thermalRunawayProtection: z.boolean(),
  batteryManagementSystem: z.enum(['basic', 'advanced']),
  safetyCertifications: z.array(z.string()),
  failureRate: z.number(),
  modularScalability: z.boolean(),
  indoorOutdoorCompatible: z.boolean(),
  ventilationRequirements: z.enum(['passive', 'active']),
  smartMonitoring: z.boolean(),
  remoteManagement: z.boolean(),
  gridInteractionCapabilities: z.array(z.string()),
  recyclability: z.number(),
  secondLifeApplications: z.boolean(),
  sustainableMaterials: z.boolean()
});

// Enhanced Battery Bank type
export const EnhancedBatteryBankSchema = SolarTypes.BatteryBankSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...BatteryAIAttributesSchema.shape
  })
});

export type EnhancedBatteryBank = z.infer<typeof EnhancedBatteryBankSchema>;

// Protection Device-specific AI attributes
export const ProtectionDeviceAIAttributesSchema = z.object({
  protectionType: z.enum(['overcurrent', 'overvoltage', 'undervoltage', 'surge', 'ground-fault']),
  responseTime: z.number(),
  breakingCapacity: z.number(),
  selectiveCoordination: z.boolean(),
  testCapability: z.boolean(),
  visualIndication: z.boolean(),
  remoteMonitoring: z.boolean(),
  selfTesting: z.boolean(),
  iecStandardsCompliance: z.array(z.string()),
  ulStandardsCompliance: z.array(z.string()),
  safetyIntegrityLevel: z.enum(['SIL1', 'SIL2', 'SIL3', 'SIL4']).optional(),
  functionalSafety: z.boolean(),
  maintenanceInterval: z.number(),
  serviceLife: z.number(),
  environmentalRating: z.string(),
  iotEnabled: z.boolean(),
  predictiveMaintenance: z.boolean()
});

// Enhanced Protection Device type
export const EnhancedProtectionDeviceSchema = SolarTypes.ProtectionDeviceSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...ProtectionDeviceAIAttributesSchema.shape
  })
});

export type EnhancedProtectionDevice = z.infer<typeof EnhancedProtectionDeviceSchema>;

// Wire-specific AI attributes
export const WireAIAttributesSchema = z.object({
  conductorMaterial: z.enum(['copper', 'aluminum', 'copper-clad-aluminum']),
  insulationType: z.enum(['PVC', 'XLPE', 'EPR', 'LSF', 'LSZH']),
  temperatureRating: z.number(),
  voltageRating: z.number(),
  flameRetardant: z.boolean(),
  uvResistant: z.boolean(),
  moistureResistant: z.boolean(),
  chemicalResistance: z.boolean(),
  flexibility: z.enum(['rigid', 'semi-flexible', 'flexible']),
  installationMethod: z.array(z.enum(['conduit', 'cable-tray', 'direct-burial', 'aerial'])),
  terminationType: z.enum(['crimp', 'solder', 'compression', 'mechanical-lug']),
  ampacityAdjustmentFactors: z.record(z.number()),
  shortCircuitRating: z.number(),
  earthFaultRating: z.number(),
  impedance: z.object({
    resistance: z.number(),
    reactance: z.number(),
    impedance: z.number()
  }),
  voltageDrop: z.object({
    per100m: z.number(),
    per1000ft: z.number()
  }),
  thermalConductivity: z.number(),
  coefficientOfExpansion: z.number(),
  recyclingContent: z.number(),
  RoHSCompliant: z.boolean(),
  halogenFree: z.boolean(),
  lowSmokeEmission: z.boolean(),
  predictiveAgingAnalysis: z.object({
    expectedLife: z.number(),
    degradationFactors: z.array(z.string()),
    maintenanceSchedule: z.array(z.string())
  })
});

// Enhanced Wire type
export const EnhancedWireSchema = SolarTypes.WireSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...WireAIAttributesSchema.shape
  })
});

export type EnhancedWire = z.infer<typeof EnhancedWireSchema>;

// Mounting Hardware-specific AI attributes
export const MountingHardwareAIAttributesSchema = z.object({
  mountingSystem: z.enum(['fixed-tilt', 'adjustable-tilt', 'tracking', 'ballasted', 'penetrating']),
  materialGrade: z.enum(['standard', 'marine-grade', 'aerospace-grade']),
  corrosionResistance: z.object({
    rating: z.number(),
    coatingType: z.string(),
    warranty: z.number()
  }),
  structuralAnalysis: z.object({
    windResistance: z.number(),
    snowLoadCapacity: z.number(),
    seismicRating: z.number(),
    deadLoad: z.number(),
    liveLoad: z.number(),
    safetyFactor: z.number()
  }),
  installationComplexity: z.enum(['simple', 'moderate', 'complex']),
  foundationRequirements: z.array(z.string()),
  adjustability: z.object({
    tiltRange: z.object({
      min: z.number(),
      max: z.number()
    }),
    azimuthAdjustment: z.boolean(),
    seasonalAdjustment: z.boolean()
  }),
  compatibility: z.object({
    roofTypes: z.array(z.string()),
    panelTypes: z.array(z.string()),
    clampTypes: z.array(z.string())
  }),
  toolsRequired: z.array(z.string()),
  installationTime: z.object({
    averageHours: z.number(),
    crewSize: z.number()
  }),
  maintenanceAccess: z.enum(['excellent', 'good', 'fair', 'poor']),
  inspectionRequirements: z.array(z.string()),
  certifications: z.array(z.string()),
  testingStandards: z.array(z.string()),
  thermalExpansion: z.object({
    coefficient: z.number(),
    accommodation: z.string()
  }),
  groundingIntegration: z.object({
    methods: z.array(z.string()),
    componentsIncluded: z.array(z.string())
  }),
  cableManagement: z.object({
    racewaysIncluded: z.boolean(),
    routingOptions: z.array(z.string()),
    protectionRating: z.string()
  }),
  sustainabilityMetrics: z.object({
    recycledContent: z.number(),
    carbonFootprint: z.number(),
    endOfLifeRecyclability: z.number(),
    sustainableMaterials: z.boolean()
  })
});

// Enhanced Mounting Hardware type
export const EnhancedMountingHardwareSchema = SolarTypes.MountingHardwareSchema.extend({
  aiAttributes: z.object({
    ...AIEquipmentAttributesSchema.shape,
    ...MountingHardwareAIAttributesSchema.shape
  })
});

export type EnhancedMountingHardware = z.infer<typeof EnhancedMountingHardwareSchema>;

// AI Selection Context for equipment recommendation
export const AISelectionContextSchema = z.object({
  requirements: z.object({
    location: z.object({
      address: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }),
      elevation: z.number(),
      climateZone: z.string(),
      solarIrradiance: z.number()
    }),
    siteConstraints: z.object({
      availableRoofArea: z.number(),
      roofPitch: z.number(),
      roofOrientation: z.number(),
      shadingAnalysis: z.object({
        shadingFactor: z.number(),
        shadingSources: z.array(z.string()),
        shadingHours: z.array(z.number())
      }),
      structuralLimitations: z.array(z.string()),
      localRegulations: z.array(z.string())
    }),
    budget: z.object({
      totalBudget: z.number(),
      equipmentBudget: z.number(),
      installationBudget: z.number(),
      contingencyBudget: z.number(),
      financingAvailable: z.boolean(),
      incentiveTarget: z.boolean()
    }),
    energyProfile: z.object({
      desiredSystemSize: z.number(),
      annualConsumption: z.number(),
      peakDemand: z.number(),
      consumptionProfile: z.enum(['residential', 'commercial', 'industrial']),
      backupRequirements: z.object({
        needed: z.boolean(),
        backupCapacity: z.number(),
        criticalLoads: z.array(z.string()),
        autonomyHours: z.number()
      })
    }),
    preferences: z.object({
      priorities: z.array(z.string()),
      equipmentPreferences: z.object({
        panelBrands: z.array(z.string()),
        inverterBrands: z.array(z.string()),
        excludedBrands: z.array(z.string())
      }),
      aestheticRequirements: z.object({
        visibleFromStreet: z.boolean(),
        colorPreference: z.string(),
        lowProfileRequired: z.boolean()
      }),
      timelineConstraints: z.object({
        desiredInstallationDate: z.date(),
        flexibility: z.number()
      })
    }),
    technicalConstraints: z.object({
      voltageLimitations: z.number(),
      amperageLimitations: z.number(),
      spaceLimitations: z.number(),
      weightLimitations: z.number(),
      accessibilityConstraints: z.array(z.string())
    })
  }),
  locationFactors: z.object({
    climate: z.string(),
    irradianceLevel: z.number(),
    temperatureRange: z.object({
      min: z.number(),
      max: z.number()
    }),
    weatherPatterns: z.array(z.string())
  }),
  regulatoryFactors: z.object({
    localCodes: z.array(z.string()),
    utilityRequirements: z.array(z.string()),
    permitComplexity: z.enum(['simple', 'moderate', 'complex'])
  }),
  marketFactors: z.object({
    equipmentAvailability: z.record(z.string()),
    pricingLevel: z.enum(['low', 'medium', 'high']),
    supplierReliability: z.record(z.number())
  })
});

export type AISelectionContext = z.infer<typeof AISelectionContextSchema>;

// AI Requirements for system design
export const AIRequirementsSchema = z.object({
  location: z.object({
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    elevation: z.number(),
    climateZone: z.string(),
    solarIrradiance: z.number()
  }),
  siteConstraints: z.object({
    availableRoofArea: z.number(),
    roofPitch: z.number(),
    roofOrientation: z.number(),
    shadingAnalysis: z.object({
      shadingFactor: z.number(),
      shadingSources: z.array(z.string()),
      shadingHours: z.array(z.number())
    }),
    structuralLimitations: z.array(z.string()),
    localRegulations: z.array(z.string())
  }),
  budget: z.object({
    totalBudget: z.number(),
    equipmentBudget: z.number(),
    installationBudget: z.number(),
    contingencyBudget: z.number(),
    financingAvailable: z.boolean(),
    incentiveTarget: z.boolean()
  }),
  energyProfile: z.object({
    desiredSystemSize: z.number(),
    annualConsumption: z.number(),
    peakDemand: z.number(),
    consumptionProfile: z.enum(['residential', 'commercial', 'industrial']),
    backupRequirements: z.object({
      needed: z.boolean(),
      backupCapacity: z.number(),
      criticalLoads: z.array(z.string()),
      autonomyHours: z.number()
    })
  }),
  preferences: z.object({
    priorities: z.array(z.string()),
    equipmentPreferences: z.object({
      panelBrands: z.array(z.string()),
      inverterBrands: z.array(z.string()),
      excludedBrands: z.array(z.string())
    }),
    aestheticRequirements: z.object({
      visibleFromStreet: z.boolean(),
      colorPreference: z.string(),
      lowProfileRequired: z.boolean()
    }),
    timelineConstraints: z.object({
      desiredInstallationDate: z.date(),
      flexibility: z.number()
    })
  }),
  technicalConstraints: z.object({
    voltageLimitations: z.number(),
    amperageLimitations: z.number(),
    spaceLimitations: z.number(),
    weightLimitations: z.number(),
    accessibilityConstraints: z.array(z.string())
  })
});

export type AIRequirements = z.infer<typeof AIRequirementsSchema>;

// Data Quality Metrics
export const DataQualityMetricsSchema = z.object({
  completeness: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  timeliness: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  lastValidated: z.date(),
  issues: z.array(z.object({
    type: z.enum(['missing', 'inconsistent', 'outdated', 'unreliable']),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high'])
  }))
});

export type DataQualityMetrics = z.infer<typeof DataQualityMetricsSchema>;

// Re-export all types for convenience
export type {
  // Base types from main types module
  PVPanel,
  Inverter,
  BatteryBank,
  ProtectionDevice,
  Wire,
  MountingHardware
} from './solar';