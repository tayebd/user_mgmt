# AI Solar PV Design Integration Architecture

## Overview

This document outlines the technical architecture for integrating AI-powered solar PV design capabilities into the existing Project Wizard. The architecture ensures seamless integration with current systems while providing scalability, reliability, and maintainability.

## Current System Architecture

### Existing Components
```
Frontend (Next.js 15 Client)
├── ProjectWizard Component
│   ├── LocationStep
│   ├── ArrayStep
│   ├── InverterStep
│   ├── MountingStep
│   ├── MiscEquipmentStep
│   └── ReportStep
├── Equipment Database (Client-side)
├── Calculation Engine (Client-side)
└── API Integration (Port 8001)

Backend Infrastructure
├── Main API Server (Port 5000)
├── PV Simulation API (Port 8001)
├── User Authentication (Supabase)
└── Equipment Database
```

### Current Data Flow
1. User inputs data through wizard steps
2. Client-side calculations validate equipment compatibility
3. Final design sent to simulation API (port 8001)
4. Report generated and displayed to user

## AI-Enhanced Architecture

### High-Level Architecture
```
Frontend Layer (Next.js 15)
├── Enhanced ProjectWizard
│   ├── LocationStep (Enhanced)
│   ├── AIDesignStep (New)
│   ├── AIRecommendationStep (New)
│   ├── ArrayStep (Optional)
│   ├── InverterStep (Optional)
│   ├── MountingStep (Optional)
│   ├── MiscEquipmentStep (Optional)
│   └── ReportStep (Enhanced)
├── AI Progress Components
├── AI Result Display Components
└── AI Chat Interface (Optional)

AI Service Layer
├── AI Design API
│   ├── Equipment Selection Engine
│   ├── Optimization Algorithms
│   ├── Compliance Engine
│   └── Cost Analysis Module
├── Knowledge Base
│   ├── Equipment Database
│   ├── Code Rules Engine
│   ├── Location Data Service
│   └── Pricing Service
└── Machine Learning Models
    ├── Performance Prediction
    ├── Equipment Matching
    └── Cost Optimization

Data Layer
├── Enhanced Equipment Database
├── Design History Database
├── User Preference Database
└── Performance Analytics
```

## Detailed Component Architecture

### 1. Frontend Architecture

#### 1.1 Enhanced ProjectWizard Component
**Location:** `src/components/ProjectWizard/ProjectWizard.tsx`

**New Features:**
- AI mode toggle
- Progress tracking for AI processing
- AI recommendation display
- Real-time cost optimization

**State Management:**
```typescript
interface AIWizardState {
  isAIMode: boolean;
  aiRequirements: AIRequirements;
  aiDesign: AIDesignResult | null;
  isProcessingAI: boolean;
  aiProgress: AIProgress;
  selectedAIRecommendations: AIRecommendation[];
}

interface AIRequirements {
  location: LocationData;
  budget: BudgetRange;
  spaceAvailable: number;
  energyConsumption: number;
  backupRequired: boolean;
  equipmentPreferences: EquipmentPreferences;
}
```

#### 1.2 New AI Design Step Component
**Location:** `src/components/ProjectWizard/steps/AIDesignStep.tsx`

**Responsibilities:**
- Collect AI design requirements
- Display AI processing progress
- Show AI recommendations
- Allow user to adjust AI suggestions

**Key Features:**
- Budget input with visual slider
- Space measurement tools
- Energy consumption input helpers
- Equipment preference selection
- Real-time cost feedback

#### 1.3 AI Recommendation Display
**Location:** `src/components/ProjectWizard/steps/AIRecommendationStep.tsx`

**Components:**
- `EquipmentCard` - Enhanced equipment display with AI reasoning
- `ComparisonView` - Side-by-side design options
- `CostBreakdown` - Detailed cost analysis
- `ComplianceReport` - Code compliance verification
- `EditRecommendations` - Modify AI suggestions

#### 1.4 AI Progress Indicators
**Location:** `src/components/ProjectWizard/components/AIProgress.tsx`

**Features:**
- Multi-stage progress visualization
- Real-time status updates
- Estimated time remaining
- Cancellation option
- Error handling and retry

### 2. AI Service Layer Architecture

#### 2.1 AI Design API
**Location:** New microservice or integrated into existing backend

