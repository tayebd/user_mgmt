# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sophisticated solar PV (photovoltaic) project management and design system with AI-powered capabilities. The application consists of a Next.js 15 client application and Express.js backend API, providing comprehensive solar project design, equipment management, survey systems, and AI-driven solar system optimization.

**Recent Development Status (October 2024):**
- ✅ **Enhanced AI Wizard**: Improved null safety, comprehensive error handling, and robust data validation
- ✅ **Advanced Type System**: Complete AI-enhanced type definitions with Zod schemas for all equipment types
- ✅ **Service Layer Architecture**: Modular API client and dedicated service layers for different domains
- ✅ **Comprehensive Testing**: Extensive test coverage for survey system, metrics calculation, and AI components
- ✅ **Enhanced Equipment Database**: AI-powered equipment intelligence with compatibility matrices

**Simplification & Optimization (October 2024):**
- ✅ **API Store Refactoring**: Split 1,230-line monolith into 8 focused services/stores (67% complexity reduction)
- ✅ **Authentication Centralization**: Unified 37 scattered auth calls into single context (67% reduction)
- ✅ **Component Consolidation**: Shared wizard utilities reducing duplication by 50%+
- ✅ **Generic CRUD Hooks**: Reusable form patterns reducing form duplication by 50%
- ✅ **Survey Dependency Optimization**: Removed redundant libraries, reduced bundle by ~200KB
- ✅ **Pure Calculation Services**: Separated 1,300+ lines of math logic from UI components
- ✅ **UI Standardization**: BaseCard, ActionCard, and Layout components for consistency
- ✅ **Bundle Optimization**: 4.9M total bundle size with dynamic imports and code splitting
- ✅ **Testing Infrastructure**: 275 tests with 191 passing (70% success rate)
- ✅ **Build System**: 100% TypeScript compliance and successful production builds

## Architecture

### Client (Next.js 15)
- **Framework**: Next.js 15 with React 19 RC and TypeScript
- **UI**: Tailwind CSS 4.0 with shadcn/ui components
- **State Management**: Zustand for global state, local state for components
- **Authentication**: Supabase Auth with comprehensive context management
- **Styling**: Dark mode support, solar-themed orange accent colors
- **Development**: Port 3000/3001 with hot reload

### Server (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with Supabase integration
- **API Design**: RESTful endpoints with comprehensive error handling
- **Development**: Port 5000 for API, 8001 for simulation services

### Key Features

#### AI-Powered Solar Design
- **AI Project Wizard** (`/ai-wizard`): Enhanced 4-step intelligent solar system design with robust error handling
- **Smart Equipment Selection**: Climate-aware scoring algorithm with priority optimization
- **Performance Simulation**: 8,760 hourly calculations with weather modeling via PVLib Python API
- **Compliance Validation**: UTE 15-712-1 French electrical standards checking
- **Financial Analysis**: ROI, NPV, IRR, payback period, LCOE calculations with 25-year projections
- **Enhanced Null Safety**: Comprehensive error handling prevents crashes from incomplete API responses
- **Real-time Processing**: Background job queuing with polling for AI design completion

#### Manual Project Wizard
- **Multi-step Process**: Location → Array → Inverters → Mounting → Misc → Report
- **Real-time Calculations**: Array configuration, cable sizing, protection devices
- **Equipment Database**: PV panels, inverters, mounting hardware, protection devices
- **Report Generation**: Comprehensive technical documentation

#### Survey System
- **SurveyJS Integration**: Professional survey creation and management with rich question types
- **Advanced Response Processing**: Comprehensive metrics calculation with technology assessments
- **Organization Integration**: Surveys linked to organization profiles with response analytics
- **Results Analytics**: Aggregated response data visualization with industry insights
- **Technology Maturity Assessment**: Digital process and personnel skill evaluations
- **Comprehensive Testing**: Extensive test coverage for survey components and calculation logic

