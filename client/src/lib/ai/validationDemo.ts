// Validation Demo - Testing the AI Data Validation System
// This file demonstrates the validation capabilities with sample data

import { EquipmentDataValidator, validateEquipmentDatabase } from './dataValidation';
import { enhancedPanels, enhancedInverters, enhancedBatteries } from './enhancedMockData';
import { AISelectionContext } from '@/shared/types/ai-enhanced';

// Sample AI selection context for compatibility testing
const sampleContext: AISelectionContext = {
  requirements: {
    location: {
      address: "123 Sunshine Ave, Sunnydale, CA",
      coordinates: { lat: 34.0522, lng: -118.2437 },
      elevation: 86,
      climateZone: "Hot-Dry",
      solarIrradiance: 5.8
    },
    siteConstraints: {
      availableRoofArea: 100,
      roofPitch: 25,
      roofOrientation: 180,
      shadingAnalysis: {
        shadingFactor: 0.1,
        shadingSources: ["Tree", "Chimney"],
        shadingHours: [8, 9, 17, 18]
      },
      structuralLimitations: [],
      localRegulations: ["California Solar Mandate"]
    },
    budget: {
      totalBudget: 20000,
      equipmentBudget: 12000,
      installationBudget: 6000,
      contingencyBudget: 2000,
      financingAvailable: true,
      incentiveTarget: true
    },
    energyProfile: {
      desiredSystemSize: 8,
      annualConsumption: 9000,
      peakDemand: 5,
      consumptionProfile: 'residential',
      backupRequirements: {
        needed: false,
        backupCapacity: 0,
        criticalLoads: [],
        autonomyHours: 0
      }
    },
    preferences: {
      priorities: ['cost', 'performance'],
      equipmentPreferences: {
        panelBrands: ['SunPower', 'LG'],
        inverterBrands: ['SolarEdge', 'Enphase'],
        excludedBrands: []
      },
      aestheticRequirements: {
        visibleFromStreet: true,
        colorPreference: 'black',
        lowProfileRequired: false
      },
      timelineConstraints: {
        desiredInstallationDate: new Date('2024-06-01'),
        flexibility: 30
      }
    },
    technicalConstraints: {
      voltageLimitations: 600,
      amperageLimitations: 50,
      spaceLimitations: 100,
      weightLimitations: 500,
      accessibilityConstraints: []
    }
  },
  locationFactors: {
    climate: 'Hot-Dry',
    irradianceLevel: 5.8,
    temperatureRange: { min: 5, max: 40 },
    weatherPatterns: ['high-temperature', 'low-precipitation']
  },
  regulatoryFactors: {
    localCodes: ['California Electrical Code', 'NEC 2023'],
    utilityRequirements: ['SCE Interconnection'],
    permitComplexity: 'moderate'
  },
  marketFactors: {
    equipmentAvailability: { 'SunPower': 'high', 'LG': 'high', 'SolarEdge': 'high' },
    pricingLevel: 'high',
    supplierReliability: { 'SunPower': 90, 'LG': 85, 'SolarEdge': 88 }
  }
};

