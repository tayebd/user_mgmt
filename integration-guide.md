# Application Integration Guide: User Management & AI-ERP

## Overview

This guide outlines how to integrate and unify the User Management application with the AI-ERP application, focusing on reusing components, authentication, dashboard, and survey systems.

## Current Application Analysis

### User Management Application
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand
- **Key Features**: 
  - Solar PV project management
  - Equipment database (PV panels, inverters)
  - Survey system with SurveyJS
  - AI-powered solar design
  - Organization management
- **Strengths**: 
  - Well-structured component system
  - Comprehensive form handling
  - Advanced survey capabilities
  - AI integration for solar design

### AI-ERP Application
- **Tech Stack**: Python 3.11, FastAPI, PostgreSQL 18, pgvector
- **Key Features**:
  - AI-first ERP/CRM/CX platform
  - Multi-agent architecture
  - Lead management and opportunity tracking
  - Workflow automation
  - Vector-based semantic search
- **Strengths**:
  - Advanced AI capabilities
  - Comprehensive business logic
  - Agent-based architecture
  - Semantic search and embeddings

## Integration Strategy

### 1. Shared Component Library

#### 1.1 Create Monorepo Structure
```
/apps/
├── shared/
│   ├── components/          # Shared React components
│   ├── hooks/              # Shared React hooks
│   ├── utils/              # Shared utilities
│   ├── types/              # Shared TypeScript types
│   └── styles/            # Shared styling system
├── user-management/         # Current Next.js app
└── ai-erp/               # Current Python app
```

#### 1.2 Component Migration Plan

**Phase 1: UI Components**
- Extract reusable UI components from User Management
- Create component library with consistent API
- Implement in both applications

**Phase 2: Form Components**
- Migrate GenericForm and AutoForm to shared library
- Standardize form validation patterns
- Implement consistent form handling

**Phase 3: Data Components**
- Share DataTable, DataList, and DataCard components
- Implement consistent data display patterns
- Add AI-enhanced features to data components

### 2. Authentication Integration

#### 2.1 Unified Authentication System
```typescript
// shared/components/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Unified authentication logic
  const login = async (email: string, password: string) => {
    // Route to appropriate auth service based on user type
  };

  const logout = async () => {
    // Unified logout logic
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2.2 Role-Based Access Control
```typescript
// shared/components/auth/RoleGuard.tsx
import React from 'react';
import { useAuth } from './AuthProvider';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'user' | 'admin' | 'solar_designer' | 'sales_rep' | 'manager';
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user || !hasRequiredRole(user.role, requiredRole)) {
    return fallback || <div>Access denied</div>;
  }
  
  return <>{children}</>;
}
```

### 3. Dashboard Integration

#### 3.1 Unified Dashboard Architecture
```typescript
// shared/components/dashboard/DashboardLayout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  userRole: string;
}

export function DashboardLayout({ 
  children, 
  sidebarItems, 
  userRole 
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={sidebarItems.filter(item => item.roles.includes(userRole))} />
      <div className="flex-1 flex flex-col">
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
}
```

#### 3.2 Widget System
```typescript
// shared/components/dashboard/Widget.tsx
import React from 'react';
import { BaseCard } from '../ui/BaseCard';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
}

export function Widget({ 
  title, 
  children, 
  size = 'medium', 
  loading, 
  error, 
  actions 
}: WidgetProps) {
  return (
    <BaseCard className={`widget widget-${size}`}>
      <div className="widget-header">
        <h3>{title}</h3>
        {actions}
      </div>
      <div className="widget-content">
        {loading ? <LoadingSpinner /> : error ? <ErrorMessage error={error} /> : children}
      </div>
    </BaseCard>
  );
}
```

### 4. Survey System Integration

#### 4.1 Unified Survey Component
```typescript
// shared/components/surveys/SurveyManager.tsx
import React from 'react';
import { SurveyCreator } from './SurveyCreator';
import { SurveyResponse } from './SurveyResponse';
import { SurveyAnalytics } from './SurveyAnalytics';

interface SurveyManagerProps {
  mode: 'create' | 'respond' | 'analyze';
  surveyId?: string;
  surveyData?: SurveyData;
}

export function SurveyManager({ mode, surveyId, surveyData }: SurveyManagerProps) {
  switch (mode) {
    case 'create':
      return <SurveyCreator initialData={surveyData} />;
    case 'respond':
      return <SurveyResponse surveyId={surveyId} />;
    case 'analyze':
      return <SurveyAnalytics surveyId={surveyId} />;
    default:
      return <div>Invalid survey mode</div>;
  }
}
```

#### 4.2 AI-Enhanced Survey Analytics
```typescript
// shared/components/surveys/AISurveyAnalytics.tsx
import React from 'react';
import { useAISurveyAnalysis } from '../../hooks/useAISurveyAnalysis';