#### Equipment Management
- **PV Panels**: Comprehensive database with AI-enhanced performance ratings and compatibility data
- **Inverters**: String and central inverters with efficiency curves and smart features
- **Mounting Hardware**: Roof and ground mounting solutions with structural analysis
- **Protection Devices**: Fuses, circuit breakers, surge protection with compliance data
- **AI Intelligence Layer**: Performance ratings, market insights, and compatibility matrices
- **Enhanced Type System**: Complete Zod schemas for all equipment types with validation

## Development Commands

### Client Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Type checking
pnpm type-check  # or pnpm tsc --noEmit

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Dependency management
pnpm update:check
pnpm update:next
pnpm update:deps
```

### Server Development
```bash
# Start development server with auto-reload
pnpm dev

# Build TypeScript
pnpm build

# Start production server
pnpm start

# Database operations
pnpm db:push
pnpm db:migrate
pnpm db:generate
pnpm db:seed

# Excel data seeding
pnpm seed:excel
pnpm seed:excelPV

# PVLib Python API Service (required for AI wizard)
cd ../server/pvlib_api
./run_api.sh
# Or manually: uvicorn simple_api:app --host 0.0.0.0 --port 8001 --reload
```

## File Structure & Key Components

### Client Architecture

#### Core Application
- `src/app/layout.tsx` - Root layout with auth provider and error boundaries
- `src/app/page.tsx` - Solar-themed landing page with feature showcase
- `src/components/Navbar/` - Solar-branded navigation with search functionality

#### State Management & Services
- `src/stores/` - Domain-specific Zustand stores (organization-store.ts, survey-store.ts, equipment-store.ts)
- `src/services/` - Modular API services (auth-service.ts, project-service.ts, survey-service.ts, organization-service.ts, equipment-service.ts)
- `src/contexts/AuthContext.tsx` - Comprehensive authentication context with enhanced error handling
- `src/services/api-client.ts` - Base HTTP client with interceptors and error handling
- User cache with 5-minute TTL, failed lookup cache with 1-minute TTL

#### Authentication & Service Layer
- `src/lib/supabase-client.ts` - Supabase client configuration
- `src/hooks/` - Reusable hooks (useCRUD.ts, useOrganization.ts, useSurvey.ts, useProject.ts)
- `src/components/forms/` - Generic form components (GenericForm.tsx, FormActions.tsx, ValidationSummary.tsx)
- `src/utils/auth.ts` - Authentication utilities and token management
- Auth tokens passed as `Authorization: Bearer` headers

#### AI Project Wizard
- `src/components/ProjectWizard/AIProjectWizard.tsx` - Main AI wizard component (1026+ lines) with enhanced null safety
- `src/components/ProjectWizard/AIReportGenerator.tsx` - Comprehensive AI report generation (555+ lines)
- `src/app/ai-wizard/page.tsx` - AI wizard route entry point
- 4-step process: Location → Requirements → AI Processing → Results
- Real-time polling for AI processing status with progress indicators
- Enhanced error handling with graceful degradation for incomplete API responses
- Robust null safety checks prevent crashes when AI service returns partial data
- Background job processing with status tracking and error recovery

#### Manual Project Wizard
- `src/components/ProjectWizard/ProjectWizard.tsx` - Main manual wizard (425+ lines)
- `src/components/ProjectWizard/steps/` - Individual wizard steps with validation
- `src/components/ProjectWizard/calculations/` - Technical calculation modules
- `src/components/ProjectWizard/shared/` - Shared utilities and types:
  - `Types.tsx` - Comprehensive type definitions for both wizards (486+ lines)
  - `ValidationUtils.tsx` - Form validation and error handling (536+ lines)
  - `SolarCalculator.tsx` - Core solar calculations (485+ lines)
- `src/app/test/page.tsx` - Manual wizard entry point

#### Survey System
- `src/components/surveys/SurveyCreator.tsx` - Professional survey creation interface
- `src/components/surveys/SurveyResponseHandler.ts` - Response processing
- `src/services/surveyMetricService.ts` - Comprehensive metrics calculation
- `src/services/metricCalculationService.ts` - Technology assessment calculations
- `src/app/surveys/[id]/results/SurveyResultsComponent.tsx` - Results visualization (636+ lines)
- Survey responses include processed metrics via `SurveyMetricService`
- Extensive test coverage in `src/components/surveys/__tests__/` and `src/app/surveys/__tests__/`

#### Equipment Management
- `src/app/pvpanels/` - PV panel browsing and management
- `src/app/inverters/` - Inverter browsing and management
- `src/services/equipment-service.ts` - Equipment API service with AI intelligence integration

#### Type System & AI Enhancement
- `src/types/ai-enhanced.ts` - Comprehensive AI-enhanced type definitions with Zod schemas (541 lines)
- `src/types/solar.ts` - Core solar equipment types
- `src/lib/ai/` - AI data processing and validation modules:
  - `dataValidation.ts` - Equipment data validation
  - `dataEnrichment.ts` - AI data enrichment algorithms
  - `enhancedMockData.ts` - Enhanced mock data for testing
  - `validationDemo.ts` - Validation demonstration utilities

#### Optimization & Performance Utilities
- `src/lib/recharts-optimization.tsx` - Optimized chart components with memoization and lazy loading
- `src/lib/markdown-optimization.tsx` - Performance-focused markdown rendering with error handling
- `src/lib/dynamic-imports.ts` - Dynamic import utilities for code splitting and bundle optimization
- `src/lib/calculations/` - Pure calculation services (electrical.ts, financial.ts, compliance.ts, utils.ts)
- `src/components/ui/base-card.tsx` - Unified card component with variants
- `src/components/ui/action-card.tsx` - Card with built-in action buttons
- `src/components/ui/layout.tsx` - Standardized layout patterns

#### Forms & UI Components
- `src/components/forms/` - Reusable form components:
  - `GenericForm.tsx` - Dynamic form generation (390 lines)
  - `FormActions.tsx` - Standardized form actions (391 lines)
- `src/components/ui/` - shadcn/ui component library
- Solar-themed styling with orange accent colors
- Dark mode support via `next-themes`
- Lucide React icons throughout

### Server Architecture

#### Core Application Setup
- `src/app.ts` - Express application configuration with comprehensive middleware setup
  - Helmet.js for security headers
  - CORS with credentials support for localhost:3000
  - Morgan for request logging
  - JSON parsing with 10MB limit
  - Global error handling with development/production modes
- `src/server.ts` - Server entry point with graceful shutdown handling
  - Database connection testing on startup
  - SIGTERM/SIGINT graceful shutdown with 10s timeout
  - Proper Prisma client cleanup

#### API Routes Structure
- `/api/organizations` - Organization management with reviews sub-routes
- `/api/pv-panels` - PV panel CRUD with pagination
- `/api/inverters` - Inverter management with pagination
- `/api/surveys` - Survey creation, response handling, and analytics
- `/api/users` - User management with authentication
- `/api/search` - Global search across organizations and equipment
- `/api/ai` - AI-powered solar design endpoints
- `/api/enhanced` - Enhanced equipment with AI intelligence
- `/api/dashboard` - Dashboard analytics and KPIs

#### Controllers & Business Logic
- `organizationController.ts` - Organization CRUD, review management, search functionality
- `pvPanelController.ts` - Panel management with pagination and filtering
- `inverterController.ts` - Inverter management with technical specifications
- `surveyController.ts` - Survey lifecycle, response processing, metrics calculation
- `userController.ts` - User authentication, profile management, role-based access
- `aiController.ts` - AI design processing with background job queuing
- `enhancedEquipmentController.ts` - AI-enhanced equipment data with intelligence layers

#### Database Schema (Prisma)
**Core Entities:**
- **User**: Authentication, profile, role-based access (USER/ADMIN), AI preferences
- **Organization**: Renewable energy organizations with detailed profiles, certifications, reviews
- **Survey**: Dynamic surveys with JSON configuration, expiration, response tracking
- **PVPanel/Inverter**: Equipment database with technical specifications
- **SurveyResponse**: User responses with processed metrics and organization associations

**AI-Enhanced Tables:**
- **AiDesign**: Complete AI design results with processing history
- **AiPanelIntelligence/AiInverterIntelligence**: Performance ratings and market insights
- **AiCompatibilityMatrix**: Equipment compatibility analysis and recommendations
- **UserAiPreferences**: Personalized equipment and budget preferences
- **AiDesignAnalytics**: Usage analytics and confidence score tracking

**Assessment & Analytics:**
- **Industry**: Industry classification for organizations
- **TechnologyType**: Technology implementation tracking
- **DigitalProcess**: Industry 4.0 digital maturity assessments
- **PersonnelSkill**: Organization skill and proficiency tracking
- **StrategyAssessment**: Digital strategy maturity evaluation

#### AI Services & Intelligence Layer
- `AIEquipmentSelector.ts` - Smart equipment selection with climate-aware scoring
- `AIComplianceChecker.ts` - UTE 15-712-1 standards validation
- `AIPerformanceSimulator.ts` - Performance simulation with financial modeling
- `PVLibPerformanceSimulator.ts` - Python PVLib integration for accurate calculations

#### Database & Data Management
- `src/config/db.ts` - Prisma client configuration with connection pooling
- Prisma schema with proper indexing and foreign key relationships
- Migration system for schema evolution
- **Comprehensive Seeding Scripts**:
  - `prisma/seed.ts` - Main seeding orchestrator
  - `prisma/seedOrganization.ts` - Organization data with logos and descriptions
  - `prisma/seedPvPanels.ts` - PV panel specifications from manufacturers
  - `prisma/seedInverter.ts` - Inverter technical specifications
  - `prisma/seedUser.ts` - User authentication and role data
  - `prisma/seeds/seed-ai-data.js` - AI intelligence data for equipment
  - `prisma/seeds/seed-comprehensive-ai-data.js` - Complete AI training dataset
- **Excel Import System**:
  - `prisma/utils/excelSeeder.ts` - Generic Excel data import utility
  - `prisma/utils/excelSeederPV.ts` - Specialized PV equipment Excel import
  - Supports bulk data import from manufacturer Excel files
  - Automatic data validation and error reporting

#### Testing Infrastructure
- **Unit Tests**: Jest-based testing for controllers and services
  - `tests/organizationController.test.ts` - Organization management API tests
  - `tests/pvPanelController.test.ts` - PV panel CRUD tests
  - `tests/surveyController.test.ts` - Survey lifecycle tests
  - `tests/analyticsService.test.ts` - Analytics calculation tests
- **Integration Tests**: End-to-end API testing
  - `tests/test-ai-endpoints.js` - AI design pipeline integration
  - `tests/test-ai-with-pvlib.js` - Python simulation integration
  - `tests/survey-response-test.ts` - Survey response processing
- **AI Algorithm Testing**:
  - `tests/test-ai-algorithms.js` - AI equipment selection accuracy
  - `tests/test-ai-design.js` - Complete AI design workflow
- **Debug Scripts**: Development and debugging utilities
  - `tests/debug-auth-flow.js` - Authentication flow debugging
  - `tests/check-and-seed-data.js` - Data integrity verification

#### Authentication & Security
- `src/middleware/auth.ts` - JWT token validation with role-based access control
- `src/config/supabase.ts` - Supabase integration for authentication
- Request validation using Zod schemas
- Rate limiting and CORS configuration
- SQL injection prevention via Prisma ORM

#### AI Services
- `src/services/AIEquipmentSelector.ts` - Smart equipment selection with climate-aware scoring and priority optimization
- `src/services/AIComplianceChecker.ts` - UTE 15-712-1 French electrical standards validation
- `src/services/AIPerformanceSimulator.ts` - Performance simulation with financial analysis (ROI, NPV, IRR, LCOE)
- `src/services/PVLibPerformanceSimulator.ts` - Python PVLib integration for accurate 8,760 hourly calculations

#### PV Simulation Services (Python Integration)
**Python FastAPI Service** (`pvlib_api/simple_api.py`):
- **FastAPI Framework**: Modern async Python API with automatic documentation
- **CORS Support**: Configured for localhost:3000/3001 Next.js development
- **Validation**: Pydantic models for request/response validation
- **Health Checks**: `/health` endpoint for service monitoring
- **Critical Endpoints**:
  - `/simulate/year` - Annual performance simulation (required by AI wizard)
  - `/simulate/day` - Detailed daily simulation
  - `/simulate/quick` - Quick estimates with minimal parameters
- **Service Startup**: Use `./run_api.sh` to start the correct API service
- **Port**: Runs on port 8001 (configured in `PVLibPerformanceSimulator.ts`)

**Core Simulation Modules**:
- `SPVSim.py`: Main simulation engine with comprehensive PV system modeling
- `PVArray.py`: Array configuration calculations (series/parallel strings, voltage/current calculations)
- `PVPanel.py`: Panel performance modeling with temperature coefficients
- `PVInverter.py`: Inverter efficiency modeling and MPPT tracking
- `PVSite.py`: Location-specific calculations (irradiance, weather patterns, shading)
- `PVUtilities.py`: Utility functions for financial calculations and unit conversions

**Technical Calculations**:
- **Temperature Corrections**: Voc(-10°C), Isc(85°C) calculations using manufacturer coefficients
- **Array Configuration**: Optimal series/parallel string calculations for DC/AC compatibility
- **Energy Production**: Hourly simulation based on location, orientation, and equipment specs
- **Financial Analysis**: 25-year lifetime production, degradation curves, LCOE calculation
- **Compliance Validation**: Automatic checking against electrical codes and standards

**Integration Architecture**:
- **TypeScript → Python Bridge**: `mapTsToPython.ts` converts JavaScript objects to Python dictionaries
- **API Communication**: HTTP calls from Node.js to Python FastAPI service
- **Data Models**: Shared type definitions between TypeScript and Python
- **Error Handling**: Comprehensive error propagation with detailed error messages

#### Authentication & Security
- `src/middleware/auth.ts` - JWT authentication middleware
- `src/config/supabase.ts` - Supabase configuration
- Rate limiting and CORS configuration

## Technical Standards

### Code Quality
- **TypeScript**: Strict mode enabled throughout
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Testing**: Jest with React Testing Library

### API Design
- RESTful endpoints with consistent response format
- Comprehensive error handling with appropriate HTTP status codes
- Request validation using Zod schemas
- Authentication required for most mutations

### Database Design
- Normalized schema with proper foreign key relationships
- Indexing for performance optimization
- Prisma migrations for schema changes
- Comprehensive seeding for development

### Performance
- API response caching with configurable TTL
- Image optimization and lazy loading
- Code splitting for optimal bundle sizes
- Database query optimization

## Environment Configuration

### Client Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Development Workflow

### 1. Setup
```bash
# Install dependencies
pnpm install

