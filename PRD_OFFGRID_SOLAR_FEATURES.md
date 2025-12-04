# Product Requirements Document (PRD)
## Off-Grid Solar PV System Design Features

**Version:** 1.0
**Date:** November 2024
**Author:** Development Team
**Status:** Draft

---

## 1. Executive Summary

This PRD outlines the development of comprehensive off-grid solar PV system design capabilities for the existing solar application. The features will enable users to design complete off-grid solar systems with battery storage, load management, and seasonal performance considerations, specifically optimized for cold climates.

**Business Objective:**
- Enable off-grid solar system design (mobile homes, cabins, RVs, emergency preparedness)
- Serve the growing off-grid market segment
- Provide battery sizing and load analysis tools
- Support cold climate optimization (Canadian winters)

**Key Outcomes:**
- Complete battery sizing calculator
- Load profile management with seasonal variations
- Off-grid system simulation
- Cold climate performance modeling
- Budget optimization tools

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
Enable any user to design, size, and document a complete off-grid solar PV system that works reliably in all seasons, including harsh Canadian winters, with professional-grade accuracy and comprehensive documentation.

### 2.2 Product Goals
1. **Battery Sizing**: Automatically calculate required battery capacity based on load and autonomy requirements
2. **Load Analysis**: Comprehensive appliance management with seasonal variations and critical load prioritization
3. **System Simulation**: Hour-by-hour energy balance with battery state tracking
4. **Cold Climate Optimization**: Snow effects, short days, heating loads, battery derating
5. **Documentation**: Professional reports with compliance verification

### 2.3 Success Metrics
- Battery sizing accuracy: >95%
- Load prediction accuracy: >90%
- Time to design complete system: <30 minutes
- User satisfaction: >4.5/5
- System reliability in winter: >95%

---

## 3. User Stories & Requirements

### 3.1 Primary User Story

**As an** off-grid mobile homeowner in north Toronto
**I want to** design a complete solar system with battery storage
**So that** I can power A/C in summer, heat trace in winter, and all appliances without grid connection
**Given** my budget is constrained
**When** I complete the design wizard
**Then** I receive a complete bill of materials, performance simulation, and installation guide

**Pain Points:**
- Uncertain what components to buy
- Don't know how much battery storage needed
- Overwhelmed by marketplace options
- Need assurance system works in winter with only 8-9 hours of daylight
- Need DIY installation guidance

### 3.2 Key User Stories

#### Story 1: Battery Sizing
**As a** user designing an off-grid system
**I want to** input my daily energy consumption and required backup days
**So that** I can get the exact battery capacity needed
**Acceptance Criteria:**
- [ ] Input daily consumption in kWh
- [ ] Select days of autonomy (1-30 days)
- [ ] Choose battery chemistry (Lithium, AGM, FLA)
- [ ] Get recommended capacity with 20% margin
- [ ] See battery count and configuration
- [ ] Receive cost estimate

#### Story 2: Load Management
**As a** user
**I want to** add all my appliances with power consumption and operating hours
**So that** the system can accurately size my components
**Acceptance Criteria:**
- [ ] Select from 15+ pre-defined appliances
- [ ] Add custom appliances with power ratings
- [ ] Set seasonal variations (winter/summer)
- [ ] Mark critical loads (refrigerator, lights, medical devices)
- [ ] See total daily consumption
- [ ] View peak power demand

#### Story 3: Off-Grid Simulation
**As a** user
**I want to** simulate my complete system for a full year
**So that** I can verify it works in all conditions
**Acceptance Criteria:**
- [ ] Hour-by-hour energy balance
- [ ] Battery SOC tracking
- [ ] Load shedding when battery low
- [ ] Monthly/seasonal performance reports
- [ ] Winter performance with 8-9 hour days
- [ ] Critical load prioritization

#### Story 4: Cold Climate Optimization
**As a** Canadian user
**I want to** account for winter challenges (cold, snow, short days)
**So that** my system works reliably year-round
**Acceptance Criteria:**
- [ ] Battery capacity derating at -20°C
- [ ] Snow coverage effects on panels
- [ ] Winter heating loads (heat trace, backup heating)
- [ ] Short daylight calculations (December)
- [ ] Cold weather PV efficiency gains