interface AISurveyAnalyticsProps {
  surveyId: string;
  responses: SurveyResponse[];
}

export function AISurveyAnalytics({ surveyId, responses }: AISurveyAnalyticsProps) {
  const { analysis, isLoading, error } = useAISurveyAnalysis(surveyId, responses);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!analysis) return <div>No analysis available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Widget title="Response Rate" size="small">
        <div className="text-2xl font-bold">{analysis.responseRate}%</div>
      </Widget>
      <Widget title="Sentiment Score" size="small">
        <div className="text-2xl font-bold">{analysis.sentimentScore}</div>
      </Widget>
      <Widget title="Key Insights" size="large">
        <ul className="space-y-2">
          {analysis.insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Widget>
    </div>
  );
}
```

### 5. API Integration

#### 5.1 Unified API Client
```typescript
// shared/lib/api-client.ts
export class UnifiedApiClient {
  private userManagementUrl: string;
  private aiErpUrl: string;

  constructor() {
    this.userManagementUrl = process.env.NEXT_PUBLIC_USER_MANAGEMENT_API || 'http://localhost:3000';
    this.aiErpUrl = process.env.NEXT_PUBLIC_AI_ERP_API || 'http://localhost:8000';
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    service: 'user-management' | 'ai-erp' = 'user-management'
  ): Promise<ApiResponse<T>> {
    const baseUrl = service === 'user-management' ? this.userManagementUrl : this.aiErpUrl;
    const url = `${baseUrl}${endpoint}`;
    
    // Unified request logic with authentication
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await this.getAuthToken(),
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  // Service-specific methods
  async getUserData<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options, 'user-management');
  }

  async getAIData<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options, 'ai-erp');
  }
}
```

#### 5.2 Data Synchronization
```typescript
// shared/lib/data-sync.ts
export class DataSyncManager {
  private apiClient: UnifiedApiClient;
  private syncQueue: SyncOperation[] = [];

  constructor(apiClient: UnifiedApiClient) {
    this.apiClient = apiClient;
  }

  async syncUserData(userId: string): Promise<void> {
    // Sync user data between systems
    const userData = await this.apiClient.getUserData(`/users/${userId}`);
    await this.apiClient.getAIData('/sync/user', {
      method: 'POST',
      body: userData.data,
    });
  }

  async syncOrganizationData(orgId: string): Promise<void> {
    // Sync organization data
    const orgData = await this.apiClient.getUserData(`/organizations/${orgId}`);
    await this.apiClient.getAIData('/sync/organization', {
      method: 'POST',
      body: orgData.data,
    });
  }

  async syncSurveyData(surveyId: string): Promise<void> {
    // Sync survey responses with AI analysis
    const surveyData = await this.apiClient.getUserData(`/surveys/${surveyId}/responses`);
    const analysis = await this.apiClient.getAIData('/analyze/survey', {
      method: 'POST',
      body: surveyData.data,
    });
    
    // Store analysis back in user management system
    await this.apiClient.getUserData(`/surveys/${surveyId}/analysis`, {
      method: 'POST',
      body: analysis.data,
    });
  }
}
```

### 6. AI Integration

#### 6.1 AI Service Bridge
```typescript
// shared/lib/ai-bridge.ts
export class AIServiceBridge {
  private apiClient: UnifiedApiClient;

  constructor(apiClient: UnifiedApiClient) {
    this.apiClient = apiClient;
  }

  async analyzeSolarProject(projectData: SolarProjectData): Promise<AIAnalysisResult> {
    return this.apiClient.getAIData('/ai/solar/analyze', {
      method: 'POST',
      body: projectData,
    });
  }

  async enrichLeadData(leadData: LeadData): Promise<EnrichedLeadData> {
    return this.apiClient.getAIData('/ai/lead/enrich', {
      method: 'POST',
      body: leadData,
    });
  }

  async generateSurveyInsights(surveyResponses: SurveyResponse[]): Promise<SurveyInsights> {
    return this.apiClient.getAIData('/ai/survey/analyze', {
      method: 'POST',
      body: { responses: surveyResponses },
    });
  }