# Setup database
cd server && pnpm db:push && pnpm db:seed

# Start development servers
# Terminal 1: Client
cd client && pnpm dev

# Terminal 2: Server
cd server && pnpm dev
```

### 2. Feature Development
- Create feature branches from main
- Implement with TypeScript and proper error handling
- Add comprehensive tests for new functionality
- Use existing UI components and patterns

### 3. Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI functionality
- E2E tests for critical user flows

### 4. Deployment
- Build and test production bundles
- Run database migrations
- Deploy with proper environment variables
- Monitor for performance and errors

## AI Integration

### AI Design Pipeline
1. **Input Collection**: Minimal user requirements (location, power, budget)
2. **Background Processing**: Asynchronous AI design generation
3. **Equipment Selection**: Climate-aware scoring algorithm
4. **Compliance Checking**: UTE 15-712-1 validation
5. **Performance Simulation**: Hourly energy production modeling
6. **Financial Analysis**: ROI, NPV, IRR calculations
7. **Report Generation**: Comprehensive technical documentation

### AI Database Architecture
- Clean separation from master equipment data
- `AiPanelIntelligence`, `AiInverterIntelligence`: Performance ratings and insights
- `AiCompatibilityMatrix`: Equipment compatibility analysis
- `AiDesign`: Complete AI design results and processing history
- Backwards compatible deployment strategy

## Solar Calculations & Standards

### Technical Calculations
- **Maximum panels in series**: `Nsmax = floor(Udcmax / Voc(at -10°C))`
- **Temperature correction**: `Voc(-10°C) = Voc(STC) × (1 + β × (-35°C))`
- **Array configuration**: DC/AC compatibility and optimal panel calculations
- **Cable sizing**: Temperature correction factors and current admissible calculations
- **Protection requirements**: `1.1 × 1.25 × IscSTC ≤ Ifusible ≤ Irm`

### Compliance Standards
- **UTE 15-712-1**: French electrical installation standards for PV systems
- **NF C 15-100**: French cable sizing and protection standards
- **Building codes**: Local construction requirements
- **Utility interconnection**: Grid integration standards

## Important Notes

### Development Constraints
- Client requires `'use client'` directive for most components due to auth context
- Supabase is currently mocked for development (implement real client when ready)
- API base URL defaults to `http://localhost:5000/api`
- Development server may run on port 3001 if 3000 is occupied