#### Story 5: Budget Optimization
**As a** cost-conscious user
**I want to** optimize my system within budget constraints
**So that** I get maximum value for my investment
**Acceptance Criteria:**
- [ ] Set maximum budget
- [ ] Get optimized design within budget
- [ ] See cost breakdown (panels, batteries, inverter, etc.)
- [ ] View phased installation options
- [ ] Compare alternatives

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                           │
├─────────────────────────────────────────────────────────────────┤
│  Off-Grid Wizard      │  Battery Sizing    │  Load Analyzer    │
│  ├─ Location          │  ├─ Daily Load     │  ├─ Appliances    │
│  ├─ Load Profile      │  ├─ Days Backup    │  ├─ Seasonal      │
│  ├─ Battery Config    │  ├─ Chemistry      │  ├─ Critical      │
│  ├─ Results           │  ├─ Cost Est.      │  └─ Analysis      │
└────────────────────────┴───────────────────┴───────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  /api/offgrid/*        │  /api/battery/*    │  /api/load/*      │
│  ├─ simulate-year      │  ├─ size           │  ├─ analyze       │
│  ├─ simulate-day       │  ├─ validate       │  ├─ appliances    │
│  └─ configure          │  └─ cost           │  └─ optimize      │
└────────────────────────┴───────────────────┴───────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Python Simulation (PVLib)                      │
├─────────────────────────────────────────────────────────────────┤
│  PV Production     │  Battery Modeling   │  Energy Balance     │
│  ├─ pvlib.Location │  ├─ PVBatBank       │  ├─ Hourly Sim      │
│  ├─ pvlib.PVSystem │  ├─ PVBattery       │  ├─ SOC Tracking    │
│  └─ pvlib.ModelChn │  └─ Charge Control  │  └─ Load Balance    │
└─────────────────────────────────────────┴───────────────────────┘
```

### 4.2 Technology Stack

**Backend:**
- Python 3.10+
- **PVLib** for PV production modeling
- FastAPI for API endpoints
- Pydantic for data validation
- NumPy/Pandas for calculations

**Frontend:**
- Next.js 15 (existing)
- React components (existing)
- Recharts for visualizations (existing)

**Database:**
- PostgreSQL (existing)
- Prisma ORM (existing)

### 4.3 Data Flow

```
1. User Input (Frontend)
   ↓
2. Validate Input (API)
   ↓
3. Save to Database (Prisma)
   ↓
4. Run Simulation (Python/PVLib)
   ↓
5. Calculate Battery/Load (Python)
   ↓
6. Generate Results (API)
   ↓
7. Display to User (Frontend)
```

---

## 5. Feature Specifications

### Feature 1: Battery Sizing Calculator

**Description:**
Calculate required battery capacity based on daily consumption, autonomy days, and battery chemistry.

**API Endpoint:** `POST /api/battery/size`

**Request:**
```json
{
  "daily_consumption_kwh": 8.5,
  "days_of_autonomy": 3,
  "peak_power_kw": 2.5,
  "battery_chemistry": "LITHIUM",
  "max_dod": 0.8,
  "cold_weather_factor": 0.8,
  "location_temperature_c": -20
}
```

**Response:**
```json
{
  "required_capacity_kwh": 12.6,
  "recommended_capacity_kwh": 15.0,
  "battery_count": 12,
  "peak_current_amps": 156.25,
  "estimated_cost_usd": 7500,
  "days_of_autonomy": 3.0,
  "recommendations": [
    "Use LITHIUM batteries for best performance",
    "System voltage: 48V recommended for efficiency",
    "Add battery monitoring system",
    "Install in temperature-controlled environment"
  ]
}
```

**Implementation Details:**
- Calculate effective capacity (load / DOD)
- Apply round-trip efficiency (95% Li, 90% Lead-acid)
- Apply cold weather derating
- Add 20% safety margin
- Calculate battery count for 48V system
- Estimate cost ($500/kWh Li, $150/kWh Lead-acid)

**Dependencies:**
- Database models for battery types
- Cost estimation data
- Cold climate factors

### Feature 2: Load Profile Management

**Description:**
Create and manage appliance load profiles with seasonal variations and critical load identification.

**API Endpoint:** `POST /api/load/profile`

**Request:**
```json
{
  "appliances": [
    {
      "appliance_name": "Refrigerator",
      "power_watts": 125,
      "hours_per_day": 24,
      "quantity": 1,
      "is_critical": true,
      "mode": "AC",
      "seasonal_factor": {
        "winter": 1.1,
        "summer": 1.2,
        "spring": 1.0,
        "fall": 1.0
      }
    },
    {
      "appliance_name": "Heat Trace (Pipes)",
      "power_watts": 400,
      "hours_per_day": 24,
      "quantity": 1,
      "is_critical": true,
      "mode": "AC",
      "seasonal_factor": {
        "winter": 1.0,
        "summer": 0.0,
        "spring": 0.5,
        "fall": 1.0
      }
    },
    {
      "appliance_name": "A/C Unit",
      "power_watts": 800,
      "hours_per_day": 8,
      "quantity": 1,
      "is_critical": false,
      "mode": "AC",
      "seasonal_factor": {
        "winter": 0.0,
        "summer": 1.0,
        "spring": 0.3,
        "fall": 0.3
      }
    }
  ],
  "include_heating": true,
  "include_cooling": true
}
```

**Response:**
```json
{
  "total_daily_consumption_kwh": 8.3,
  "peak_power_watts": 1325,
  "critical_loads_count": 2,
  "seasonal_variation": {
    "winter": 9.1,
    "summer": 10.2,
    "spring": 7.8,
    "fall": 8.3
  },
  "critical_loads_daily_kwh": 5.2,
  "recommendations": [
    "Consider efficient refrigerator (Energy Star)",
    "Heat trace only needed in winter (auto-switching recommended)",
    "High summer load - consider energy efficiency measures"
  ]
}
```

**Implementation Details:**
- Store appliance database (15+ pre-defined appliances)
- Calculate seasonal variations
- Identify critical loads
- Calculate peak power demand
- Estimate costs and recommendations

**Pre-defined Appliances:**
```python
APPLIANCE_DATABASE = {
    'Refrigerator': {'power': 125, 'hours': 24, 'critical': True},
    'LED Lights': {'power': 60, 'hours': 6, 'critical': True},
    'Water Pump': {'power': 750, 'hours': 2, 'critical': True},
    'Heat Trace (Pipes)': {'power': 400, 'hours': 24, 'seasonal': 'winter'},
    'A/C Unit': {'power': 800, 'hours': 8, 'seasonal': 'summer'},
    # ... 10+ more
}
```

### Feature 3: Off-Grid System Simulation

**Description:**
Run complete off-grid system simulation with hourly energy balance, battery SOC tracking, and performance analysis.

**API Endpoint:** `POST /api/offgrid/simulate-year`

**Request:**
```json
{
  "site": {
    "latitude": 43.65,
    "longitude": -79.38,
    "altitude": 100,
    "timezone": "America/Toronto",
    "albedo": 0.25
  },
  "panel": {
    "max_power": 400,
    "open_circuit_voltage": 50,
    "short_circuit_current": 10,
    "voltage_at_pmax": 40,
    "current_at_pmax": 10,
    "temp_coeff_voc": -0.003,
    "temp_coeff_isc": 0.0005
  },
  "array": {
    "modules_per_string": 8,
    "strings_in_parallel": 4,
    "tilt_angle": 35,
    "azimuth_angle": 180,
    "mounting_height": 2.0,
    "ground_coverage_ratio": 0.3
  },
  "inverter": {
    "nominal_output_power": 8000,
    "max_dc_voltage": 600,
    "max_input_current": 40,
    "efficiency": 0.96
  },
  "battery": {
    "capacity_kwh": 25,
    "voltage_system": 48,
    "round_trip_efficiency": 0.95,
    "max_discharge_rate": 1.0,
    "max_charge_rate": 0.5,
    "cold_weather_derating": 0.80,
    "calendar_life_years": 10,
    "cycle_life_at_80_dod": 5000
  },
  "load_profile": {
    "appliances": [...],
    "include_heating": true
  },
  "offgrid_config": {
    "is_offgrid": true,
    "days_of_autonomy": 3,
    "min_soc": 0.20,
    "critical_loads_only": false,
    "battery_chemistry": "LITHIUM"
  },
  "year": 2023,
  "cold_climate_mode": true
}
```

**Response:**
```json
{
  "success": true,
  "annual_pv_production_kwh": 4250,
  "annual_load_consumption_kwh": 3100,
  "capacity_factor_percent": 19.8,
  "performance_ratio_percent": 82.5,
  "battery_metrics": {
    "min_soc_percent": 22.5,
    "max_soc_percent": 98.0,
    "avg_soc_percent": 75.3,
    "battery_cycles": 284,
    "energy_charged_kwh": 3850,
    "energy_discharged_kwh": 3658,
    "battery_efficiency_percent": 95.0,
    "estimated_life_years": 8.5
  },
  "energy_balance": {
    "total_pv_production_kwh": 4250,
    "total_load_consumption_kwh": 3100,
    "energy_from_battery_kwh": 850,
    "energy_to_battery_kwh": 1150,
    "unmet_load_kwh": 0,
    "load_served_percent": 100.0,
    "system_efficiency_percent": 73.0,
    "self_consumption_percent": 52.9
  },
  "monthly_pv_production": {
    "1": 285, "2": 320, "3": 380, "4": 420, "5": 465,
    "6": 485, "7": 480, "8": 445, "9": 390, "10": 340, "11": 295, "12": 275
  },
  "monthly_load_consumption": {
    "1": 330, "2": 310, "3": 280, "4": 260, "5": 270,
    "6": 290, "7": 300, "8": 295, "9": 260, "10": 265, "11": 280, "12": 340
  },
  "hourly_production": [...], // 8760 values
  "hourly_consumption": [...], // 8760 values
  "hourly_soc": [...] // 8760 values
}
```

**Implementation Details:**
- Use PVLib for PV production modeling
- Implement hourly energy balance
- Track battery SOC (0-100%)
- Handle charging/discharging
- Apply load shedding logic
- Calculate seasonal performance
- Generate monthly/daily aggregates

### Feature 4: Cold Climate Performance Model

**Description:**
Optimize system performance for cold climates including battery derating, snow effects, and seasonal variations.

**API Endpoint:** `POST /api/offgrid/cold-climate-analysis`

**Request:**
```json
{
  "latitude": 43.65,
  "province": "ON",
  "battery_type": "LITHIUM",
  "panel_tilt": 35,
  "snow_depth_cm": 10
}
```

**Response:**
```json
{
  "winter_performance": {
    "battery_factor": 0.80,
    "snow_factor": 0.91,
    "pv_gain_factor": 1.08,
    "daylight_factor": 0.68,
    "overall_winter_factor": 0.64,
    "expected_capacity_loss_percent": 36.0
  },
  "canadian_winter_conditions": {
    "avg_temp_c": -10,
    "min_temp_c": -25,
    "daylight_hours_dec": 8.5
  },
  "heating_loads": {
    "heat_trace_pipes_watts": 400,
    "heat_loss_envelope_watts": 1200,
    "total_heating_kw": 1.6,
    "daily_heating_kwh": 38.4
  },
  "recommendations": [
    "Oversize battery by 40% for winter capacity",
    "Use heated battery enclosure",
    "Panel tilt >= 30° for snow shedding",
    "Insulate pipes well to reduce heat trace load"
  ]
}
```

**Implementation Details:**
- Battery capacity derating at low temperatures
- Snow coverage effects on panels
- Cold weather PV efficiency gains
- Winter heating loads
- Short daylight calculations

### Feature 5: Budget Optimization

**Description:**
Optimize system design within budget constraints with phased installation options.

**API Endpoint:** `POST /api/offgrid/optimize-budget`

**Request:**
```json
{
  "budget": 15000,
  "daily_consumption_kwh": 8.5,
  "priority": "cost",
  "location": {"lat": 43.65, "lon": -79.38},
  "min_days_autonomy": 2
}
```

**Response:**
```json
{
  "optimized_design": {
    "panels": {
      "count": 16,
      "power_each_w": 400,
      "total_power_w": 6400,
      "cost": 4800
    },
    "battery": {
      "capacity_kwh": 12,
      "chemistry": "AGM",
      "cost": 3600
    },
    "inverter": {
      "power_w": 6000,
      "cost": 1800
    },
    "other": {
      "mounting": 1200,
      "wiring": 800,
      "installation": 2000
    },
    "total_cost": 14200
  },
  "phased_installation": {
    "phase_1": {
      "cost": 8500,
      "description": "Basic system (8 panels, 8kWh battery)",
      "power_kw": 3.2,
      "battery_kwh": 8
    },
    "phase_2": {
      "cost": 5700,
      "description": "Expansion (8 panels, 4kWh battery)",
      "additional_power_kw": 3.2,
      "additional_battery_kwh": 4
    }
  },
  "trade_offs": {
    "cost_vs_performance": "Lower upfront cost, lower performance",
    "lithium_vs_agm": "AGM saves $2000 but requires more space",
    "battery_vs_generator": "Generator backup costs $3000 but provides unlimited power"
  }
}
```

---

## 6. Development Plan & Timeline

### Phase 1: Foundation & Infrastructure (Weeks 1-2)

**Goal:** Set up basic off-grid infrastructure

**Tasks:**
- [ ] **Week 1, Day 1-2:** Database schema design for off-grid features
  - Create Battery model tables
  - Create LoadProfile model tables
  - Create OffGridProject model
  - Set up relationships

- [ ] **Week 1, Day 3-4:** Integrate PVLib into pvlib_api
  - Install pvlib-python package
  - Create PVLibAdapter class
  - Test basic PV production simulation
  - Verify solar position calculations

- [ ] **Week 1, Day 5:** Battery sizing endpoint
  - Implement `/api/battery/size` endpoint
  - Create BatterySizingRequest/Response models
  - Write battery sizing algorithm
  - Test with sample data

- [ ] **Week 2, Day 1-2:** Load profile endpoint
  - Implement `/api/load/profile` endpoint
  - Create appliance database
  - Implement seasonal load calculations
  - Add critical load identification

- [ ] **Week 2, Day 3-4:** API integration
  - Connect frontend to new endpoints
  - Create React components for battery sizing
  - Create React components for load profile
  - Test data flow

- [ ] **Week 2, Day 5:** Testing and documentation
  - Unit tests for battery sizing
  - Unit tests for load calculations
  - API documentation
  - Code review

**Deliverables:**
- Database schema implemented
- PVLib integration complete
- Battery sizing API functional
- Load profile API functional
- Basic frontend components
- Unit test coverage >80%

**Dependencies:**
- None (foundation)

---

### Phase 2: Core Simulation Engine (Weeks 3-4)

**Goal:** Build energy balance simulation engine

**Tasks:**
- [ ] **Week 3, Day 1-2:** OffGridSimulator class
  - Create OffGridSimulator in pvlib_api
  - Implement energy balance algorithm
  - Track battery SOC
  - Handle charging/discharging

- [ ] **Week 3, Day 3-4:** PV production integration
  - Use PVLib for PV production
  - Integrate with energy balance
  - Calculate hourly production
  - Test with sample data

- [ ] **Week 3, Day 5:** Load consumption integration
  - Implement hourly load calculations
  - Seasonal variations
  - Critical load prioritization
  - Load shedding logic

- [ ] **Week 4, Day 1-2:** Annual simulation endpoint
  - Implement `/api/offgrid/simulate-year`
  - 8,760 hourly calculations
  - Monthly/daily aggregation
  - Performance metrics

- [ ] **Week 4, Day 3-4:** Results visualization
  - Frontend charts (hourly, daily, monthly)
  - Battery SOC graph
  - Energy balance chart
  - Performance dashboard

- [ ] **Week 4, Day 5:** Testing
  - Integration tests
  - Validation against known systems
  - Performance optimization
  - Bug fixes

**Deliverables:**
- OffGridSimulator implementation
- Complete year simulation functional
- Energy balance tracking
- Performance visualization
- Integration tests passing

**Dependencies:**
- Phase 1 completed
- PVLib integration working

---

### Phase 3: Cold Climate Features (Week 5)

**Goal:** Optimize for Canadian winter conditions

**Tasks:**
- [ ] **Week 5, Day 1-2:** ColdClimateModel implementation
  - Battery derating at low temperatures
  - Snow loss on panels
  - Cold weather PV gains
  - Short daylight calculations

- [ ] **Week 5, Day 3:** Heating loads
  - Heat trace calculations
  - Space heating estimates
  - Insulation factors
  - Seasonal adjustments

- [ ] **Week 5, Day 4:** Canadian winter analysis
  - Province-specific conditions
  - December daylight hours
  - Temperature profiles
  - Snow depth considerations

- [ ] **Week 5, Day 5:** Cold climate API
  - `/api/offgrid/cold-climate-analysis`
  - Frontend integration
  - Recommendations engine
  - Testing and validation

**Deliverables:**
- ColdClimateModel implemented
- Heating load calculations
- Winter performance analysis
- Cold climate API functional
- Canadian climate optimization

**Dependencies:**
- Phase 2 completed
- Energy balance working

---

### Phase 4: Advanced Features (Week 6)

**Goal:** Budget optimization and advanced tools

**Tasks:**
- [ ] **Week 6, Day 1-2:** Budget optimization
  - Cost-constrained design algorithm
  - Phase installation planning
  - Trade-off analysis
  - Alternative configurations

- [ ] **Week 6, Day 3:** Generator backup
  - Backup generator modeling
  - Fuel consumption calculations
  - Auto-start logic
  - Hybrid system simulation

- [ ] **Week 6, Day 4:** Load prioritization
  - Smart load management
  - Critical load definition
  - Load shedding strategies
  - Priority-based power allocation

- [ ] **Week 6, Day 5:** Advanced reporting
  - Professional PDF reports
  - Compliance certificates
  - Installation guides
  - Performance warranties

**Deliverables:**
- Budget optimization functional
- Generator backup capability
- Load prioritization system
- Professional reporting

**Dependencies:**
- Phase 3 completed
- Cold climate features working

---

### Phase 5: Testing & Documentation (Week 7)

**Goal:** Comprehensive testing and documentation

**Tasks:**
- [ ] **Week 7, Day 1-2:** Unit tests
  - Test all API endpoints
  - Test calculation accuracy
  - Test error handling
  - Achieve >90% coverage

- [ ] **Week 7, Day 3:** Integration tests
  - End-to-end workflow tests
  - Database integration
  - API integration
  - Frontend-backend integration

- [ ] **Week 7, Day 4:** User acceptance testing
  - Test with real user scenarios
  - Validate battery sizing accuracy
  - Validate load predictions
  - Gather feedback

- [ ] **Week 7, Day 5:** Documentation
  - API documentation
  - User guides
  - Developer documentation
  - Code comments

**Deliverables:**
- Complete test suite
- >90% test coverage
- Documentation complete
- UAT feedback addressed

**Dependencies:**
- All features implemented

---

### Phase 6: Launch Preparation (Week 8)

**Goal:** Production deployment and launch

**Tasks:**
- [ ] **Week 8, Day 1-2:** Performance optimization
  - Optimize simulation speed
  - Caching implementation
  - Database optimization
  - Load testing

- [ ] **Week 8, Day 3:** Security review
  - API security audit
  - Input validation
  - Rate limiting
  - Authentication

- [ ] **Week 8, Day 4:** Deployment
  - Production deployment
  - Database migration
  - Monitoring setup
  - Backup verification

- [ ] **Week 8, Day 5:** Launch
  - Feature announcement
  - User onboarding
  - Support documentation
  - Monitoring and maintenance

**Deliverables:**
- Production deployment
- Performance optimized
- Security verified
- Launch ready

**Dependencies:**
- All testing completed
- Documentation complete

---

## 7. API Specifications

### 7.1 Battery Sizing

**Endpoint:** `POST /api/battery/size`

**Description:** Calculate required battery capacity for off-grid system

**Parameters:**
- `daily_consumption_kwh` (float, required): Daily energy consumption
- `days_of_autonomy` (int, required): Required backup days (1-30)
- `peak_power_kw` (float, required): Peak power requirement
- `battery_chemistry` (string, required): Battery type (LITHIUM, AGM, FLA)
- `max_dod` (float, optional): Maximum depth of discharge (0.3-0.95)
- `cold_weather_factor` (float, optional): Cold climate derating factor
- `location_temperature_c` (float, optional): Lowest ambient temperature

**Response:**
- `required_capacity_kwh` (float): Minimum required capacity
- `recommended_capacity_kwh` (float): Recommended capacity with margin
- `battery_count` (int): Number of batteries needed
- `peak_current_amps` (float): Peak current draw
- `estimated_cost_usd` (int): Estimated system cost
- `days_of_autonomy` (float): Actual autonomy days
- `recommendations` (array): List of recommendations

**Validation Rules:**
- daily_consumption_kwh: > 0 and < 100
- days_of_autonomy: 1-30
- peak_power_kw: > 0 and < 50
- battery_chemistry: One of ["LITHIUM", "AGM", "FLA"]
- max_dod: 0.3-0.95

### 7.2 Load Profile

**Endpoint:** `POST /api/load/profile`

**Description:** Analyze load profile and provide recommendations

**Parameters:**
- `appliances` (array, required): List of appliances
  - `appliance_name` (string): Name/type
  - `power_watts` (float): Power consumption in watts
  - `hours_per_day` (float): Hours of operation per day
  - `quantity` (int): Number of appliances
  - `is_critical` (bool): Critical load flag
  - `mode` (string): Power type (AC or DC)
  - `seasonal_factor` (object): Seasonal multipliers
- `include_heating` (bool): Include heating loads
- `include_cooling` (bool): Include cooling loads

**Response:**
- `total_daily_consumption_kwh` (float): Total daily energy use
- `peak_power_watts` (float): Peak power demand
- `critical_loads_count` (int): Number of critical loads
- `seasonal_variation` (object): Load by season
- `critical_loads_daily_kwh` (float): Critical load consumption
- `recommendations` (array): Energy efficiency suggestions

### 7.3 Off-Grid Simulation

**Endpoint:** `POST /api/offgrid/simulate-year`

**Description:** Run complete off-grid system simulation for one year

**Parameters:**
- `site` (object): Site configuration (latitude, longitude, timezone, etc.)
- `panel` (object): Panel specifications
- `array` (object): Array configuration
- `inverter` (object): Inverter specifications
- `battery` (object): Battery configuration
- `load_profile` (object): Load profile
- `offgrid_config` (object): Off-grid settings
- `year` (int): Simulation year
- `cold_climate_mode` (bool): Apply cold climate adjustments

**Response:**
- `success` (bool): Simulation success status
- `annual_pv_production_kwh` (float): Total annual production
- `annual_load_consumption_kwh` (float): Total annual consumption
- `capacity_factor_percent` (float): System capacity factor
- `performance_ratio_percent` (float): Performance ratio
- `battery_metrics` (object): Battery performance data
- `energy_balance` (object): Energy balance analysis
- `monthly_pv_production` (object): Monthly production breakdown
- `monthly_load_consumption` (object): Monthly consumption breakdown
- `hourly_production` (array): Hourly production (8760 values)
- `hourly_consumption` (array): Hourly consumption (8760 values)
- `hourly_soc` (array): Battery SOC (8760 values)

### 7.4 Cold Climate Analysis

**Endpoint:** `POST /api/offgrid/cold-climate-analysis`

**Description:** Analyze system performance in cold climates

**Parameters:**
- `latitude` (float): Site latitude
- `province` (string): Canadian province code
- `battery_type` (string): Battery chemistry
- `panel_tilt` (float): Panel tilt angle
- `snow_depth_cm` (float): Expected snow depth

**Response:**
- `winter_performance` (object): Winter performance factors
- `canadian_winter_conditions` (object): Typical conditions
- `heating_loads` (object): Heating load estimates
- `recommendations` (array): Cold climate recommendations

---

## 8. Database Schema

### 8.1 New Tables

#### BatteryBank
```sql
CREATE TABLE BatteryBank (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    capacity_kwh DECIMAL(10,2) NOT NULL,
    voltage_system INTEGER NOT NULL,
    chemistry VARCHAR(50) NOT NULL,
    round_trip_efficiency DECIMAL(5,4),
    max_discharge_rate DECIMAL(5,2),
    max_charge_rate DECIMAL(5,2),
    cold_weather_derating DECIMAL(5,4),
    calendar_life_years INTEGER,
    cycle_life_at_80_dod INTEGER,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    cost_per_kwh DECIMAL(10,2),
    warranty_years INTEGER
);
```

#### LoadProfile
```sql
CREATE TABLE LoadProfile (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name VARCHAR(100) NOT NULL,
    total_daily_consumption_kwh DECIMAL(10,2),
    peak_power_watts DECIMAL(10,2),
    critical_loads_count INTEGER,
    seasonal_variation JSONB,
    user_id INTEGER REFERENCES User(id),
    organization_id INTEGER REFERENCES Organization(id)
);
```

#### LoadAppliance
```sql
CREATE TABLE LoadAppliance (
    id SERIAL PRIMARY KEY,
    load_profile_id INTEGER REFERENCES LoadProfile(id),
    appliance_name VARCHAR(100) NOT NULL,
    power_watts DECIMAL(10,2) NOT NULL,
    hours_per_day DECIMAL(5,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    mode VARCHAR(10) NOT NULL DEFAULT 'AC',
    seasonal_factor JSONB,
    start_hour INTEGER DEFAULT 0,
    end_hour INTEGER DEFAULT 23
);
```

#### OffGridProject
```sql
CREATE TABLE OffGridProject (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES User(id),
    location_latitude DECIMAL(10,6),
    location_longitude DECIMAL(10,6),
    location_province VARCHAR(10),
    system_size_kw DECIMAL(10,2),
    battery_capacity_kwh DECIMAL(10,2),
    daily_consumption_kwh DECIMAL(10,2),
    days_of_autonomy INTEGER,
    battery_chemistry VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    configuration JSONB,
    simulation_results JSONB,
    total_cost_estimate DECIMAL(12,2)
);
```

### 8.2 Existing Tables to Modify

#### PVProject (add off-grid fields)
```sql
ALTER TABLE PVProject ADD COLUMN IF NOT EXISTS is_offgrid BOOLEAN DEFAULT FALSE;
ALTER TABLE PVProject ADD COLUMN IF NOT EXISTS battery_capacity_kwh DECIMAL(10,2);
ALTER TABLE PVProject ADD COLUMN IF NOT EXISTS days_of_autonomy INTEGER;
ALTER TABLE PVProject ADD COLUMN IF NOT EXISTS min_soc DECIMAL(5,4) DEFAULT 0.20;
ALTER TABLE PVProject ADD COLUMN IF NOT EXISTS critical_loads_only BOOLEAN DEFAULT FALSE;
```

---

## 9. Frontend Components

### 9.1 New Components

#### BatterySizer
**File:** `client/src/components/battery/BatterySizer.tsx`
**Props:**
- `onSizeCalculated` (callback)
- `defaultDailyLoad` (number)

**Features:**
- Input daily consumption
- Select autonomy days
- Choose battery chemistry
- Display results with recommendations
- Show cost estimate

#### LoadProfileBuilder
**File:** `client/src/components/load/LoadProfileBuilder.tsx`
**Props:**
- `onProfileComplete` (callback)

**Features:**
- Add/remove appliances
- Set power and hours
- Mark critical loads
- Seasonal variations
- Calculate totals

#### OffGridWizard
**File:** `client/src/components/offgrid/OffGridWizard.tsx`
**Props:**
- None

**Steps:**
1. Location & Site
2. Load Profile
3. Battery Configuration
4. System Simulation
5. Results & Report

#### ColdClimateAnalyzer
**File:** `client/src/components/coldclimate/ColdClimateAnalyzer.tsx`
**Props:**
- `systemConfig` (object)

**Features:**
- Winter performance analysis
- Heating load calculator
- Snow effect assessment
- Recommendations

#### BudgetOptimizer
**File:** `client/src/components/budget/BudgetOptimizer.tsx`
**Props:**
- `budget` (number)
- `onOptimizationComplete` (callback)

**Features:**
- Set budget constraint
- Optimize system design
- Show trade-offs
- Phased installation options

### 9.2 Enhanced Components

#### Enhanced ProjectWizard
**Add new step:** "Off-Grid Configuration"
- Battery sizing
- Days of autonomy
- Critical loads
- Cold climate mode

#### Enhanced Dashboard
**Add new metrics:**
- Off-grid system count
- Average battery size
- Cold climate installations
- Budget optimization usage

---

## 10. Testing Strategy

### 10.1 Unit Tests (Target: 90% Coverage)

#### Battery Sizing Tests
```typescript
describe('BatterySizer', () => {
  test('calculates capacity for 3 days autonomy', () => {
    const result = calculateBatterySize({
      daily_consumption_kwh: 5.0,
      days_of_autonomy: 3,
      battery_chemistry: 'LITHIUM'
    });
    expect(result.required_capacity_kwh).toBeGreaterThan(0);
  });

  test('applies cold weather derating', () => {
    // Test cold climate calculation
  });

  test('validates input parameters', () => {
    // Test validation rules
  });
});
```

#### Load Profile Tests
```typescript
describe('LoadProfile', () => {
  test('calculates total daily consumption', () => {
    // Test calculation
  });

  test('applies seasonal variations', () => {
    // Test seasonal factors
  });

  test('identifies critical loads', () => {
    // Test critical load detection
  });
});
```

#### Simulation Tests
```typescript
describe('OffGridSimulator', () => {
  test('simulates annual production', () => {
    // Test full year simulation
  });

  test('tracks battery SOC', () => {
    // Test SOC tracking
  });

  test('handles energy balance', () => {
    // Test charging/discharging
  });
});
```

### 10.2 Integration Tests

#### API Integration
- Test all endpoints with valid requests
- Test error handling
- Test validation
- Test rate limiting

#### End-to-End Workflow
- Complete off-grid design flow
- Battery sizing → Load profile → Simulation
- Cold climate analysis workflow
- Budget optimization workflow

### 10.3 Performance Tests

#### Simulation Performance
- Full year simulation: <3 seconds
- Battery sizing: <1 second
- Load analysis: <1 second

#### Load Testing
- 10 concurrent simulations
- Database performance
- API response times

### 10.4 Validation Tests

#### Accuracy Validation
- Compare battery sizing to manual calculations
- Validate PV production with PVLib reference
- Test energy balance closure

#### User Acceptance Testing
- Test with real user scenarios
- Validate usability
- Gather feedback

---

## 11. Success Criteria

### 11.1 Technical Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Battery sizing accuracy | >95% | Compare to manual calculations |
| Load prediction accuracy | >90% | Compare to actual consumption |
| Simulation speed | <3 seconds | Full year simulation |
| API response time | <1 second | Battery sizing endpoint |
| Test coverage | >90% | Code coverage tools |
| Uptime | >99.9% | Production monitoring |

### 11.2 User Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to design system | <30 minutes | User testing |
| Task completion rate | >80% | Analytics |
| User satisfaction | >4.5/5 | Surveys |
| Error rate | <5% | Error tracking |
| Support tickets | <10/month | Support system |

### 11.3 Business Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| New user acquisition | +30% | User analytics |
| Feature adoption | >60% | Usage analytics |
| Conversion rate | +15% | Business metrics |
| Revenue increase | +25% | Financial reports |
| Market expansion | Off-grid segment | Market analysis |

---

## 12. Risks & Mitigation

### 12.1 Technical Risks

#### Risk 1: PVLib Integration Complexity
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Start with simple PV production
- Test incrementally
- Have fallback to custom model
- Leverage PVLib community

#### Risk 2: Battery Modeling Accuracy
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Validate against manufacturer specs
- Test with real systems
- Conservative sizing (add margin)
- Continuous improvement

#### Risk 3: Performance at Scale
**Probability:** Low
**Impact:** High
**Mitigation:**
- Optimize algorithms
- Implement caching
- Use database indexing
- Monitor performance

### 12.2 Project Risks

#### Risk 4: Timeline Delays
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Phased delivery
- Prioritize MVP features
- Regular progress reviews
- Buffer time in schedule

#### Risk 5: Resource Constraints
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Clear scope definition
- Prioritize features
- Leverage existing code
- Consider contractors

### 12.3 Market Risks

#### Risk 6: Low User Adoption
**Probability:** Low
**Impact:** High
**Mitigation:**
- User research
- MVP approach
- Iterate based on feedback
- Marketing campaign

#### Risk 7: Competition
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Unique features (cold climate)
- Superior UX
- Fast iteration
- Community building

---

## 13. Open Questions & Decisions

### 13.1 Technical Decisions

**Q1: Should we use PVLib or build custom PV models?**
**Decision:** Use PVLib for PV production (confirmed)
**Rationale:** Saves 5-6 weeks, more accurate, better maintenance

**Q2: Battery chemistry support level?**
**Decision:** Support LITHIUM, AGM, and FLA
**Rationale:** Covers 95% of off-grid market

**Q3: Minimum system voltage?**
**Decision:** Support 12V, 24V, and 48V
**Rationale:** Standard voltages in off-grid systems

### 13.2 Product Decisions

**Q4: Should we include generator backup?**
**Decision:** Yes, as optional feature
**Rationale:** Important for many off-grid users

**Q5: Mobile app support?**
**Decision:** Web-only for now, mobile later
**Rationale:** Focus on core features first

**Q6: Multi-language support?**
**Decision:** English only initially, French later
**Rationale:** Start with primary market

### 13.3 Business Decisions

**Q7: Pricing model for off-grid features?**
**Decision:** Included in existing subscription
**Rationale:** No additional revenue barrier

**Q8: Target market priority?**
**Decision:** Canadians first, then expand
**Rationale:** Cold climate is our differentiator

---

## 14. References & Dependencies

### 14.1 Technical Documents
- [USER_STORIES_AND_REQUIREMENTS.md](./USER_STORIES_AND_REQUIREMENTS.md)
- [PVLIB_API_OFFGRID_EXTENSION_DESIGN.md](./PVLIB_API_OFFGRID_EXTENSION_DESIGN.md)
- [PVLIB_PYTHON_REVIEW_AND_SIMPLIFICATION.md](./PVLIB_PYTHON_REVIEW_AND_SIMPLIFICATION.md)

### 14.2 External Resources
- [PVLib Documentation](https://pvlib-python.readthedocs.io/)
- [IEC 61853 Standards](https://www.iec.ch/)
- [UTE 15-712-1 French PV Standards](https://www.ute.fr/)

### 14.3 Dependencies
- Python 3.10+
- PVLib-Python library
- PostgreSQL database
- Next.js frontend
- Express.js backend

---

## 15. Approvals & Sign-off

### 15.1 Team Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Tech Lead | | | |
| Engineering Manager | | | |
| QA Lead | | | |
| Design Lead | | | |

### 15.2 Stakeholder Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| VP Engineering | | | |
| CEO | | | |

---

## 16. Appendix

### A. Sample API Requests

[Include sample API requests for each endpoint]

### B. Calculation Formulas

[Include battery sizing and load calculation formulas]

### C. Test Data Sets

[Include sample data for testing]

### D. Glossary

[Include technical glossary]

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 2024 | Dev Team | Initial version |
| | | | |
| | | | |

---

**End of PRD**
