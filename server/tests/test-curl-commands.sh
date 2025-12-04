#!/bin/bash

# AI API Test Commands
# Make sure the server is running on port 5000 first
# Use: ./test-curl-commands.sh

API_URL="http://localhost:5000/api"
AUTH_TOKEN="your-jwt-token-here" # Replace with actual token

echo "🚀 Testing AI API Endpoints with curl"
echo "📍 API URL: $API_URL"
echo ""

# Helper function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    echo "📡 $method $endpoint"

    if [ -n "$data" ]; then
        curl -X "$method" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $AUTH_TOKEN" \
             -d "$data" \
             "$API_URL$endpoint" \
             -w "\nStatus: %{http_code}\n\n"
    else
        curl -X "$method" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $AUTH_TOKEN" \
             "$API_URL$endpoint" \
             -w "\nStatus: %{http_code}\n\n"
    fi
}

# Helper function for public endpoints (no auth)
make_public_request() {
    local method=$1
    local endpoint=$2

    echo "📡 $method $endpoint (public)"

    curl -X "$method" \
         -H "Content-Type: application/json" \
         "$API_URL$endpoint" \
         -w "\nStatus: %{http_code}\n\n"
}

echo "=== 1. Health Check ==="
make_public_request "GET" "/health"

echo "=== 2. Create AI Design ==="
DESIGN_DATA='{
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
make_request "POST" "/ai/designs" "$DESIGN_DATA"

echo "=== 3. Get AI Designs List ==="
make_request "GET" "/ai/designs?page=1&limit=5"

echo "=== 4. Get User AI Preferences ==="
make_request "GET" "/ai/user/preferences"

echo "=== 5. Update User AI Preferences ==="
PREFERENCES_DATA='{
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
  },
  "brandPreferences": {
    "premiumBrands": ["SunPower", "SolarEdge"],
    "valueBrands": ["Canadian Solar", "Huawei"],
    "excludedBrands": []
  },
  "aestheticPreferences": {
    "panelColor": "black",
    "mountingPreference": "flush",
    "visibilityPriority": "minimal"
  },
  "performancePriorities": {
    "topPriority": "efficiency",
    "secondary": "reliability",
    "tertiary": "cost"
  }
}'
make_request "PUT" "/ai/user/preferences" "$PREFERENCES_DATA"

echo "=== 6. Enhanced PV Panels (Public) ==="
make_public_request "GET" "/enhanced/pv-panels?includeAI=true"

echo "=== 7. Enhanced Single Panel (Public) ==="
make_public_request "GET" "/enhanced/pv-panels/1?includeAI=true"

echo "=== 8. Panel Intelligence (Public) ==="
make_public_request "GET" "/ai/panels/1/intelligence"

echo "=== 9. Inverter Intelligence (Public) ==="
make_public_request "GET" "/ai/inverters/1/intelligence"

echo "=== 10. Compatibility Analysis (Public) ==="
make_public_request "GET" "/ai/compatibility/panel/1/inverter/1"

echo "=== Test Complete ==="