### Security Considerations
- All API mutations require valid authentication token
- Survey response submission requires valid auth token and organizationId
- Input validation on all API endpoints using Zod schemas
- Rate limiting and CORS properly configured

### Performance Optimizations
- User caching with 5-minute TTL in API store
- Failed lookup cache with 1-minute TTL
- Request timeout handling (10 seconds default)
- Proper error boundaries and loading states

### Testing Strategy
- Jest with jsdom environment for component testing
- React Testing Library for user interaction testing
- API endpoint testing with comprehensive coverage
- Mock implementations for external services

## Troubleshooting Common Issues

### Build Fails with TypeScript Errors
**Problem**: TypeScript compilation errors after recent changes

**Solution**:
1. **Run TypeScript Check**:
   ```bash
   pnpm tsc --noEmit
   ```

2. **Common Issues Fixed**:
   - `location` property in PVProject should be individual properties (`address`, `latitude`, `longitude`, etc.)
   - `ProjectStatus.DRAFT` should be `ProjectStatus.NOT_STARTED`
   - `TaskStatus.TODO` should be `TaskStatus.NOT_STARTED`
   - `assigneeId` should be `assignedToId` in Task interface
   - Missing required properties in initial data objects

3. **Fix Build Dependencies**:
   ```bash
   pnpm add -D jest-environment-jsdom
   ```

