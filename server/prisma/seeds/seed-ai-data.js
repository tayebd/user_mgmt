#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAIData() {
  console.log('🌱 Seeding AI Test Data...');

  try {
    // Check if we have existing panels and inverters
    const existingPanels = await prisma.pVPanel.count();
    const existingInverters = await prisma.inverter.count();
    const existingUsers = await prisma.user.count();

    console.log(`📊 Current data: ${existingPanels} panels, ${existingInverters} inverters, ${existingUsers} users`);

    if (existingPanels === 0) {
      console.log('⚠️ No PV panels found. You need to seed the basic equipment data first.');
      console.log('   Run: npx prisma db seed (if seed script exists)');
      return;
    }

    if (existingInverters === 0) {
      console.log('⚠️ No inverters found. You need to seed the basic equipment data first.');
      return;
    }

    if (existingUsers === 0) {
      console.log('⚠️ No users found. Creating a test user...');

      const testUser = await prisma.user.create({
        data: {
          uid: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        }
      });
      console.log('✅ Created test user:', testUser.email);
    }

    // Get first panel and inverter for testing
    const firstPanel = await prisma.pVPanel.findFirst();
    const firstInverter = await prisma.inverter.findFirst();

    if (!firstPanel || !firstInverter) {
      console.log('❌ No panels or inverters available for AI intelligence seeding');
      return;
    }

    console.log(`📝 Using panel ${firstPanel.id} (${firstPanel.maker} ${firstPanel.model})`);
    console.log(`📝 Using inverter ${firstInverter.id} (${firstInverter.maker} ${firstInverter.model})`);

    // Seed AI Panel Intelligence
    const existingPanelIntelligence = await prisma.aiPanelIntelligence.findFirst({
      where: { panelId: firstPanel.id }
    });

    if (!existingPanelIntelligence) {
      const panelIntelligence = await prisma.aiPanelIntelligence.create({
        data: {
          panelId: firstPanel.id,
          reliabilityRating: 4.5,
          degradationRate: 0.3,
          performanceInHotClimate: 0.95,
          lowLightPerformance: 0.88,
          shadingTolerance: 0.75,
          compatibilityScore: 92,
          marketPrice: 180.50,
          availabilityStatus: 'IN_STOCK',
          recommendedApplications: ['residential', 'commercial'],
          technicalNotes: 'Excellent efficiency, good for space-constrained installations',
          lastUpdated: new Date(),
          aiModelVersion: '1.0.0',
          confidenceScore: 0.94,
          dataSources: ['manufacturer_specs', 'field_data', 'third_party_tests'],
          analysisDate: new Date(),
        }
      });
      console.log('✅ Created AI Panel Intelligence for panel:', firstPanel.id);
    } else {
      console.log('ℹ️ AI Panel Intelligence already exists for panel:', firstPanel.id);
    }

    // Seed AI Inverter Intelligence
    const existingInverterIntelligence = await prisma.aiInverterIntelligence.findFirst({
      where: { inverterId: firstInverter.id }
    });

    if (!existingInverterIntelligence) {
      const inverterIntelligence = await prisma.aiInverterIntelligence.create({
        data: {
          inverterId: firstInverter.id,
          reliabilityRating: 4.7,
          efficiencyRating: 97.5,
          warrantyQuality: 4.3,
          customerSupportRating: 4.2,
          firmwareUpdateFrequency: 0.8,
          smartFeatures: ['monitoring', 'remote_control', 'grid_services'],
          marketPrice: 1250.00,
          availabilityStatus: 'IN_STOCK',
          recommendedApplications: ['residential', 'small_commercial'],
          technicalNotes: 'High efficiency with excellent monitoring capabilities',
          lastUpdated: new Date(),
          aiModelVersion: '1.0.0',
          confidenceScore: 0.91,
          dataSources: ['manufacturer_specs', 'user_reviews', 'field_performance'],
          analysisDate: new Date(),
        }
      });
      console.log('✅ Created AI Inverter Intelligence for inverter:', firstInverter.id);
    } else {
      console.log('ℹ️ AI Inverter Intelligence already exists for inverter:', firstInverter.id);
    }

    // Seed Compatibility Matrix
    const existingCompatibility = await prisma.aiCompatibilityMatrix.findFirst({
      where: {
        panelId: firstPanel.id,
        inverterId: firstInverter.id
      }
    });

    if (!existingCompatibility) {
      const compatibility = await prisma.aiCompatibilityMatrix.create({
        data: {
          panelId: firstPanel.id,
          inverterId: firstInverter.id,
          overallCompatibilityScore: 94,
          voltageCompatibility: true,
          currentCompatibility: true,
          powerMatching: true,
          stringConfigurationRecommendations: '2 strings of 10 panels each',
          maxStringLength: 10,
          minStringLength: 7,
          temperatureConsiderations: 'Voc at -10°C: 45.2V, well within inverter limits',
          shadingOptimization: 'Consider power optimizers for partial shading scenarios',
          warrantyAlignment: 'Both products have 25-year performance warranties',
          performanceExpectations: {
            expectedEfficiency: 96.2,
            annualProduction: 7200,
            systemLosses: 8.5
          },
          recommendations: [
            'Excellent match for residential installations',
            'Consider adding DC optimizers for complex roof layouts',
            'Monitor string lengths carefully in cold climates'
          ],
          potentialIssues: [],
          aiModelVersion: '1.0.0',
          confidenceScore: 0.93,
          lastUpdated: new Date(),
          analysisDate: new Date(),
        }
      });
      console.log('✅ Created AI Compatibility Matrix for panel-inverter pair');
    } else {
      console.log('ℹ️ AI Compatibility Matrix already exists for this pair');
    }

    // Seed Market Intelligence
    const existingMarketIntelligence = await prisma.marketIntelligence.findFirst();

    if (!existingMarketIntelligence) {
      const marketIntelligence = await prisma.marketIntelligence.create({
        data: {
          region: 'France',
          marketTrends: {
            panelPrices: 'decreasing',
            inverterPrices: 'stable',
            installationCosts: 'increasing',
            demand: 'high'
          },
          averageSystemCost: {
            residential: 2800,
            commercial: 2100,
            utility: 1500
          },
          popularBrands: {
            panels: ['SunPower', 'LG', 'Q Cells', 'Canadian Solar'],
            inverters: ['SMA', 'Fronius', 'SolarEdge', 'Huawei']
          },
          regulatoryInfo: {
            feedInTariff: 0.10,
            netMetering: true,
            taxCredits: 0.25,
            permitsRequired: true
          },
          seasonalVariations: {
            productionFactor: {
              spring: 1.0,
              summer: 1.2,
              fall: 0.9,
              winter: 0.7
            }
          },
          marketMaturity: 'mature',
          competitionLevel: 'high',
          growthRate: 0.15,
          lastUpdated: new Date(),
          aiModelVersion: '1.0.0',
          confidenceScore: 0.89,
          dataSources: ['government_reports', 'industry_analysts', 'market_surveys'],
          analysisDate: new Date(),
        }
      });
      console.log('✅ Created Market Intelligence for France');
    } else {
      console.log('ℹ️ Market Intelligence already exists');
    }

    console.log('\n🎉 AI Test Data Seeding Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the server: pnpm start');
    console.log('2. Get a JWT token from your auth system');
    console.log('3. Update AUTH_TOKEN in test scripts');
    console.log('4. Run tests: ./test-curl-commands.sh');

  } catch (error) {
    console.error('❌ Error seeding AI data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedAIData();
}

module.exports = { seedAIData };