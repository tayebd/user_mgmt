#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndSeedData() {
  console.log('🔍 Checking existing data...');

  try {
    // Check counts
    const panelCount = await prisma.pVPanel.count();
    const inverterCount = await prisma.inverter.count();
    const userCount = await prisma.user.count();

    console.log(`📊 Current data:`);
    console.log(`   PV Panels: ${panelCount}`);
    console.log(`   Inverters: ${inverterCount}`);
    console.log(`   Users: ${userCount}`);

    // If no panels or inverters, create basic test data
    if (panelCount === 0) {
      console.log('\n🏭 Creating test PV Panel...');
      const testPanel = await prisma.pVPanel.create({
        data: {
          maker: "SunPower",
          model: "SPR-X22-370",
          description: "High-efficiency residential solar panel",
          maxPower: 370,
          efficiency: 22.6,
          openCircuitVoltage: 41.2,
          shortCircuitCurrent: 9.05,
          currentAtPmax: 8.71,
          voltageAtPmax: 34.7,
          tempCoeffVoc: -0.29,
          tempCoeffIsc: 0.05,
          weight: 18.6,
          performanceWarranty: "25 years",
          productWarranty: "25 years",
        }
      });
      console.log(`✅ Created panel: ${testPanel.maker} ${testPanel.model} (${testPanel.maxPower}W)`);
    }

    if (inverterCount === 0) {
      console.log('\n🏭 Creating test Inverter...');
      const testInverter = await prisma.inverter.create({
        data: {
          maker: "SMA",
          model: "Sunny Boy 5.0",
          description: "Residential string inverter",
          maxOutputPower: 5000,
          maxDcVoltage: 600,
          maxInputCurrentPerMppt: 11,
          maxShortCircuitCurrent: 25,
          europeanEfficiency: 97.5,
          dimensions: "445x305x145",
          warrantyYears: 10,
        }
      });
      console.log(`✅ Created inverter: ${testInverter.maker} ${testInverter.model} (${testInverter.maxOutputPower}W)`);
    }

    // Check if we have users for testing
    if (userCount === 0) {
      console.log('\n👤 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          uid: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        }
      });
      console.log(`✅ Created user: ${testUser.email}`);
    }

    // Get the first panel and inverter for AI seeding
    const firstPanel = await prisma.pVPanel.findFirst();
    const firstInverter = await prisma.inverter.findFirst();

    if (firstPanel && firstInverter) {
      console.log('\n🤖 Creating AI Intelligence data...');

      // Create AI Panel Intelligence
      const existingPanelAI = await prisma.aiPanelIntelligence.findFirst({
        where: { panelId: firstPanel.id }
      });

      if (!existingPanelAI) {
        await prisma.aiPanelIntelligence.create({
          data: {
            panelId: firstPanel.id,
            performanceClass: 'PREMIUM',
            efficiencyRating: 96,
            reliabilityScore: 95,
            valueRating: 85,
            compatibilityScore: 94,
            temperaturePerformance: {
              hotClimatePerformance: 0.95,
              coldClimatePerformance: 1.02,
              temperatureCoeff: -0.29
            },
            spaceEfficiency: {
              powerDensity: 22.6,
              spaceRequirement: "low",
              roofTypeRecommendation: "all"
            },
            installationComplexity: "low",
            marketIntelligence: {
              averagePrice: 180.50,
              priceTrend: "stable",
              availability: "good",
              popularMarkets: ["residential", "commercial"]
            },
            dataQualityScore: 95,
            sourceReliability: 90,
            lastUpdated: new Date(),
            aiModelVersion: "1.0.0",
          }
        });
        console.log('✅ Created AI Panel Intelligence');
      }

      // Create AI Inverter Intelligence
      const existingInverterAI = await prisma.aiInverterIntelligence.findFirst({
        where: { inverterId: firstInverter.id }
      });

      if (!existingInverterAI) {
        await prisma.aiInverterIntelligence.create({
          data: {
            inverterId: firstInverter.id,
            performanceClass: 'PREMIUM',
            efficiencyRating: 97,
            reliabilityScore: 95,
            valueRating: 88,
            compatibilityScore: 94,
            inverterTopology: "transformerless",
            advancedFeatures: {
              smartMonitoring: true,
              remoteControl: true,
              gridServices: true,
              arcFaultProtection: true,
              rapidShutdown: true
            },
            integrationCapabilities: {
              batteryStorage: true,
              evCharging: true,
              smartHome: true,
              vpp: true
            },
            marketIntelligence: {
              averagePrice: 1250.00,
              priceTrend: "stable",
              availability: "good",
              popularMarkets: ["residential", "small_commercial"]
            },
            dataQualityScore: 92,
            sourceReliability: 88,
            lastUpdated: new Date(),
            aiModelVersion: "1.0.0",
          }
        });
        console.log('✅ Created AI Inverter Intelligence');
      }

      // Create Compatibility Matrix
      const existingCompatibility = await prisma.aiCompatibilityMatrix.findFirst({
        where: {
          panelId: firstPanel.id,
          inverterId: firstInverter.id
        }
      });

      if (!existingCompatibility) {
        await prisma.aiCompatibilityMatrix.create({
          data: {
            panelId: firstPanel.id,
            inverterId: firstInverter.id,
            overallScore: 94.50,
            voltageCompatibility: 95.00,
            currentCompatibility: 92.00,
            powerCompatibility: 96.00,
            temperatureCompatibility: 94.00,
            compatibilityFactors: {
              voltageMatch: "excellent",
              currentMatch: "good",
              powerRatio: "optimal",
              temperatureRange: "suitable"
            },
            limitations: {
              maxStringLength: 10,
              minStringLength: 7,
              coldClimateVoc: "45.2V at -10°C - within limits"
            },
            recommendations: [
              "Excellent match for residential installations",
              "Consider power optimizers for complex roof layouts",
              "Monitor string lengths in cold climates"
            ],
            stringConfiguration: {
              recommendedStrings: 2,
              panelsPerString: 10,
              totalPanels: 20
            },
            optimalArraySize: {
              minPanels: 14,
              optimalPanels: 20,
              maxPanels: 24,
              systemPower: "7.4kW"
            },
            lastValidated: new Date(),
            aiModelVersion: "1.0.0",
          }
        });
        console.log('✅ Created AI Compatibility Matrix');
      }
    }

    console.log('\n🎉 Data check and seeding complete!');
    console.log('\n📋 Ready for testing:');
    console.log('1. Start server: pnpm start');
    console.log('2. Use the test scripts to verify AI endpoints');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkAndSeedData();
}