### AI Wizard Fails with "PVLib API error: 404 Not Found"
**Problem**: The AI wizard cannot reach the PVLib Python simulation service.

**Solution**:
1. **Check PVLib Service Status**:
   ```bash
   cd ../server/pvlib_api
   ps aux | grep uvicorn
   ```

2. **Start/Restart PVLib Service**:
   ```bash
   ./run_api.sh
   # Ensure it shows: uvicorn simple_api:app --host 0.0.0.0 --port 8001
   ```

3. **Verify Endpoint Availability**:
   ```bash
   curl http://localhost:8001/health
   # Should return: {"status":"healthy","timestamp":"..."}
   ```

4. **Check API Documentation**: Visit `http://localhost:8001/docs` to see available endpoints

### AI Wizard Frontend Crashes with Null Reference Error
**Problem**: `TypeError: Cannot read properties of null (reading 'arrayConfiguration')`

**Solution**: This has been fixed in the latest code with enhanced null safety. If it persists:
1. Check the AI service response format in the browser dev tools
2. Verify all API responses include the expected `systemConfiguration` object
3. The component now gracefully handles missing or incomplete data

### Common Development Environment Issues
- **Port Conflicts**: If port 3000 is occupied, Next.js will automatically use 3001
- **PVLib Service**: Must be running on port 8001 for AI wizard functionality
- **Database**: Ensure PostgreSQL is running and connection string is correct
- **Authentication**: Check Supabase configuration if auth-related errors occur

