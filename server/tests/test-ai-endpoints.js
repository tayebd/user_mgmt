#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your-test-token-here'; // You'll need to replace this with a real token

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}

// Test Functions
async function testCreateAIDesign() {
  console.log('\n🔨 Testing AI Design Creation...');

  const designData = {
    requirements: {
      location: "Paris, France",
      roofType: "tilted",
      orientation: "south",
      powerTarget: 6000,
      budget: 8000,
      constraints: ["shading", "space_limitation"]
    },
    locationContext: {
      latitude: 48.8566,
      longitude: 2.3522,
      climateZone: "Cfb",
      solarIrradiance: 1230,
      electricityPrice: 0.25,
      feedInTariff: 0.10
    }
  };

  try {
    const result = await apiRequest('/ai/designs', {
      method: 'POST',
      body: JSON.stringify(designData)
    });

    console.log('✅ AI Design created successfully:');
    console.log('   ID:', result.id);
    console.log('   Status:', result.status);
    console.log('   Message:', result.message);

    return result.id; // Return the design ID for other tests
  } catch (error) {
    console.error('❌ Failed to create AI design:', error.message);
    throw error;
  }
}

async function testGetAIDesigns() {
  console.log('\n📋 Testing AI Designs List...');

  try {
    const result = await apiRequest('/ai/designs?page=1&limit=10');

    console.log('✅ AI Designs retrieved successfully:');
    console.log(`   Found ${result.designs.length} designs`);
    console.log('   Page:', result.pagination.page, 'of', result.pagination.pages);

    if (result.designs.length > 0) {
      console.log('   First design:');
      console.log('     ID:', result.designs[0].id);
      console.log('     Status:', result.designs[0].status);
      console.log('     Created:', result.designs[0].createdAt);
    }

    return result.designs;
  } catch (error) {
    console.error('❌ Failed to get AI designs:', error.message);
    throw error;
  }
}

