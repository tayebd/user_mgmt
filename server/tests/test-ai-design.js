const { PrismaClient } = require('@prisma/client');
const { AIEquipmentSelector } = require('../src/services/AIEquipmentSelector');

const prisma = new PrismaClient();

async function testAIDesign() {
  try {
    console.log('🧪 Testing AI Design functionality...');

    // Create test design requirements
    const requirements = {
      location: 'Paris, France',
      latitude: 48.8566,
      longitude: 2.3522,
      climateZone: 'Cfb',
      powerTarget: 6000, // 6kW system
      budget: 8000, // €8,000 budget
      roofType: 'tilted',
      orientation: 'south',
      tilt: 30,
      shading: [],
      constraints: [],
      priority: 'efficiency'
    };

    console.log('📋 Design Requirements:', JSON.stringify(requirements, null, 2));

    // Test AI equipment selection
    console.log('🤖 Starting AI equipment selection...');
    const selector = new AIEquipmentSelector();
    const selection = await selector.selectOptimalEquipment(requirements);

    console.log('✅ AI Equipment Selection Results:');
    console.log(`🏆 Selected Panel: ${selection.panel.maker} ${selection.panel.model} (${selection.panel.maxPower}W, ${selection.panel.efficiency}% efficiency)`);
    console.log(`⚡ Selected Inverter: ${selection.inverter.maker} ${selection.inverter.model} (${selection.inverter.maxOutputPower}W, ${selection.inverter.europeanEfficiency}% efficiency)`);
    console.log(`🔋 Array Configuration: ${selection.configuration.totalPanels} panels (${selection.configuration.panelsPerString} panels x ${selection.configuration.numberOfStrings} strings)`);
    console.log(`⚖️ Power Ratio: ${selection.configuration.powerRatio.toFixed(2)} (DC/AC)`);
    console.log(`💰 Total Cost: €${selection.totalCost.toFixed(2)}`);
    console.log(`📈 ROI: ${selection.roi.toFixed(1)}% over 25 years`);
    console.log(`🌞 Annual Production: ${selection.annualProduction.toFixed(0)} kWh`);
    console.log(`🌱 CO2 Offset: ${selection.co2Offset.toFixed(2)} tons/year`);

    if (selection.compatibility) {
      console.log(`🔗 Compatibility Score: ${selection.compatibility.overallScore}%`);
    }

    // Create a test AI design record
    console.log('\n💾 Creating test AI design record...');
    const aiDesign = await prisma.aiDesign.create({
      data: {
        userId: 15, // Test user ID
        requirements: requirements,
        locationContext: {
          latitude: requirements.latitude,
          longitude: requirements.longitude,
          climateZone: requirements.climateZone,
          solarIrradiance: 1230
        },
        designResult: {
          panels: {
            selected: {
              id: selection.panel.id,
              maker: selection.panel.maker,
              model: selection.panel.model,
              maxPower: selection.panel.maxPower,
              efficiency: selection.panel.efficiency,
            },
            quantity: selection.configuration.totalPanels,
            totalPowerDC: selection.configuration.totalPowerDC,
          },
          inverter: {
            selected: {
              id: selection.inverter.id,
              maker: selection.inverter.maker,
              model: selection.inverter.model,
              maxOutputPower: selection.inverter.maxOutputPower,
              efficiency: selection.inverter.europeanEfficiency,
            },
            quantity: 1,
            totalPowerAC: selection.inverter.maxOutputPower,
          },
          configuration: selection.configuration,
          cost: {
            total: selection.totalCost,
            equipment: selection.totalCost * 0.75,
            installation: selection.totalCost * 0.25,
            costPerWatt: selection.totalCost / selection.configuration.totalPowerDC,
          },
          roi: selection.roi,
        },
        equipmentSelections: {
          panelId: selection.panel.id,
          inverterId: selection.inverter.id,
          mountingSystem: 'roof-mounted',
          optimization: 'string_inverter',
          priorityFactors: {
            efficiency: selection.panel.efficiency,
            reliability: selection.panel.aiIntelligence?.reliabilityScore || 90,
            cost: selection.totalCost / selection.configuration.totalPowerDC,
            compatibility: selection.compatibility ? Number(selection.compatibility.overallScore) : 85,
          },
        },
        systemConfiguration: {
          arrayConfiguration: selection.configuration.stringConfiguration,
          orientation: requirements.orientation,
          tilt: requirements.tilt,
          estimatedProduction: selection.annualProduction,
        },
        performanceEstimates: {
          annualProduction: selection.annualProduction,
          specificYield: selection.annualProduction / selection.configuration.totalPowerDC,
          performanceRatio: 0.82,
          systemEfficiency: 0.85,
        },
        complianceResults: {
          electricalCodeCompliant: true,
          buildingCodeCompliant: true,
          utilityCompliant: true,
          complianceScore: 95,
          issues: [],
          recommendations: ['Standard installation practices'],
        },
        alternatives: [
          {
            description: 'Higher efficiency alternative',
            powerIncrease: '10-15%',
            costIncrease: '20-25%',
            suitableFor: 'Space-constrained installations',
          },
        ],
        status: 'COMPLETED',
        completedAt: new Date(),
        confidenceScore: 88,
        processingTimeMs: 2500,
        aiModelVersion: '1.0.0',
      }
    });

    console.log(`✅ AI Design created with ID: ${aiDesign.id}`);

    // Verify the design was saved correctly
    const savedDesign = await prisma.aiDesign.findUnique({
      where: { id: aiDesign.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    console.log('💾 Saved AI Design Verification:');
    console.log(`👤 User: ${savedDesign.user.name} (${savedDesign.user.email})`);
    console.log(`📊 Status: ${savedDesign.status}`);
    console.log(`⏱️ Processing Time: ${savedDesign.processingTimeMs}ms`);
    console.log(`🎯 Confidence Score: ${savedDesign.confidenceScore}%`);

    console.log('\n🎉 AI Design functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing AI design:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAIDesign()
  .then(() => {
    console.log('✨ AI design test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 AI design test failed:', error);
    process.exit(1);
  });