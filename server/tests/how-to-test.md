# How to Test AI Endpoints

## Prerequisites

1. **Start the server:**
   ```bash
   cd /home/tayebd/apps/user_mgmt/server
   pnpm start
   ```

2. **Get a JWT authentication token:**
   - The AI endpoints require authentication
   - You need to log in through your app's authentication system
   - Get the JWT token from browser dev tools or auth response

3. **Test data is already seeded:**
   - PV Panel: SunPower SPR-X22-370 (370W) - ID: 20
   - Inverter: SMA Sunny Boy 5.0 (5000W) - ID: 21
   - AI intelligence data created for both

## Testing Methods

### Method 1: Using the Node.js Test Script

1. **Install node-fetch** (if not already installed):
   ```bash
   npm install node-fetch
   ```

2. **Update the AUTH_TOKEN** in `test-ai-endpoints.js`:
   ```javascript
   const AUTH_TOKEN = 'your-real-jwt-token-here';
   ```

3. **Run the comprehensive test:**
   ```bash
   node test-ai-endpoints.js
   ```

### Method 2: Using curl Commands

1. **Update AUTH_TOKEN** in `test-curl-commands.sh`:
   ```bash
   AUTH_TOKEN="your-real-jwt-token-here"
   ```

2. **Run the test script:**
   ```bash
   ./test-curl-commands.sh
   ```

### Method 3: Manual Testing

Replace `YOUR_JWT_TOKEN` with your actual token:

#### 1. Create AI Design (INSERT)
```bash
curl -X POST "http://localhost:5000/api/ai/designs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requirements": {
      "location": "Paris, France",
      "roofType": "tilted",
      "orientation": "south",
      "powerTarget": 6000,
      "budget": 8000,
      "constraints": ["shading", "space_limitation"]
    },
    "locationContext": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "climateZone": "Cfb",
      "solarIrradiance": 1230,
      "electricityPrice": 0.25,
      "feedInTariff": 0.10
    }
  }'
```

#### 2. Get AI Designs (GET - List)
```bash
curl -X GET "http://localhost:5000/api/ai/designs?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Get Specific AI Design (GET - Single)
```bash
curl -X GET "http://localhost:5000/api/ai/designs/DESIGN_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Update AI Design (UPDATE)
```bash
curl -X PUT "http://localhost:5000/api/ai/designs/DESIGN_ID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "designResult": {
      "panels": {
        "selected": { "id": 20, "maker": "SunPower", "model": "SPR-X22-370" },
        "quantity": 16,
        "totalPower": 5920
      },
      "inverter": {
        "selected": { "id": 21, "maker": "SMA", "model": "Sunny Boy 5.0" },
        "quantity": 1,
        "totalCapacity": 5000
      },
      "cost": {
        "total": 7500,
        "equipment": 6000,
        "installation": 1500
      }
    },
    "equipmentSelections": {
      "panelId": 20,
      "inverterId": 21,
      "mountingSystem": "roof-mounted",
      "optimization": "power_optimizers"
    },
    "systemConfiguration": {
      "arrayConfiguration": "2 strings of 8 panels",
      "orientation": "south",
      "tilt": 30,
      "estimatedProduction": 7200
    }
  }'
```

#### 5. Get Panel Intelligence
```bash
curl -X GET "http://localhost:5000/api/ai/panels/20/intelligence" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. Get Inverter Intelligence
```bash
curl -X GET "http://localhost:5000/api/ai/inverters/21/intelligence" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 7. Get Compatibility Analysis
```bash
curl -X GET "http://localhost:5000/api/ai/compatibility/panel/20/inverter/21" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 8. User Preferences (GET)
```bash
curl -X GET "http://localhost:5000/api/ai/user/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 9. User Preferences (UPDATE)
```bash
curl -X PUT "http://localhost:5000/api/ai/user/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "equipmentPreferences": {
      "panelBrands": ["SunPower", "LG", "Q Cells"],
      "inverterBrands": ["SMA", "Fronius", "SolarEdge"],
      "panelEfficiency": "high",
      "warrantyPriority": "performance"
    },
    "budgetPreferences": {
      "priority": "value",
      "maxBudgetPerWatt": 2.5,
      "paybackPeriod": 10
    }
  }'
```

## Expected Results

### AI Design Creation
- Returns design ID with status "PROCESSING"
- AI processing runs in background (currently simulated)

### AI Intelligence Data
- Panel intelligence includes efficiency ratings, performance data
- Inverter intelligence includes features and capabilities
- Compatibility analysis provides match scores and recommendations

### Database Schema
- All data is properly stored in separate AI tables
- Master equipment data remains clean
- Relations maintained through foreign keys

## Test Data Summary

**Equipment Data:**
- PV Panel ID: 20 (SunPower SPR-X22-370)
- Inverter ID: 21 (SMA Sunny Boy 5.0)

**AI Intelligence Available:**
- Panel intelligence with performance class "PREMIUM"
- Inverter intelligence with smart features
- Compatibility matrix with 94.5% overall score

## Troubleshooting

1. **401 Unauthorized:** Check your JWT token is valid
2. **404 Not Found:** Ensure server is running on port 5000
3. **500 Server Error:** Check server logs for database issues
4. **No data returned:** Run `node check-and-seed-data.js` to ensure test data exists