async function testGetAIDesign(designId) {
  console.log(`\n🔍 Testing AI Design Details (ID: ${designId})...`);

  try {
    const result = await apiRequest(`/ai/designs/${designId}`);

    console.log('✅ AI Design details retrieved:');
    console.log('   ID:', result.id);
    console.log('   Status:', result.status);
    console.log('   Requirements:', JSON.stringify(result.requirements, null, 2));
    console.log('   AI Model Version:', result.aiModelVersion);

    if (result.designResult) {
      console.log('   Design Result:', JSON.stringify(result.designResult, null, 2));
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to get AI design:', error.message);
    throw error;
  }
}

async function testUpdateAIDesign(designId) {
  console.log(`\n🔄 Testing AI Design Update (ID: ${designId})...`);

  const updateData = {
    designResult: {
      panels: {
        selected: { id: 1, maker: 'SunPower', model: 'SPR-X22-370' },
        quantity: 16,
        totalPower: 5920
      },
      inverter: {
        selected: { id: 1, maker: 'SMA', model: 'Sunny Boy 5.0' },
        quantity: 1,
        totalCapacity: 5000
      },
      cost: {
        total: 7500,
        equipment: 6000,
        installation: 1500
      }
    },
    equipmentSelections: {
      panelId: 1,
      inverterId: 1,
      mountingSystem: "roof-mounted",
      optimization: "power_optimizers"
    },
    systemConfiguration: {
      arrayConfiguration: "2 strings of 8 panels",
      orientation: "south",
      tilt: 30,
      estimatedProduction: 7200
    }
  };

  try {
    const result = await apiRequest(`/ai/designs/${designId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    console.log('✅ AI Design updated successfully:');
    console.log('   Status:', result.status);
    console.log('   Completed At:', result.completedAt);
    console.log('   Design Result:', JSON.stringify(result.designResult, null, 2));

    return result;
  } catch (error) {
    console.error('❌ Failed to update AI design:', error.message);
    throw error;
  }
}

async function testUserPreferences() {
  console.log('\n⚙️ Testing User AI Preferences...');

  const preferencesData = {
    equipmentPreferences: {
      panelBrands: ["SunPower", "LG", "Q Cells"],
      inverterBrands: ["SMA", "Fronius", "SolarEdge"],
      panelEfficiency: "high",
      warrantyPriority: "performance"
    },
    budgetPreferences: {
      priority: "value",
      maxBudgetPerWatt: 2.5,
      paybackPeriod: 10
    },
    brandPreferences: {
      premiumBrands: ["SunPower", "SolarEdge"],
      valueBrands: ["Canadian Solar", "Huawei"],
      excludedBrands: []
    },
    aestheticPreferences: {
      panelColor: "black",
      mountingPreference: "flush",
      visibilityPriority: "minimal"
    },
    performancePriorities: {
      topPriority: "efficiency",
      secondary: "reliability",
      tertiary: "cost"
    }
  };

  try {
    // First update preferences
    await apiRequest('/ai/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData)
    });

    // Then get preferences to verify
    const result = await apiRequest('/ai/user/preferences');

    console.log('✅ User AI Preferences retrieved:');
    console.log('   Equipment Preferences:', JSON.stringify(result.equipmentPreferences, null, 2));
    console.log('   Budget Preferences:', JSON.stringify(result.budgetPreferences, null, 2));

    return result;
  } catch (error) {
    console.error('❌ Failed to test user preferences:', error.message);
    throw error;
  }
}

async function testEnhancedEquipment() {
  console.log('\n🔧 Testing Enhanced Equipment Endpoints...');

  try {
    // Test enhanced panels (no auth required)
    const panelsResponse = await fetch(`${API_URL}/enhanced/pv-panels?includeAI=true`);
    const panels = await panelsResponse.json();

    console.log('✅ Enhanced PV Panels retrieved:');
    console.log(`   Found ${panels.length} panels`);

    if (panels.length > 0) {
      const firstPanel = panels[0];
      console.log('   First panel:', {
        id: firstPanel.id,
        maker: firstPanel.maker,
        model: firstPanel.model,
        maxPower: firstPanel.maxPower,
        hasAI: !!firstPanel.aiIntelligence
      });

      // Test panel intelligence
      if (firstPanel.id) {
        try {
          const intelligenceResponse = await fetch(`${API_URL}/ai/panels/${firstPanel.id}/intelligence`);
          const intelligence = await intelligenceResponse.json();

          console.log('✅ Panel Intelligence retrieved:');
          console.log('   Available:', intelligence.available);
          if (intelligence.available) {
            console.log('   Compatibility Score:', intelligence.compatibilityScore);
            console.log('   Reliability Rating:', intelligence.reliabilityRating);
          }
        } catch (error) {
          console.log('ℹ️ Panel intelligence not available (expected for test data)');
        }
      }
    }

    return panels;
  } catch (error) {
    console.error('❌ Failed to test enhanced equipment:', error.message);
    throw error;
  }
}

async function testCompatibilityAnalysis() {
  console.log('\n🔗 Testing Compatibility Analysis...');

  try {
    // Test with panel ID 1 and inverter ID 1
    const response = await fetch(`${API_URL}/ai/compatibility/panel/1/inverter/1`);
    const result = await response.json();

    console.log('✅ Compatibility Analysis retrieved:');
    console.log('   Panel ID:', result.panelId);
    console.log('   Inverter ID:', result.inverterId);
    console.log('   AI Analysis Available:', result.aiAnalysis.available);

    if (result.basicCompatibility) {
      console.log('   Basic Compatibility:');
      console.log('     Compatible:', result.basicCompatibility.compatible);
      console.log('     Score:', result.basicCompatibility.score);
      if (result.basicCompatibility.issues && result.basicCompatibility.issues.length > 0) {
        console.log('     Issues:', result.basicCompatibility.issues);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to test compatibility analysis:', error.message);
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting AI API Tests...');
  console.log('📍 API URL:', API_URL);
  console.log('🔑 Using token:', AUTH_TOKEN.substring(0, 20) + '...');

  let createdDesignId = null;

  try {
    // Test 1: Create AI Design
    createdDesignId = await testCreateAIDesign();

    // Test 2: Get AI Designs List
    await testGetAIDesigns();

    // Test 3: Get Specific AI Design
    await testGetAIDesign(createdDesignId);

    // Test 4: Update AI Design
    await testUpdateAIDesign(createdDesignId);

    // Test 5: User Preferences
    await testUserPreferences();

    // Test 6: Enhanced Equipment (no auth required)
    await testEnhancedEquipment();

    // Test 7: Compatibility Analysis (no auth required)
    await testCompatibilityAnalysis();

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 5000');
    console.log('2. Update AUTH_TOKEN with a valid JWT token');
    console.log('3. Check the database connection and migrations');
    console.log('4. Verify that you have existing PV panels and inverters in the database');
  }
}

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (error) {
  console.error('❌ node-fetch is required. Install it with: npm install node-fetch');
  process.exit(1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  apiRequest,
  testCreateAIDesign,
  testGetAIDesigns,
  testGetAIDesign,
  testUpdateAIDesign,
  testUserPreferences,
  testEnhancedEquipment,
  testCompatibilityAnalysis,
  runTests
};