**Endpoints:**
```
POST /api/ai-design/generate
POST /api/ai-design/optimize
POST /api/ai-design/validate
GET  /api/ai-design/status/{designId}
POST /api/ai-design/adjust
```

**Core Services:**

**Equipment Selection Engine**
```typescript
class EquipmentSelectionEngine {
  async selectPanels(requirements: AIRequirements): Promise<PanelSelection[]>
  async selectInverters(panels: Panel[], requirements: AIRequirements): Promise<InverterSelection[]>
  async selectProtectionDevices(system: SystemDesign): Promise<ProtectionDevices[]>
  async selectBatterySystem(requirements: AIRequirements): Promise<BatterySystem | null>
}
```

**Optimization Algorithms**
```typescript
class OptimizationEngine {
  async optimizeArrayLayout(requirements: AIRequirements): Promise<ArrayLayout>
  async optimizeStringConfiguration(panels: Panel[], inverter: Inverter): Promise<StringConfig>
  async optimizeCost(design: SystemDesign, budget: BudgetRange): Promise<OptimizedDesign>
  async optimizePerformance(design: SystemDesign, location: Location): Promise<PerformanceOptimizedDesign>
}
```

**Compliance Engine**
```typescript
class ComplianceEngine {
  async validateElectricalCodes(design: SystemDesign, location: Location): Promise<ComplianceResult>
  async validateUtilityRequirements(design: SystemDesign, utility: Utility): Promise<ComplianceResult>
  async validateBuildingCodes(design: SystemDesign, building: Building): Promise<ComplianceResult>
  async generateComplianceReport(design: SystemDesign): Promise<ComplianceReport>
}
```

#### 2.2 Knowledge Base Architecture

**Equipment Database Enhancement**
```typescript
interface EnhancedPanel extends PVPanel {
  aiAttributes: {
    performanceClass: 'premium' | 'standard' | 'budget';
    temperaturePerformance: number; // -1 to 1 rating
    spaceEfficiency: number; // W/m² rating
    reliability: number; // 0-1 rating based on warranty and brand
    availability: 'high' | 'medium' | 'low';
    leadTime: number; // days
    compatibilityScore: number; // 0-1 rating
  };
  pricing: {
    basePrice: number;
    bulkDiscount: number[];
    installationComplexity: 'low' | 'medium' | 'high';
    shippingCost: number;
  };
}
```

**Code Rules Engine**
```typescript
interface CodeRule {
  id: string;
  jurisdiction: string;
  category: 'dc' | 'ac' | 'grounding' | 'interconnection';
  requirement: string;
  calculation: (design: SystemDesign) => RuleResult;
  references: string[];
  lastUpdated: Date;
}

class CodeRulesEngine {
  async get applicableRules(location: Location): Promise<CodeRule[]>
  async validateDesign(design: SystemDesign, rules: CodeRule[]): Promise<ValidationResult[]>
  async explainRule(rule: CodeRule): Promise<string>
}
```

**Location Data Service**
```typescript
interface LocationData {
  coordinates: { lat: number; lng: number };
  solarIrradiance: IrradianceData;
  weatherPatterns: WeatherData;
  utilityRates: UtilityRate[];
  permitRequirements: PermitRequirement[];
  buildingCode: BuildingCode;
  incentives: Incentive[];
}
```

### 3. Data Architecture

#### 3.1 Database Schema Enhancements

**AI Designs Table**
```sql
CREATE TABLE ai_designs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  requirements JSONB NOT NULL,
  design_result JSONB NOT NULL,
  optimization_scores JSONB,
  compliance_results JSONB,
  cost_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**User Preferences Table**
```sql
CREATE TABLE user_ai_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  equipment_preferences JSONB,
  budget_preferences JSONB,
  brand_preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**AI Performance Analytics Table**