  async recommendNextActions(context: BusinessContext): Promise<RecommendedAction[]> {
    return this.apiClient.getAIData('/ai/actions/recommend', {
      method: 'POST',
      body: context,
    });
  }
}
```

#### 6.2 AI-Enhanced Components
```typescript
// shared/components/ai/AIEnhancedDataTable.tsx
import React from 'react';
import { DataTable } from '../data/DataTable';
import { AIServiceBridge } from '../../lib/ai-bridge';

interface AIEnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  aiFeatures?: {
    insights?: boolean;
    recommendations?: boolean;
    predictions?: boolean;
  };
}

export function AIEnhancedDataTable<T>({
  data,
  columns,
  aiFeatures = {}
}: AIEnhancedDataTableProps<T>) {
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const aiService = new AIServiceBridge(new UnifiedApiClient());

  useEffect(() => {
    if (aiFeatures.insights && data.length > 0) {
      aiService.generateDataInsights(data).then(setAiInsights);
    }
  }, [data, aiFeatures.insights]);

  return (
    <div className="space-y-4">
      {aiInsights && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">AI Insights</h4>
          <p className="text-blue-800">{aiInsights.summary}</p>
        </div>
      )}
      
      <DataTable
        data={data}
        columns={columns}
        aiEnhanced={true}
        recommendations={aiFeatures.recommendations ? aiInsights?.recommendations : undefined}
      />
    </div>
  );
}
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
1. **Set up monorepo structure**
   - Create shared directory structure
   - Configure package management
   - Set up build processes

2. **Migrate core components**
   - Extract BaseCard, ActionCard, GenericForm
   - Create shared component library
   - Update import paths

3. **Implement unified authentication**
   - Create AuthProvider with role-based access
   - Integrate with both systems
   - Test user flows

### Phase 2: Dashboard Integration (Weeks 5-8)
1. **Build unified dashboard**
   - Create DashboardLayout component
   - Implement widget system
   - Add role-based dashboard views

2. **Integrate data visualization**
   - Share chart components
   - Implement AI-enhanced visualizations
   - Create dashboard templates

### Phase 3: Survey System Integration (Weeks 9-12)
1. **Unify survey components**
   - Create SurveyManager component
   - Implement AI-enhanced analytics
   - Add cross-system survey sharing

2. **Implement AI integration**
   - Create AI service bridge
   - Add AI-enhanced components
   - Implement intelligent recommendations

### Phase 4: Data Synchronization (Weeks 13-16)
1. **Build data sync system**
   - Implement DataSyncManager
   - Create sync schedules
   - Handle conflict resolution

2. **Optimize performance**
   - Implement caching strategies
   - Add lazy loading
   - Optimize bundle sizes

## Benefits of Integration

### 1. Improved User Experience
- **Consistent Interface**: Unified design language across both applications
- **Seamless Navigation**: Single sign-on and unified dashboard
- **Intelligent Features**: AI-powered insights and recommendations

### 2. Enhanced Functionality
- **Cross-System Data**: Shared data between solar and ERP systems
- **AI Integration**: Advanced AI capabilities in solar design
- **Comprehensive Analytics**: Combined insights from both systems

### 3. Development Efficiency
- **Code Reuse**: Shared components reduce development time
- **Consistent Patterns**: Standardized development approach
- **Easier Maintenance**: Single source of truth for components

### 4. Business Value
- **Complete Solution**: End-to-end business management
- **Data-Driven Decisions**: AI-powered business insights
- **Scalable Architecture**: Easy to add new features

## Technical Considerations

### 1. Performance
- **Lazy Loading**: Load components and data on demand
- **Caching**: Implement intelligent caching strategies
- **Bundle Optimization**: Optimize JavaScript bundles

### 2. Security
- **Authentication**: Secure unified authentication system
- **Authorization**: Role-based access control
- **Data Protection**: Encrypt sensitive data

### 3. Scalability
- **Microservices**: Scalable service architecture
- **Database Design**: Optimized for growth
- **API Design**: RESTful and scalable APIs

### 4. Monitoring
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Track application performance
- **User Analytics**: Understand user behavior

## Next Steps

1. **Stakeholder Approval**: Review and approve integration plan
2. **Technical Setup**: Prepare development environment
3. **Phase 1 Implementation**: Start with foundation components
4. **Regular Reviews**: Weekly progress reviews
5. **User Testing**: Continuous user feedback integration

## Success Metrics

1. **User Adoption**: Track usage of integrated features
2. **Development Velocity**: Measure development time improvements
3. **System Performance**: Monitor application performance
4. **User Satisfaction**: Survey user satisfaction
5. **Business Impact**: Measure business value delivered

This integration plan provides a comprehensive approach to unifying the User Management and AI-ERP applications, creating a powerful, AI-enhanced business management platform.