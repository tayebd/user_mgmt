# Database Schema Changes for AI Solar PV Design

## Overview

This document outlines the required changes to the Prisma schema and server structure to support AI-powered solar PV design capabilities.

## Current State Analysis

### ✅ What We Have
- Comprehensive equipment models (PVPanel, Inverter, BatteryBank, etc.)
- RESTful API endpoints with full CRUD operations
- Project equipment relationships
- Proper technical specifications storage

### 🔄 What Needs to Change

## 1. Enhanced Equipment Models

### PVPanel Enhancements
```sql
-- Add AI-specific attributes to existing PVPanel model
ALTER TABLE PVPanel ADD COLUMN ai_attributes JSONB;
ALTER TABLE PVPanel ADD COLUMN market_data JSONB;
ALTER TABLE PVPanel ADD COLUMN performance_analytics JSONB;
ALTER TABLE PVPanel ADD COLUMN compliance_data JSONB;
ALTER TABLE PVPanel ADD COLUMN ai_metadata JSONB;

-- Add indexes for AI queries
CREATE INDEX idx_pvpanel_ai_performance_class ON PVPanel USING GIN ((ai_attributes->>'performanceClass'));
CREATE INDEX idx_pvpanel_ai_efficiency_rating ON PVPanel USING GIN ((ai_attributes->>'efficiencyRating'));
```

### Inverter Enhancements
```sql
-- Add AI-specific attributes to existing Inverter model
ALTER TABLE Inverter ADD COLUMN ai_attributes JSONB;
ALTER TABLE Inverter ADD COLUMN market_data JSONB;
ALTER TABLE Inverter ADD COLUMN performance_analytics JSONB;
ALTER TABLE Inverter ADD COLUMN compliance_data JSONB;
ALTER TABLE Inverter ADD COLUMN ai_metadata JSONB;

-- Add indexes for AI queries
CREATE INDEX idx_inverter_ai_performance_class ON Inverter USING GIN ((ai_attributes->>'performanceClass'));
CREATE INDEX idx_inverter_ai_efficiency_rating ON Inverter USING GIN ((ai_attributes->>'efficiencyRating'));
```

## 2. New AI-Specific Tables

### AI Design Results Table
```sql
CREATE TABLE ai_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES "User"(id),
  project_id INTEGER REFERENCES "PVProject"(id),
  requirements JSONB NOT NULL,
  design_result JSONB NOT NULL,
  optimization_scores JSONB,
  compliance_results JSONB,
  cost_analysis JSONB,
  design_metadata JSONB,
  status VARCHAR(20) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for performance
  INDEX idx_ai_designs_user_id (user_id),
  INDEX idx_ai_designs_project_id (project_id),
  INDEX idx_ai_designs_status (status),
  INDEX idx_ai_designs_created_at (created_at)
);
```

### User AI Preferences Table
```sql
CREATE TABLE user_ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES "User"(id),
  equipment_preferences JSONB,
  budget_preferences JSONB,
  brand_preferences JSONB,
  aesthetic_preferences JSONB,
  performance_priorities JSONB,
  learning_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_ai_preferences_user_id (user_id)
);
```

### AI Performance Analytics Table
```sql
CREATE TABLE ai_design_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES ai_designs(id),
  user_id INTEGER REFERENCES "User"(id),
  original_requirements JSONB,
  ai_recommendations JSONB,
  user_modifications JSONB,
  final_design JSONB,
  user_satisfaction_score INTEGER,
  performance_accuracy JSONB,
  cost_vs_estimate JSONB,
  time_to_complete INTEGER,
  feedback_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_ai_analytics_design_id (design_id),
  INDEX idx_ai_analytics_user_id (user_id),
  INDEX idx_ai_analytics_created_at (created_at)
);
```

### AI Equipment Compatibility Matrix Table
```sql
CREATE TABLE ai_equipment_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id INTEGER REFERENCES "PVPanel"(id),
  inverter_id INTEGER REFERENCES "Inverter"(id),
  compatibility_score DECIMAL(5,2),
  compatibility_factors JSONB,
  limitations JSONB,
  recommendations JSONB,
  last_validated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(panel_id, inverter_id),
  INDEX idx_compatibility_panel_id (panel_id),
  INDEX idx_compatibility_inverter_id (inverter_id),
  INDEX idx_compatibility_score (compatibility_score)
);
```