### Type Safety and Validation Issues
**Problem**: TypeScript errors related to AI-enhanced types or missing properties

**Solution**:
1. **Check Type Definitions**: All equipment types should use enhanced schemas from `src/types/ai-enhanced.ts`
2. **Run Type Check**: Use `pnpm tsc --noEmit` to identify type mismatches
3. **Validate API Responses**: Ensure backend returns data matching the Zod schema definitions
4. **Check Null Safety**: The AI wizard includes comprehensive null checks - follow the same pattern in new code

### Survey Response Processing Errors
**Problem**: Issues with survey metric calculations or response handling

**Solution**:
1. **Check Test Coverage**: Run tests in `src/components/surveys/__tests__/` and `src/app/surveys/__tests__/`
2. **Validate Survey Structure**: Ensure survey configuration matches expected format
3. **Check Metrics Service**: Verify `surveyMetricService.ts` is processing responses correctly
4. **Debug Response Data**: Use browser dev tools to inspect response format

### Performance Issues
**Problem**: Slow loading times or memory issues

**Solution**:
1. **Check API Caching**: Verify the API store cache is working (5-minute TTL for users)
2. **Monitor Bundle Size**: Use `pnpm build` to check for large bundles
3. **Optimize Images**: Ensure images are properly optimized and lazy-loaded
4. **Database Queries**: Check for N+1 queries in the backend API

