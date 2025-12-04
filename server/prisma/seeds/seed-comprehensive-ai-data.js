const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedComprehensiveAIData() {
  try {
    console.log('🌱 Starting comprehensive AI test data seeding...');

    // Clear existing AI data
    await prisma.aiPanelIntelligence.deleteMany();
    await prisma.aiInverterIntelligence.deleteMany();
    await prisma.aiCompatibilityMatrix.deleteMany();

    // Clear existing equipment (but keep the original panel and inverter)
    await prisma.pVPanel.deleteMany({
      where: {
        id: {
          notIn: [20] // Keep the existing SunPower panel
        }
      }
    });
    await prisma.inverter.deleteMany({
      where: {
        id: {
          notIn: [21] // Keep the existing SMA inverter
        }
      }
    });

    console.log('📋 Creating comprehensive panel inventory...');

    // Create a diverse panel inventory
    const panelsData = [
      {
        maker: "SunPower",
        model: "SPR-X22-370",
        maxPower: 370,
        efficiency: 22.6,
        openCircuitVoltage: 41.2,
        shortCircuitCurrent: 9.05,
        currentAtPmax: 8.63,
        voltageAtPmax: 34.1,
        tempCoeffVoc: -0.29,
        tempCoeffIsc: 0.04,
        description: "Premium high-efficiency panel",
        performanceWarranty: "25 years",
        productWarranty: "25 years"
      },
      {
        maker: "LG",
        model: "NeON R",
        maxPower: 380,
        efficiency: 21.7,
        openCircuitVoltage: 41.0,
        shortCircuitCurrent: 9.8,
        currentAtPmax: 9.3,
        voltageAtPmax: 33.7,
        tempCoeffVoc: -0.28,
        tempCoeffIsc: 0.03,
        description: "High-end n-type panel",
        performanceWarranty: "25 years",
        productWarranty: "25 years"
      },
      {
        maker: "REC",
        model: "Alpha Pure-R",
        maxPower: 380,
        efficiency: 21.7,
        openCircuitVoltage: 40.9,
        shortCircuitCurrent: 9.8,
        currentAtPmax: 9.2,
        voltageAtPmax: 33.5,
        tempCoeffVoc: -0.26,
        tempCoeffIsc: 0.04,
        description: "Premium heterojunction panel",
        performanceWarranty: "25 years",
        productWarranty: "25 years"
      },
      {
        maker: "Jinko Solar",
        model: "Tiger Pro",
        maxPower: 400,
        efficiency: 20.5,
        openCircuitVoltage: 38.5,
        shortCircuitCurrent: 10.8,
        currentAtPmax: 10.2,
        voltageAtPmax: 31.8,
        tempCoeffVoc: -0.32,
        tempCoeffIsc: 0.05,
        description: "Cost-effective high-power panel",
        performanceWarranty: "25 years",
        productWarranty: "15 years"
      },
      {
        maker: "Canadian Solar",
        model: "HiKu6",
        maxPower: 355,
        efficiency: 19.8,
        openCircuitVoltage: 40.2,
        shortCircuitCurrent: 9.2,
        currentAtPmax: 8.7,
        voltageAtPmax: 32.1,
        tempCoeffVoc: -0.30,
        tempCoeffIsc: 0.05,
        description: "Reliable standard panel",
        performanceWarranty: "25 years",
        productWarranty: "15 years"
      },
      {
        maker: "Trina Solar",
        model: "Vertex S+",
        maxPower: 390,
        efficiency: 20.2,
        openCircuitVoltage: 39.5,
        shortCircuitCurrent: 10.2,
        currentAtPmax: 9.6,
        voltageAtPmax: 31.2,
        tempCoeffVoc: -0.31,
        tempCoeffIsc: 0.04,
        description: "High-performance multi-busbar panel",
        performanceWarranty: "25 years",
        productWarranty: "15 years"
      },
      {
        maker: "Q Cells",
        model: "Q.PEAK DUO",
        maxPower: 340,
        efficiency: 19.4,
        openCircuitVoltage: 38.9,
        shortCircuitCurrent: 8.9,
        currentAtPmax: 8.4,
        voltageAtPmax: 32.3,
        tempCoeffVoc: -0.28,
        tempCoeffIsc: 0.04,
        description: "Premium German quality panel",
        performanceWarranty: "25 years",
        productWarranty: "20 years"
      },
      {
        maker: "Longi Solar",
        model: "HI-MO 5",
        maxPower: 375,
        efficiency: 20.1,
        openCircuitVoltage: 39.2,
        shortCircuitCurrent: 9.8,
        currentAtPmax: 9.3,
        voltageAtPmax: 32.0,
        tempCoeffVoc: -0.32,
        tempCoeffIsc: 0.05,
        description: "Value-focused monocrystalline panel",
        performanceWarranty: "25 years",
        productWarranty: "12 years"
      }
    ];

    const createdPanels = [];
    for (const panelData of panelsData) {
      // Skip the first one as it already exists
      if (panelData.maker === "SunPower" && panelData.model === "SPR-X22-370") {
        const existingPanel = await prisma.pVPanel.findUnique({ where: { id: 20 } });
        createdPanels.push(existingPanel);
        continue;
      }

      const panel = await prisma.pVPanel.create({
        data: panelData
      });
      createdPanels.push(panel);
      console.log(`✅ Created panel: ${panel.maker} ${panel.model} (${panel.maxPower}W)`);
    }

    console.log('📋 Creating comprehensive inverter inventory...');

    // Create a diverse inverter inventory
    const invertersData = [
      {
        maker: "SMA",
        model: "Sunny Boy 5.0",
        maxOutputPower: 5000,
        maxDcVoltage: 600,
        europeanEfficiency: 97.5,
        maxInputCurrentPerMppt: 12.5,
        mpptVoltageRangeMin: 150,
        mpptVoltageRangeMax: 500,
        maxShortCircuitCurrent: 15,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 6500,
        warrantyYears: 10,
        description: "Premium string inverter"
      },
      {
        maker: "Fronius",
        model: "Primo 6.0-1",
        maxOutputPower: 6000,
        maxDcVoltage: 1000,
        europeanEfficiency: 97.8,
        maxInputCurrentPerMppt: 12,
        mpptVoltageRangeMin: 80,
        mpptVoltageRangeMax: 1000,
        maxShortCircuitCurrent: 18,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 7500,
        warrantyYears: 10,
        description: "High-quality Austrian inverter"
      },
      {
        maker: "SolarEdge",
        model: "SE7600H-RW",
        maxOutputPower: 7600,
        maxDcVoltage: 1000,
        europeanEfficiency: 98.0,
        maxInputCurrentPerMppt: 16,
        mpptVoltageRangeMin: 100,
        mpptVoltageRangeMax: 1000,
        maxShortCircuitCurrent: 20,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 9900,
        warrantyYears: 12,
        description: "HD Wave inverter with power optimizers"
      },
      {
        maker: "Huawei",
        model: "SUN2000-5KTL",
        maxOutputPower: 5000,
        maxDcVoltage: 1000,
        europeanEfficiency: 98.2,
        maxInputCurrentPerMppt: 11,
        mpptVoltageRangeMin: 80,
        mpptVoltageRangeMax: 1000,
        maxShortCircuitCurrent: 22,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 6500,
        warrantyYears: 10,
        description: "Asian high-efficiency inverter"
      },
      {
        maker: "Enphase",
        model: "IQ 7A",
        maxOutputPower: 384,
        maxDcVoltage: 60,
        europeanEfficiency: 97.5,
        maxInputCurrentPerMppt: 10,
        mpptVoltageRangeMin: 16,
        mpptVoltageRangeMax: 48,
        maxShortCircuitCurrent: 10.8,
        numberOfMpptTrackers: 1,
        maxRecommendedPvPower: 480,
        warrantyYears: 25,
        description: "Microinverter for module-level optimization"
      },
      {
        maker: "Growatt",
        model: "MIN 5000 TL-X",
        maxOutputPower: 5000,
        maxDcVoltage: 1000,
        europeanEfficiency: 97.3,
        maxInputCurrentPerMppt: 12.5,
        mpptVoltageRangeMin: 70,
        mpptVoltageRangeMax: 1000,
        maxShortCircuitCurrent: 18.75,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 6500,
        warrantyYears: 5,
        description: "Cost-effective string inverter"
      },
      {
        maker: "ABB",
        model: "UNO-5.0/6.0-TL-OUTD",
        maxOutputPower: 6000,
        maxDcVoltage: 1000,
        europeanEfficiency: 97.4,
        maxInputCurrentPerMppt: 15,
        mpptVoltageRangeMin: 100,
        mpptVoltageRangeMax: 800,
        maxShortCircuitCurrent: 20,
        numberOfMpptTrackers: 2,
        maxRecommendedPvPower: 7800,
        warrantyYears: 10,
        description: "Swedish engineering quality inverter"
      }
    ];

    const createdInverters = [];
    for (const inverterData of invertersData) {
      // Skip the first one as it already exists
      if (inverterData.maker === "SMA" && inverterData.model === "Sunny Boy 5.0") {
        const existingInverter = await prisma.inverter.findUnique({ where: { id: 21 } });
        createdInverters.push(existingInverter);
        continue;
      }

      const inverter = await prisma.inverter.create({
        data: inverterData
      });
      createdInverters.push(inverter);
      console.log(`✅ Created inverter: ${inverter.maker} ${inverter.model} (${inverter.maxOutputPower}W)`);
    }

    console.log('🤖 Creating AI Panel Intelligence data...');

    // Create AI intelligence for panels
    for (const panel of createdPanels) {
      const performanceClass = panel.efficiency > 21 ? 'PREMIUM' :
                               panel.efficiency > 19.5 ? 'STANDARD' : 'BUDGET';

      const intelligence = await prisma.aiPanelIntelligence.create({
        data: {
          panelId: panel.id,
          performanceClass,
          efficiencyRating: Math.round(panel.efficiency * 4.5), // Convert to 0-100 scale
          reliabilityScore: panel.maker === 'SunPower' || panel.maker === 'LG' ? 95 :
                           panel.maker === 'REC' || panel.maker === 'Q Cells' ? 92 : 88,
          valueRating: panel.maker === 'Jinko Solar' || panel.maker === 'Canadian Solar' ? 90 : 75,
          compatibilityScore: 85 + Math.round(Math.random() * 10),
          temperaturePerformance: {
            hotClimatePerformance: 0.85 + (panel.tempCoeffVoc > -0.3 ? 0.1 : 0),
            coldClimatePerformance: 1.05 + (panel.tempCoeffVoc < -0.3 ? 0.05 : 0),
            temperatureCoefficient: panel.tempCoeffVoc
          },
          spaceEfficiency: {
            powerDensity: panel.maxPower / (1.96), // Assuming ~2m² per panel
            installationComplexity: 'standard'
          },
          marketIntelligence: {
            averagePrice: 150 + (panel.maxPower * 0.4), // Base price + per-watt cost
            priceHistory: {
              trend: 'stable',
              volatility: 0.05
            },
            availability: 'high',
            popularityScore: 70 + Math.round(Math.random() * 25)
          },
          costAnalysis: {
            levelizedCost: 0.03 + (Math.random() * 0.02),
            lifetimeValue: panel.maxPower * 25 * 0.25, // 25 years, €0.25/kWh
            maintenanceFactor: 0.98
          },
          performanceAnalytics: {
            degradationRate: 0.004 + (Math.random() * 0.002),
            actualVsRated: 0.96 + (Math.random() * 0.04),
            warrantyClaims: Math.random() > 0.8 ? 'low' : 'very_low'
          },
          dataQualityScore: 85 + Math.round(Math.random() * 10),
          aiModelVersion: '1.0.0',
          sourceReliability: 90 + Math.round(Math.random() * 10)
        }
      });

      console.log(`🧠 Created AI intelligence for ${panel.maker} ${panel.model}`);
    }

    console.log('🤖 Creating AI Inverter Intelligence data...');

    // Create AI intelligence for inverters
    for (const inverter of createdInverters) {
      const performanceClass = inverter.europeanEfficiency > 97.8 ? 'PREMIUM' :
                               inverter.europeanEfficiency > 97.3 ? 'STANDARD' : 'BUDGET';

      const intelligence = await prisma.aiInverterIntelligence.create({
        data: {
          inverterId: inverter.id,
          performanceClass,
          efficiencyRating: Math.round(inverter.europeanEfficiency * 1.03), // Convert to 0-100 scale
          reliabilityScore: inverter.maker === 'SMA' || inverter.maker === 'Fronius' ? 95 :
                           inverter.maker === 'SolarEdge' || inverter.maker === 'ABB' ? 92 : 85,
          valueRating: inverter.maker === 'Growatt' || inverter.maker === 'Huawei' ? 90 : 75,
          compatibilityScore: 85 + Math.round(Math.random() * 10),
          inverterTopology: inverter.maker === 'Enphase' ? 'microinverter' : 'string_inverter',
          advancedFeatures: {
            hasMonitoring: true,
            hasRemoteControl: inverter.maker !== 'Growatt',
            hasRapidShutdown: inverter.maker === 'SolarEdge',
            hasAFCI: inverter.maker === 'SMA' || inverter.maker === 'Fronius'
          },
          integrationCapabilities: {
            batteryReady: inverter.maker === 'SMA' || inverter.maker === 'SolarEdge',
            smartGridReady: inverter.maker === 'Fronius' || inverter.maker === 'ABB',
            evChargerIntegration: inverter.maker === 'Fronius'
          },
          marketIntelligence: {
            averagePrice: 800 + (inverter.maxOutputPower * 0.2),
            priceHistory: {
              trend: 'slightly_decreasing',
              volatility: 0.08
            },
            availability: 'high',
            popularityScore: 70 + Math.round(Math.random() * 25)
          },
          costAnalysis: {
            levelizedCost: 0.02 + (Math.random() * 0.015),
            lifetimeValue: inverter.warrantyYears * 100,
            maintenanceFactor: 0.97
          },
          performanceAnalytics: {
            efficiencyRetention: 0.95 + (Math.random() * 0.04),
            meanTimeBetweenFailures: 15000 + Math.round(Math.random() * 10000),
            warrantyClaims: Math.random() > 0.9 ? 'medium' : 'low'
          },
          dataQualityScore: 85 + Math.round(Math.random() * 10),
          aiModelVersion: '1.0.0',
          sourceReliability: 90 + Math.round(Math.random() * 10)
        }
      });

      console.log(`🧠 Created AI intelligence for ${inverter.maker} ${inverter.model}`);
    }

    console.log('🔗 Creating AI Compatibility Matrix...');

    // Create compatibility matrix for panel-inverter combinations
    for (const panel of createdPanels.slice(0, 5)) { // Limit to avoid too many combinations
      for (const inverter of createdInverters.slice(0, 5)) {
        // Calculate actual compatibility based on electrical characteristics
        const vocAtMinus10 = panel.openCircuitVoltage * (1 + (-35 * panel.tempCoeffVoc / 100));
        const maxPanelsInString = Math.floor(inverter.maxDcVoltage / vocAtMinus10);
        const minPanelsInString = Math.ceil(inverter.mpptVoltageRangeMin / (panel.voltageAtPmax * 0.8));

        let overallScore = 75; // Base score
        let issues = [];
        let recommendations = [];

        // Check voltage compatibility
        if (vocAtMinus10 > inverter.maxDcVoltage) {
          overallScore -= 30;
          issues.push('High voltage risk at low temperatures');
          recommendations.push('Reduce panels per string or use higher voltage inverter');
        }

        // Check current compatibility
        if (panel.shortCircuitCurrent > inverter.maxInputCurrentPerMppt) {
          overallScore -= 20;
          issues.push('Current exceeds MPPT limit');
          recommendations.push('Use parallel strings or different inverter');
        }

        // Power ratio check
        const optimalPowerRatio = 1.1;
        const typicalPanels = 20;
        const totalPower = typicalPanels * panel.maxPower;
        const powerRatio = totalPower / inverter.maxOutputPower;

        if (powerRatio < 0.9) {
          overallScore -= 15;
          issues.push('System may be under-powered');
          recommendations.push('Consider smaller inverter or more panels');
        } else if (powerRatio > 1.3) {
          overallScore -= 25;
          issues.push('System may be over-powered');
          recommendations.push('Use larger inverter or fewer panels');
        }

        // Adjust score based on quality
        if (panel.efficiency > 21 && inverter.europeanEfficiency > 97.8) {
          overallScore += 10; // Premium combination bonus
        }

        const compatibility = await prisma.aiCompatibilityMatrix.create({
          data: {
            panelId: panel.id,
            inverterId: inverter.id,
            overallScore: Math.max(30, Math.min(100, overallScore)),
            voltageCompatibility: vocAtMinus10 <= inverter.maxDcVoltage ? 85 + Math.round(Math.random() * 10) : 60,
            currentCompatibility: panel.shortCircuitCurrent <= inverter.maxInputCurrentPerMppt ? 90 : 70,
            powerCompatibility: Math.abs(powerRatio - optimalPowerRatio) < 0.2 ? 85 : 70,
            temperatureCompatibility: panel.tempCoeffVoc > -0.3 ? 85 : 75,
            compatibilityFactors: {
              electricalMatch: overallScore > 80,
              qualityAlignment: panel.efficiency > 20 && inverter.europeanEfficiency > 97,
              costEfficiency: panel.maker === 'Jinko Solar' || inverter.maker === 'Growatt'
            },
            limitations: issues.length > 0 ? issues : ['None identified'],
            recommendations: recommendations.length > 0 ? recommendations : ['Standard installation'],
            stringConfiguration: {
              maxPanelsPerString: maxPanelsInString,
              minPanelsPerString: minPanelsInString,
              optimalPanelsPerString: Math.round((maxPanelsInString + minPanelsInString) / 2),
              maxStringsParallel: Math.floor(inverter.maxShortCircuitCurrent / panel.shortCircuitCurrent)
            },
            optimalArraySize: {
              minPanels: minPanelsInString,
              maxPanels: maxPanelsInString * Math.floor(inverter.maxShortCircuitCurrent / panel.shortCircuitCurrent),
              optimalPanels: Math.round(inverter.maxRecommendedPvPower / panel.maxPower)
            }
          }
        });

        console.log(`🔗 Created compatibility: ${panel.maker} + ${inverter.maker} = ${compatibility.overallScore}%`);
      }
    }

    console.log('✅ Comprehensive AI test data seeding completed!');
    console.log(`📊 Summary: ${createdPanels.length} panels, ${createdInverters.length} inverters`);
    console.log(`🧠 AI Intelligence: ${createdPanels.length} panels, ${createdInverters.length} inverters`);
    console.log(`🔗 Compatibility Matrix created for top combinations`);

  } catch (error) {
    console.error('❌ Error seeding AI data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedComprehensiveAIData()
  .then(() => {
    console.log('🎉 AI data seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 AI data seeding failed:', error);
    process.exit(1);
  });