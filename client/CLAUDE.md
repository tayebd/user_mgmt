# CLAUDE.md

## Project Overview

Solar PV project management and design system with AI-powered capabilities. Next.js 15 client + Express.js backend providing solar project design, equipment management, survey systems, and AI-driven optimization.

## Architecture

### Client (Next.js 15)
- **Framework**: Next.js 15, React 19 RC, TypeScript
- **UI**: Tailwind CSS 4.0, shadcn/ui components
- **State**: Zustand for global state
- **Auth**: Supabase Auth with context management
- **Dev Server**: Port 3000/3001

### Server (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT tokens with Supabase integration
- **API Port**: 5000, PVLib Python API: 8001

## Key Features

### AI-Powered Solar Design
- **AI Project Wizard** (`/ai-wizard`): 4-step intelligent solar system design
- **Equipment Selection**: Climate-aware scoring algorithm
- **Performance Simulation**: 8,760 hourly calculations via PVLib Python API
- **Compliance**: UTE 15-712-1 French electrical standards
- **Financial Analysis**: ROI, NPV, IRR, LCOE calculations

### Manual Project Wizard
- **Multi-step Process**: Location → Array → Inverters → Mounting → Report
- **Real-time Calculations**: Array config, cable sizing, protection devices
- **Equipment Database**: PV panels, inverters, mounting hardware

### Equipment Management
- **PV Panels**: Database with AI-enhanced performance ratings
- **Inverters**: String/central inverters with efficiency curves
- **Organizations**: Business management with review systems
- **AI Intelligence**: Performance ratings, market insights, compatibility matrices

## Development Commands

### Client
```bash
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm test                   # Run tests
pnpm type-check            # TypeScript check
pnpm lint                  # Lint code
```

### Server
```bash
pnpm dev                    # Start server with reload
pnpm build                  # Build TypeScript
pnpm db:push               # Push schema changes
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database

# PVLib Python API (required for AI wizard)
cd ../server/pvlib_api && ./run_api.sh
```

## Setup
```bash
# Install dependencies
pnpm install

# Setup database
cd server && pnpm db:push && pnpm db:seed

# Start services (3 terminals)
cd client && pnpm dev       # Terminal 1
cd server && pnpm dev       # Terminal 2
cd server/pvlib_api && ./run_api.sh  # Terminal 3
```

## File Structure

### Client
- `src/app/` - Next.js pages and layouts
- `src/components/shared/` - Reusable component library
- `src/components/ProjectWizard/` - AI and manual wizards
- `src/stores/` - Zustand stores for state management
- `src/services/` - API services
- `src/types/` - TypeScript type definitions

### Server
- `src/routes/` - API route definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic and AI services
- `prisma/` - Database schema and migrations
- `pvlib_api/` - Python FastAPI service for PV simulations

## Environment Variables

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Troubleshooting

### AI Wizard "PVLib API error: 404 Not Found"
```bash
cd ../server/pvlib_api
./run_api.sh
curl http://localhost:8001/health  # Verify endpoint
```

### Database Issues
- Ensure PostgreSQL is running
- Check connection string in server/.env
- Verify database exists

## Key Pages & Components

**Main Pages**:
- `/` - Landing page
- `/ai-wizard` - AI project wizard
- `/pvpanels` - PV panel management
- `/inverters` - Inverter management
- `/organizations` - Organization directory

**Key Files**:
- `src/components/ProjectWizard/AIProjectWizard.tsx` - AI wizard
- `src/services/api-client.ts` - Base HTTP client
- `src/contexts/AuthContext.tsx` - Authentication context

**API Endpoints**:
- `/api/organizations` - Organization CRUD
- `/api/pv-panels` - PV panel CRUD
- `/api/inverters` - Inverter CRUD
- `/api/ai` - AI design endpoints