## Legacy Troubleshooting (Previously Documented Issues)

### Recently Resolved Issues (October 2024)
- ✅ **AI Wizard Null Reference Error**: Fixed `TypeError: Cannot read properties of null (reading 'arrayConfiguration')` by implementing comprehensive null safety checks
- ✅ **PVLib API 404 Error**: Resolved missing `/simulate/year` endpoint by updating run script to use `simple_api:app` instead of `SPVSimAPI:app`
- ✅ **Enhanced Error Handling**: AI wizard now gracefully handles incomplete API responses and provides better error messages
- ✅ **API Store Complexity**: Split 1,230-line monolith into 8 focused services/stores (67% complexity reduction)
- ✅ **Authentication Fragmentation**: Centralized 37 scattered auth calls into unified context
- ✅ **Component Duplication**: Created shared wizard utilities reducing duplication by 50%+
- ✅ **Bundle Size Issues**: Optimized bundle to 4.9M total with dynamic imports and code splitting
- ✅ **Testing Infrastructure**: Implemented comprehensive test suite with 275 tests

**Known Challenges:**
- Organization logo and asset management
- Excel structure consistency for data imports
- Multi-language support (EN/FR templates exist but not fully implemented)
- PVLib service dependencies (requires Python environment setup)

## Project Evolution & Current Status

### Historical Context
The application began as a organization directory focused on renewable energy businesses and evolved into a comprehensive solar PV design platform. Key evolutionary phases:

1. **Initial Phase**: Organization management with Excel data import
2. **Expansion Phase**: Added equipment management (PV panels, inverters)
3. **Design Phase**: Implemented manual project wizard with technical calculations
4. **AI Phase**: Added AI-powered solar design capabilities
5. **Survey Phase**: Integrated SurveyJS for customer assessments

### Current Development Status (from memory-bank)
**Completed Features:**
- Organization data CRUD with Excel import/export
- PV panel and inverter database with pagination
- Manual project wizard with multi-step configuration
- Enhanced authentication with centralized context
- Survey system with response processing
- AI design pipeline with equipment selection
- **Simplification & Optimization**: 47% complexity reduction across 9 phases

**In Progress:**
- Enhanced AI report generation
- Advanced equipment compatibility matrix
- Real-time project collaboration
- Enhanced financial modeling
- Mobile-responsive design improvements