```sql
CREATE TABLE ai_design_analytics (
  id UUID PRIMARY KEY,
  design_id UUID REFERENCES ai_designs(id),
  user_adjustments JSONB,
  final_design JSONB,
  performance_accuracy JSONB,
  user_satisfaction INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2 Data Flow Architecture

**AI Design Generation Flow:**
1. **Input Collection** → Frontend collects user requirements
2. **Preprocessing** → AI service validates and enriches input data
3. **Equipment Selection** → Multiple parallel selection processes
4. **Optimization** → Cost and performance optimization algorithms
5. **Compliance Validation** → Multi-jurisdiction code checking
6. **Result Assembly** → Combine all results into comprehensive design
7. **User Presentation** → Display results with explanations and options

**Real-time Communication:**
```typescript
// WebSocket connection for real-time AI progress
interface AIProgressUpdate {
  designId: string;
  stage: 'equipment-selection' | 'optimization' | 'compliance' | 'finalization';
  progress: number; // 0-100
  currentTask: string;
  estimatedTimeRemaining: number;
  partialResults?: any;
}
```

### 4. API Architecture

#### 4.1 AI Design API Specification

**Generate Design Endpoint**
```typescript
POST /api/ai-design/generate
Content-Type: application/json

Request Body:
{
  requirements: AIRequirements;
  userId: string;
  projectId?: string;
  options: {
    optimizationTarget: 'cost' | 'performance' | 'balanced';
    includeAlternatives: boolean;
    complianceLevel: 'minimum' | 'standard' | 'strict';
  };
}

Response:
{
  designId: string;
  status: 'processing' | 'completed' | 'error';
  estimatedTime: number;
  results?: AIDesignResult;
  alternatives?: AIDesignResult[];
  compliance: ComplianceReport;
}
```

**Get Design Status Endpoint**
```typescript
GET /api/ai-design/status/{designId}

Response:
{
  designId: string;
  status: 'processing' | 'completed' | 'error';
  progress: {
    stage: string;
    percentage: number;
    currentTask: string;
    estimatedTimeRemaining: number;
  };
  partialResults?: any;
  error?: string;
}
```

**Optimize Design Endpoint**
```typescript
POST /api/ai-design/optimize
Content-Type: application/json

Request Body:
{
  designId: string;
  adjustments: {
    budget?: BudgetRange;
    equipmentChanges?: EquipmentChange[];
    constraints?: DesignConstraints;
  };
  optimizationTarget: 'cost' | 'performance' | 'size';
}

Response:
{
  optimizedDesign: AIDesignResult;
  improvements: ImprovementSummary;
  tradeoffs: TradeoffAnalysis;
}
```

#### 4.2 Integration with Existing APIs

**Enhanced Simulation API Integration**
```typescript
// Enhanced simulation request with AI-optimized parameters
interface EnhancedSimulationRequest extends SimulationRequest {
  aiOptimized: boolean;
  aiDesignId?: string;
  optimizationNotes?: string;
  expectedPerformance?: PerformanceExpectations;
}
```

**Equipment Database API Enhancement**
```typescript
// Enhanced equipment queries with AI-specific attributes
GET /api/equipment/panels?aiAttributes=true&location={lat},{lng}
GET /api/equipment/inverters?compatibilityScore=true&panelId={id}
GET /api/equipment/protection?compliantWith={code}&location={location}
```

### 5. Security Architecture

#### 5.1 Authentication & Authorization
```typescript
// AI-specific permissions
interface AIPermissions {
  canUseAIDesign: boolean;
  canAccessAdvancedOptimization: boolean;
  canOverrideAIRecommendations: boolean;
  maxDesignsPerMonth: number;
}
```

#### 5.2 Data Privacy
- **Location Data**: Anonymize and encrypt location information
- **User Preferences**: Secure storage of user preferences
- **Design History**: Optional design history with user consent
- **Analytics**: Anonymous usage analytics only

#### 5.3 API Security
- **Rate Limiting**: Prevent abuse of AI services
- **Request Validation**: Validate all AI design requests
- **Response Filtering**: Filter sensitive information from responses
- **Audit Logging**: Log all AI design requests and results

### 6. Performance Architecture

#### 6.1 Caching Strategy
```typescript
interface AICacheConfig {
  designCache: {
    locationBased: 24 hours;
    equipmentBased: 6 hours;
    userPreferences: 30 days;
  };
  equipmentCache: {
    specifications: 7 days;
    pricing: 1 hour;
    availability: 15 minutes;
  };
  complianceCache: {
    codeRules: 30 days;
    locationRules: 7 days;
    utilityRules: 30 days;
  };
}
```

#### 6.2 Scalability Design
- **Horizontal Scaling**: Stateless AI service instances
- **Queue Processing**: Asynchronous design processing
- **Load Balancing**: Distribute AI requests across instances
- **Resource Management**: Dynamic resource allocation based on demand

#### 6.3 Monitoring & Analytics
```typescript
interface AIMetrics {
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
  usage: {
    designsPerDay: number;
    userSatisfactionScore: number;
    featureUsageStats: Record<string, number>;
  };
  quality: {
    accuracyMetrics: Record<string, number>;
    userCorrectionRate: number;
    complianceAccuracy: number;
  };
}
```

### 7. Deployment Architecture

#### 7.1 Service Architecture
```
Production Environment:
├── Load Balancer
├── Frontend (Next.js)
│   ├── Static Assets (CDN)
│   └── Application Server
├── AI Services
│   ├── Design API (Multiple instances)
│   ├── Optimization Engine
│   └── Compliance Engine
├── Data Layer
│   ├── PostgreSQL (Primary DB)
│   ├── Redis (Cache)
│   └── Elasticsearch (Search)
└── External APIs
    ├── Solar Data Services
    ├── Equipment Suppliers
    └── Pricing Services