### AI Design Alternatives Table
```sql
CREATE TABLE ai_design_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES ai_designs(id),
  alternative_name VARCHAR(255),
  alternative_type VARCHAR(50), -- 'budget', 'performance', 'premium', 'space_optimized'
  equipment_selections JSONB,
  cost_analysis JSONB,
  performance_estimates JSONB,
  tradeoffs JSONB,
  recommendation_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_alternatives_design_id (design_id),
  INDEX idx_alternatives_type (alternative_type)
);
```

## 3. Enhanced Project Model

### AI Integration with PVProject
```sql
-- Add AI-related fields to existing PVProject table
ALTER TABLE PVProject ADD COLUMN ai_design_id UUID REFERENCES ai_designs(id);
ALTER TABLE PVProject ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE PVProject ADD COLUMN ai_confidence_score DECIMAL(5,2);
ALTER TABLE PVProject ADD COLUMN ai_optimization_applied JSONB;
ALTER TABLE PVProject ADD COLUMN ai_performance_estimate JSONB;

-- Add indexes
CREATE INDEX idx_pvproject_ai_design_id ON "PVProject"(ai_design_id);
CREATE INDEX idx_pvproject_ai_generated ON "PVProject"(ai_generated);
```

## 4. Equipment Market Data Tables

### Market Pricing Table
```sql
CREATE TABLE equipment_market_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type VARCHAR(50), -- 'panel', 'inverter', 'battery', etc.
  equipment_id INTEGER, -- References specific equipment table
  supplier VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  availability_status VARCHAR(20),
  lead_time_days INTEGER,
  bulk_discount_tiers JSONB,
  shipping_cost DECIMAL(8,2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_market_pricing_equipment (equipment_type, equipment_id),
  INDEX idx_market_pricing_supplier (supplier),
  INDEX idx_market_pricing_valid (valid_from, valid_until)
);
```

### Regional Availability Table
```sql
CREATE TABLE equipment_regional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type VARCHAR(50),
  equipment_id INTEGER,
  region_code VARCHAR(10), -- 'US-CA', 'EU-DE', etc.
  country VARCHAR(100),
  available BOOLEAN DEFAULT TRUE,
  restrictions JSONB,
  certifications_required JSONB,
  local_regulations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(equipment_type, equipment_id, region_code),
  INDEX idx_regional_equipment (equipment_type, equipment_id),
  INDEX idx_regional_region (region_code),
  INDEX idx_regional_available (available)
);
```

## 5. AI Model Training Data Tables

### Training Data Collection Table
```sql
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(50), -- 'design_outcome', 'user_feedback', 'performance_data'
  source_data JSONB NOT NULL,
  processed_features JSONB,
  labels JSONB,
  model_version VARCHAR(20),
  training_usefulness DECIMAL(5,2),
  data_quality_score DECIMAL(5,2),
  collected_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,

  INDEX idx_training_data_type (data_type),
  INDEX idx_training_data_quality (data_quality_score),
  INDEX idx_training_data_collected (collected_at)
);
```

### Model Performance Metrics Table
```sql
CREATE TABLE ai_model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100),
  model_version VARCHAR(20),
  metric_type VARCHAR(50), -- 'accuracy', 'user_satisfaction', 'design_time'
  metric_value DECIMAL(5,2),
  test_data_size INTEGER,
  baseline_comparison JSONB,
  recorded_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_model_performance_name (model_name),
  INDEX idx_model_performance_version (model_version),
  INDEX idx_model_performance_metric (metric_type),
  INDEX idx_model_performance_recorded (recorded_at)
);
```

## 6. Updated Prisma Schema

### New Enums
```prisma
enum AIPerformanceClass {
  PREMIUM
  STANDARD
  BUDGET
}

enum AIDesignStatus {
  PROCESSING
  COMPLETED
  FAILED
  EXPIRED
}

enum AIAlternativeType {
  BUDGET
  PERFORMANCE
  PREMIUM
  SPACE_OPTIMIZED
  QUICK_INSTALL
}
```