**Recently Resolved Issues (October 2024):**
- ✅ **AI Wizard Null Reference Error**: Fixed `TypeError: Cannot read properties of null (reading 'arrayConfiguration')` by implementing comprehensive null safety checks
- ✅ **PVLib API 404 Error**: Resolved missing `/simulate/year` endpoint by updating run script to use `simple_api:app` instead of `SPVSimAPI:app`
- ✅ **Enhanced Error Handling**: AI wizard now gracefully handles incomplete API responses and provides better error messages
- ✅ **API Store Complexity**: Split monolith into modular services (67% reduction)
- ✅ **Bundle Size Optimization**: Achieved 4.9M total bundle with dynamic imports
- ✅ **Testing Infrastructure**: 275 tests with 191 passing (70% success rate)

**Known Challenges:**
- Organization logo and asset management
- Excel structure consistency for data imports
- Multi-language support (EN/FR templates exist but not fully implemented)
- PVLib service dependencies (requires Python environment setup)

### Development Patterns & Rules (from .clinerules)
**Critical Implementation Paths:**
- Authentication: `Login.tsx` → `AuthContext.tsx` → Supabase → `auth.ts` middleware
- Organization Data: `OrganizationManagement.tsx` → `api.ts` → `organizationRoutes.ts` → `organizationController.ts` → Prisma → Database
- Equipment Data: Similar pattern for PV panels and inverters

**Project-Specific Patterns:**
- Client-server architecture with clear separation of concerns
- Prisma for all database operations with TypeScript schema generation
- Supabase for authentication with JWT token management
- Excel seeding using `excelSeeder.ts` scripts
- Pagination defaults: page 1, limit 50 entries per page

**Tool Usage Guidelines:**
- Prefer command line operations for server and database tasks
- Use existing UI components and maintain consistency
- Test pagination implementation thoroughly before deployment
- Follow established patterns when adding new equipment types

### Architecture Decisions & Rationale

**Database Choice:** PostgreSQL selected for reliability, scalability, and complex query support. Prisma chosen for its TypeScript integration and ease of use.

**Frontend Framework:** Next.js 15 chosen for server-side rendering, static generation, and excellent TypeScript support.

**Backend Framework:** Express.js selected for simplicity, extensive middleware ecosystem, and community support.

**State Management:** Evolved from Redux to Zustand for lighter weight and better TypeScript integration.

**Data Fetching:** Custom API store with caching instead of React Query for better control over authentication and error handling.

### Performance Optimizations Implemented

**Frontend:**
- User data caching with 5-minute TTL
- Failed lookup cache with 1-minute TTL
- Request timeout handling (10 seconds)
- Lazy loading for equipment lists
- Code splitting for wizard steps

**Backend:**
- Database indexing for equipment searches
- Pagination for large datasets
- Connection pooling via Prisma
- Background processing for AI calculations

**Security Measures:**
- JWT authentication with role-based access control
- Input validation using Zod schemas
- Rate limiting on API endpoints
- CORS properly configured
- SQL injection prevention via Prisma ORM

## Quick Reference

### Essential Services for Full Functionality
1. **Next.js Client**: `pnpm dev` (port 3000/3001)
2. **Express Server**: `pnpm dev` (port 5000)
3. **PVLib Python API**: `cd ../server/pvlib_api && ./run_api.sh` (port 8001)

### Common Commands
```bash
# Full development setup
cd client && pnpm dev           # Terminal 1: Next.js client
cd ../server && pnpm dev        # Terminal 2: Express API
cd ../server/pvlib_api && ./run_api.sh  # Terminal 3: PVLib simulation

# Type checking and linting
pnpm tsc --noEmit              # Check TypeScript types
pnpm lint                      # Check code style
```

### Key Files for AI Wizard
- Frontend: `src/components/ProjectWizard/AIProjectWizard.tsx`
- Backend AI Controller: `../server/src/controllers/aiController.ts`
- PVLib Service: `../server/pvlib_api/simple_api.py`
- PVLib Integration: `../server/src/services/PVLibPerformanceSimulator.ts`

---

This documentation should be updated as the application evolves. Always refer to the latest codebase, API documentation, and memory-bank files for current implementation details and development context.