const http = require('http');

// Test data for AI design
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

async function testAIAPI() {
  try {
    console.log('🧪 Testing AI Design API...');
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
      const maxAttempts = 30; // Wait up to 30 seconds

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
            console.log('🎉 AI Design processing completed!');
            console.log('💰 Total Cost:', design.designResult?.cost?.total ? `€${design.designResult.cost.total.toFixed(2)}` : 'N/A');
            console.log('📈 ROI:', design.designResult?.roi ? `${design.designResult.roi.toFixed(1)}%` : 'N/A');
            console.log('🌞 Annual Production:', design.performanceEstimates?.annualProduction ? `${design.performanceEstimates.annualProduction.toFixed(0)} kWh` : 'N/A');
            console.log('🎯 Confidence Score:', design.confidenceScore ? `${design.confidenceScore}%` : 'N/A');
            console.log('⏱️ Processing Time:', design.processingTimeMs ? `${design.processingTimeMs}ms` : 'N/A');
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
      }

      if (attempts >= maxAttempts) {
        console.log('⏰ AI Design processing timed out after 30 seconds');
      }

    } else {
      console.log(`❌ Error creating AI design: ${createResponse.status}`);
      console.log('Response:', createResponse.data);
    }

    // Test getting AI designs list
    console.log('\n📋 Testing AI designs list...');
    const listOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/designs',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-access-token'
      }
    };

    const listResponse = await makeRequest(listOptions);

    if (listResponse.status === 200) {
      console.log('✅ AI designs list retrieved successfully!');
      console.log(`📊 Total designs: ${listResponse.data.designs?.length || 0}`);
      listResponse.data.designs?.forEach((design, index) => {
        console.log(`  ${index + 1}. ${design.id} - ${design.status} - ${new Date(design.createdAt).toLocaleString()}`);
      });
    } else {
      console.log(`❌ Error getting AI designs: ${listResponse.status}`);
      console.log('Response:', listResponse.data);
    }

  } catch (error) {
    console.error('❌ Error testing AI API:', error.message);
  }
}

// Run the test
testAIAPI()
  .then(() => {
    console.log('\n🎉 AI API test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 AI API test failed:', error);
    process.exit(1);
  });