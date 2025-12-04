const http = require('http');

// Test data for AI design with PVLib
const testData = {
  requirements: {
    location: 'Paris, France',
    powerTarget: 6000,
    budget: 8000,
    roofType: 'tilted',
    orientation: 'south',
    tilt: 30,
    priority: 'efficiency',
    constraints: []
  },
  locationContext: {
    latitude: 48.8566,
    longitude: 2.3522,
    climateZone: 'Cfb'
  }
};

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAIWithPVLib() {
  try {
    console.log('🧪 Testing AI Design with PVLib Integration...');
    console.log('📋 Test Data:', JSON.stringify(testData, null, 2));

    // Test AI design creation
    console.log('\n🚀 Creating AI design...');
    const createOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/designs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-access-token'
      }
    };

    const createResponse = await makeRequest(createOptions, testData);

    if (createResponse.status === 201) {
      console.log('✅ AI Design created successfully!');
      console.log('📊 Design Response:', JSON.stringify(createResponse.data, null, 2));

      const designId = createResponse.data.id;

      // Poll for completion
      console.log('\n⏳ Waiting for AI processing to complete...');
      let attempts = 0;
      const maxAttempts = 60; // Wait up to 60 seconds for PVLib processing

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const getOptions = {
          hostname: 'localhost',
          port: 5000,
          path: `/api/ai/designs/${designId}`,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-access-token'
          }
        };

        const getResponse = await makeRequest(getOptions);

        if (getResponse.status === 200) {
          const design = getResponse.data;
          console.log(`📈 Status: ${design.status}`);

          if (design.status === 'COMPLETED') {
            console.log('🎉 AI Design processing completed with PVLib!');

            // Display key metrics
            console.log('\n📊 PVLib Performance Results:');
            console.log('💰 Total Cost:', design.designResult?.cost?.total ? `€${design.designResult.cost.total.toFixed(2)}` : 'N/A');
            console.log('📈 ROI:', design.designResult?.roi ? `${design.designResult.roi.toFixed(1)}%` : 'N/A');
            console.log('🌞 Annual Production:', design.performanceEstimates?.annualProduction ? `${design.performanceEstimates.annualProduction.toFixed(0)} kWh` : 'N/A');
            console.log('⚡ Peak Power:', design.performanceEstimates?.peakPower ? `${design.performanceEstimates.peakPower.toFixed(2)} kW` : 'N/A');
            console.log('📏 Specific Yield:', design.performanceEstimates?.specificYield ? `${design.performanceEstimates.specificYield.toFixed(0)} kWh/kWp` : 'N/A');
            console.log('🎯 Performance Ratio:', design.performanceEstimates?.performanceRatio ? `${design.performanceEstimates.performanceRatio.toFixed(1)}%` : 'N/A');
            console.log('🏭 Capacity Factor:', design.performanceEstimates?.capacityFactor ? `${design.performanceEstimates.capacityFactor.toFixed(1)}%` : 'N/A');
            console.log('🌱 CO2 Offset:', design.performanceEstimates?.environmentalBenefits?.co2Offset ? `${design.performanceEstimates.environmentalBenefits.co2Offset.toFixed(2)} tons/year` : 'N/A');
            console.log('🌳 Equivalent Trees:', design.performanceEstimates?.environmentalBenefits?.equivalentTrees ? `${design.performanceEstimates.environmentalBenefits.equivalentTrees} trees` : 'N/A');
            console.log('🎯 Confidence Score:', design.confidenceScore ? `${design.confidenceScore}%` : 'N/A');
            console.log('⏱️ Processing Time:', design.processingTimeMs ? `${design.processingTimeMs}ms` : 'N/A');

            // Display monthly production if available
            if (design.performanceEstimates?.monthlyProduction) {
              console.log('\n📅 Monthly Production (kWh):');
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              design.performanceEstimates.monthlyProduction.forEach((production, index) => {
                console.log(`  ${months[index]}: ${production.toFixed(0)}`);
              });
            }

            // Display financial metrics
            if (design.performanceEstimates?.financialMetrics) {
              console.log('\n💰 Financial Metrics:');
              console.log(`  NPV: €${design.performanceEstimates.financialMetrics.npv.toFixed(0)}`);
              console.log(`  IRR: ${design.performanceEstimates.financialMetrics.irr.toFixed(1)}%`);
              console.log(`  Payback Period: ${design.performanceEstimates.financialMetrics.paybackPeriod} years`);
              console.log(`  LCOE: €${design.performanceEstimates.financialMetrics.lcoe.toFixed(3)}/kWh`);
            }

            break;
          } else if (design.status === 'FAILED') {
            console.log('❌ AI Design processing failed!');
            console.log('Error:', design.designResult?.error || 'Unknown error');
            break;
          }
        } else {
          console.log(`❌ Error checking design status: ${getResponse.status}`);
          console.log('Response:', getResponse.data);
          break;
        }

        attempts++;
        if (attempts % 10 === 0) {
          console.log(`⏳ Still processing... (${attempts}/${maxAttempts} seconds)`);
        }
      }

      if (attempts >= maxAttempts) {
        console.log('⏰ AI Design processing timed out after 60 seconds');
      }

    } else {
      console.log(`❌ Error creating AI design: ${createResponse.status}`);
      console.log('Response:', createResponse.data);
    }

  } catch (error) {
    console.error('❌ Error testing AI API:', error.message);
  }
}

// Run the test
testAIWithPVLib()
  .then(() => {
    console.log('\n🎉 AI API test with PVLib completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 AI API test failed:', error);
    process.exit(1);
  });