// Demonstration function
export function runValidationDemo() {
  console.log('🔍 AI Solar PV Data Validation Demo');
  console.log('=====================================\n');

  // 1. Validate individual panels
  console.log('📊 Individual Panel Validation:');
  console.log('-------------------------------');

  const topPanel = enhancedPanels[0]; // SunPower panel
  const validator = new EquipmentDataValidator();
  const panelValidation = validator.validatePanelData(topPanel);

  console.log(`Panel: ${topPanel.maker} ${topPanel.model}`);
  console.log(`✅ Valid: ${panelValidation.isValid}`);
  console.log(`📝 Errors: ${panelValidation.errors.length}`);
  console.log(`⚠️  Warnings: ${panelValidation.warnings.length}`);
  console.log(`💡 Suggestions: ${panelValidation.suggestions.length}`);

  if (panelValidation.errors.length > 0) {
    console.log('\n❌ Errors:');
    panelValidation.errors.forEach(error => {
      console.log(`  - ${error.field}: ${error.message}`);
    });
  }

  if (panelValidation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    panelValidation.warnings.forEach(warning => {
      console.log(`  - ${warning.field}: ${warning.message}`);
    });
  }

  if (panelValidation.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    panelValidation.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion.field}: ${suggestion.message} (${suggestion.priority} priority)`);
    });
  }

  // 2. Validate individual inverter
  console.log('\n📊 Individual Inverter Validation:');
  console.log('----------------------------------');

  const topInverter = enhancedInverters[0]; // SMA inverter
  const inverterValidation = validator.validateInverterData(topInverter);

  console.log(`Inverter: ${topInverter.maker} ${topInverter.model}`);
  console.log(`✅ Valid: ${inverterValidation.isValid}`);
  console.log(`📝 Errors: ${inverterValidation.errors.length}`);
  console.log(`⚠️  Warnings: ${inverterValidation.warnings.length}`);

  if (inverterValidation.errors.length > 0) {
    console.log('\n❌ Errors:');
    inverterValidation.errors.forEach(error => {
      console.log(`  - ${error.field}: ${error.message}`);
    });
  }

  // 3. Test equipment compatibility
  console.log('\n🔗 Equipment Compatibility Test:');
  console.log('--------------------------------');

  // const compatibilityValidation = validator.validateEquipmentCompatibility(
  //   topPanel,
  //   topInverter,
  //   sampleContext
  // );

  console.log(`Panel: ${topPanel.maker} ${topPanel.model} (${topPanel.power}W)`);
  console.log(`Inverter: ${topInverter.maker} ${topInverter.model} (${topInverter.maxOutputPower}W)`);
  // console.log(`✅ Compatible: ${compatibilityValidation.isValid}`);
  // console.log(`📝 Errors: ${compatibilityValidation.errors.length}`);
  // console.log(`⚠️  Warnings: ${compatibilityValidation.warnings.length}`);

  // if (compatibilityValidation.errors.length > 0) {
  //   console.log('\n❌ Compatibility Errors:');
  //   compatibilityValidation.errors.forEach(error => {
  //     console.log(`  - ${error.field}: ${error.message}`);
  //     console.log(`    💡 Action: ${error.recommendedAction}`);
  //   });
  // }

  // if (compatibilityValidation.warnings.length > 0) {
  //   console.log('\n⚠️  Compatibility Warnings:');
  //   compatibilityValidation.warnings.forEach(warning => {
  //     console.log(`  - ${warning.field}: ${warning.message}`);
  //     console.log(`    💡 Recommendation: ${warning.recommendation}`);
  //   });
  // }

  // 4. Validate entire equipment database
  console.log('\n🗄️  Equipment Database Validation:');
  console.log('----------------------------------');

  const allEquipment = [...enhancedPanels, ...enhancedInverters, ...enhancedBatteries];
  const dbValidation = validateEquipmentDatabase(allEquipment);

  console.log(`Total Records: ${dbValidation.summary.totalRecords}`);
  console.log(`Valid Records: ${dbValidation.summary.validRecords}`);
  console.log(`Critical Errors: ${dbValidation.summary.criticalErrors}`);
  console.log(`Warnings: ${dbValidation.summary.warnings}`);

  // Show breakdown by equipment type
  console.log('\n📋 Validation Summary by Equipment Type:');
  console.log('Panels:');
  console.log(`  - Valid: ${dbValidation.panels.filter(v => v.isValid).length}/${dbValidation.panels.length}`);
  console.log(`  - Errors: ${dbValidation.panels.reduce((sum, v) => sum + v.errors.length, 0)}`);
  console.log(`  - Warnings: ${dbValidation.panels.reduce((sum, v) => sum + v.warnings.length, 0)}`);

  console.log('Inverters:');
  console.log(`  - Valid: ${dbValidation.inverters.filter(v => v.isValid).length}/${dbValidation.inverters.length}`);
  console.log(`  - Errors: ${dbValidation.inverters.reduce((sum, v) => sum + v.errors.length, 0)}`);
  console.log(`  - Warnings: ${dbValidation.inverters.reduce((sum, v) => sum + v.warnings.length, 0)}`);

  // Note: Batteries are not currently validated separately
  console.log('Batteries: Not validated separately');

  // 5. Data quality insights
  console.log('\n📈 Data Quality Insights:');
  console.log('--------------------------');

  const panelQualityScores = enhancedPanels.map(p => p.aiAttributes.aiMetadata.dataQualityScore);
  const avgPanelQuality = panelQualityScores.reduce((sum, score) => sum + score, 0) / panelQualityScores.length;

  const inverterQualityScores = enhancedInverters.map(i => i.aiAttributes.aiMetadata.dataQualityScore);
  const avgInverterQuality = inverterQualityScores.reduce((sum, score) => sum + score, 0) / inverterQualityScores.length;

  console.log(`Average Panel Data Quality: ${avgPanelQuality.toFixed(1)}%`);
  console.log(`Average Inverter Data Quality: ${avgInverterQuality.toFixed(1)}%`);

  // Show equipment with highest and lowest quality scores
  const bestPanel = enhancedPanels.reduce((best, panel) =>
    panel.aiAttributes.aiMetadata.dataQualityScore > best.aiAttributes.aiMetadata.dataQualityScore ? panel : best
  );
  const worstPanel = enhancedPanels.reduce((worst, panel) =>
    panel.aiAttributes.aiMetadata.dataQualityScore < worst.aiAttributes.aiMetadata.dataQualityScore ? panel : worst
  );

  console.log(`Best Quality Panel: ${bestPanel.maker} ${bestPanel.model} (${bestPanel.aiAttributes.aiMetadata.dataQualityScore}%)`);
  console.log(`Lowest Quality Panel: ${worstPanel.maker} ${worstPanel.model} (${worstPanel.aiAttributes.aiMetadata.dataQualityScore}%)`);

  return {
    panelValidation,
    inverterValidation,
    // compatibilityValidation,
    databaseValidation: dbValidation,
    summary: {
      totalRecords: dbValidation.summary.totalRecords,
      validRecords: dbValidation.summary.validRecords,
      criticalErrors: dbValidation.summary.criticalErrors,
      warnings: dbValidation.summary.warnings,
      avgDataQuality: (avgPanelQuality + avgInverterQuality) / 2
    }
  };
}

// Run the demo if this file is imported
console.log('🚀 AI Data Validation System Ready');
console.log('Run runValidationDemo() to see the validation in action\n');

export default runValidationDemo;