```

#### 7.2 CI/CD Pipeline
```yaml
# AI Service Deployment Pipeline
stages:
  - test_ai_models
  - validate_equipment_data
  - security_scan
  - deploy_to_staging
  - integration_tests
  - deploy_to_production
  - post_deployment_monitoring
```

#### 7.3 Monitoring & Observability
- **Health Checks**: Service health monitoring
- **Performance Metrics**: AI model performance tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: AI feature usage and satisfaction tracking

## Integration Points

### 1. Frontend Integration
- **Wizard Flow**: Insert AI steps into existing wizard
- **State Management**: Extend existing Zustand store
- **Component Reuse**: Leverage existing UI components
- **Routing**: Update navigation for new AI features

### 2. Backend Integration
- **Database Enhancement**: Extend existing database schema
- **API Enhancement**: Add AI endpoints to existing API
- **Authentication**: Use existing Supabase authentication
- **User Management**: Integrate with existing user system

### 3. External Service Integration
- **Solar Data**: Integrate with NREL, SolarGIS APIs
- **Equipment Data**: Connect to supplier APIs
- **Pricing Services**: Real-time pricing integration
- **Permit Services**: Integration with permit assistance APIs

## Migration Strategy

### Phase 1: Backend Infrastructure
1. Deploy AI service infrastructure
2. Migrate and enhance equipment database
3. Implement compliance engine
4. Set up monitoring and analytics

### Phase 2: API Development
1. Develop AI design API endpoints
2. Implement real-time communication
3. Set up caching and performance optimization
4. Create testing and validation suite

### Phase 3: Frontend Integration
1. Develop AI design components
2. Integrate with existing wizard
3. Implement AI progress tracking
4. Add AI result display components

### Phase 4: Testing & Deployment
1. Comprehensive testing suite
2. User acceptance testing
3. Gradual rollout with feature flags
4. Performance optimization and monitoring

## Technology Stack

### AI/ML Technologies
- **Language**: Python (AI services)
- **ML Framework**: TensorFlow/PyTorch
- **Optimization**: OR-Tools, SciPy
- **Data Processing**: Pandas, NumPy
- **API**: FastAPI

### Frontend Technologies
- **Framework**: Next.js 15 (existing)
- **Language**: TypeScript (existing)
- **State Management**: Zustand (existing)
- **UI Components**: shadcn/ui (existing)
- **Real-time Communication**: WebSocket

### Backend Technologies
- **API**: FastAPI/Express.js
- **Database**: PostgreSQL (existing)
- **Cache**: Redis
- **Queue**: RabbitMQ/AWS SQS
- **Monitoring**: Prometheus, Grafana

### DevOps Technologies
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Infrastructure**: AWS/Azure
- **Monitoring**: DataDog/New Relic

## Risk Mitigation

### Technical Risks
- **AI Model Performance**: Continuous validation and retraining
- **Service Reliability**: Redundant instances and failover mechanisms
- **Data Quality**: Automated data validation and cleaning
- **Integration Complexity**: Phased approach with thorough testing

### Business Risks
- **User Adoption**: Gradual rollout with user feedback
- **Compliance Changes**: Automated rule updates
- **Competition**: Continuous innovation and improvement
- **Cost Management**: Resource optimization and monitoring

This architecture provides a robust, scalable foundation for AI-powered solar PV design while maintaining compatibility with existing systems and ensuring a smooth user experience.