### Enhanced Models
```prisma
model PVPanel {
  // ... existing fields ...

  // AI enhancement fields
  aiAttributes Json?
  marketData Json?
  performanceAnalytics Json?
  complianceData Json?
  aiMetadata Json?

  // AI relationships
  compatibilityMatrix AiEquipmentCompatibility[]

  // ... existing relationships ...
}

model Inverter {
  // ... existing fields ...

  // AI enhancement fields
  aiAttributes Json?
  marketData Json?
  performanceAnalytics Json?
  complianceData Json?
  aiMetadata Json?

  // AI relationships
  compatibilityMatrix AiEquipmentCompatibility[]

  // ... existing relationships ...
}

model User {
  // ... existing fields ...

  // AI relationships
  aiPreferences UserAiPreferences?
  aiDesigns AiDesign[]
  aiAnalytics AiDesignAnalytics[]

  // ... existing relationships ...
}

model PVProject {
  // ... existing fields ...

  // AI enhancement fields
  aiDesignId UUID?
  aiGenerated Boolean @default(false)
  aiConfidenceScore Decimal?
  aiOptimizationApplied Json?
  aiPerformanceEstimate Json?

  // AI relationships
  aiDesign AiDesign? @relation(fields: [aiDesignId], references: [id])

  // ... existing relationships ...
}

// New AI models
model AiDesign {
  id            String   @id @default(uuid())
  userId        Int
  projectId     Int?
  requirements  Json
  designResult  Json
  optimizationScores Json?
  complianceResults Json?
  costAnalysis  Json?
  designMetadata Json?
  status        AIDesignStatus @default(PROCESSING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User       @relation(fields: [userId], references: [id])
  project       PVProject? @relation(fields: [projectId], references: [id])
  analytics     AiDesignAnalytics[]
  alternatives  AiDesignAlternative[]

  @@index([userId])
  @@index([projectId])
  @@index([status])
  @@index([createdAt])
}

model UserAiPreferences {
  id                    String @id @default(uuid())
  userId                Int    @unique
  equipmentPreferences  Json?
  budgetPreferences     Json?
  brandPreferences      Json?
  aestheticPreferences  Json?
  performancePriorities Json?
  learningData          Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User @relation(fields: [userId], references: [id])
}

model AiDesignAnalytics {
  id                      String @id @default(uuid())
  designId                String
  userId                  Int
  originalRequirements    Json
  aiRecommendations      Json
  userModifications       Json?
  finalDesign             Json?
  userSatisfactionScore  Int?
  performanceAccuracy     Json?
  costVsEstimate          Json?
  timeToComplete          Int?
  feedbackData            Json?
  createdAt               DateTime @default(now())

  design                  AiDesign @relation(fields: [designId], references: [id])
  user                    User     @relation(fields: [userId], references: [id])

  @@index([designId])
  @@index([userId])
  @@index([createdAt])
}

model AiEquipmentCompatibility {
  id                  String  @id @default(uuid())
  panelId             Int
  inverterId          Int
  compatibilityScore  Decimal @db.Decimal(5, 2)
  compatibilityFactors Json?
  limitations         Json?
  recommendations     Json?
  lastValidated       DateTime @default(now())
  createdAt           DateTime @default(now())

  panel               PVPanel  @relation(fields: [panelId], references: [id])
  inverter            Inverter @relation(fields: [inverterId], references: [id])

  @@unique([panelId, inverterId])
  @@index([panelId])
  @@index([inverterId])
  @@index([compatibilityScore])
}

model AiDesignAlternative {
  id                   String   @id @default(uuid())
  designId             String
  alternativeName      String
  alternativeType      AIAlternativeType
  equipmentSelections  Json
  costAnalysis         Json
  performanceEstimates Json
  tradeoffs            Json
  recommendationScore  Decimal  @db.Decimal(5, 2)
  createdAt            DateTime @default(now())

  design               AiDesign @relation(fields: [designId], references: [id])

  @@index([designId])
  @@index([alternativeType])
}
```

## 7. Migration Strategy

### Phase 1: Schema Updates
1. Add new AI fields to existing tables
2. Create new AI-specific tables
3. Run data migration to populate AI attributes

### Phase 2: Data Population
1. Enrich existing equipment data with AI attributes
2. Build compatibility matrix for existing equipment
3. Populate market data tables

### Phase 3: API Integration
1. Update existing API endpoints to include AI data
2. Create new AI-specific endpoints
3. Update frontend to consume AI-enhanced data

## 8. Performance Considerations

### Indexing Strategy
- GIN indexes for JSONB fields to enable efficient querying
- Composite indexes for common AI query patterns
- Time-based indexes for analytics queries

### Data Partitioning
- Consider partitioning large tables by date (analytics data)
- Archive old design analytics to maintain performance

### Caching Strategy
- Cache frequently accessed AI attributes
- Cache compatibility matrix results
- Cache user preference data

## 9. Security Considerations

### Data Privacy
- Encrypt sensitive user preference data
- Anonymize training data for privacy
- Implement proper access controls for AI data

### Data Integrity
- Validate AI-generated data before storage
- Implement audit trails for AI modifications
- Regular data quality checks

This comprehensive schema enhancement provides the foundation for AI-powered solar PV design while maintaining backward compatibility with existing functionality.