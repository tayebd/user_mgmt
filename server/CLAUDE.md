# CLAUDE.md

## Project Overview

Full-stack renewable energy management application with a focus on solar PV system design and organization directory. Structured as a monorepo with separate client (Next.js) and server (Node.js/Express) applications, plus Python-based technical calculation tools.

## Architecture

### Backend Structure (`/server`)
**Express + Prisma MVC Pattern:**
- **`src/server.ts`**: Entry point - initializes Prisma, starts Express server
- **`src/app.ts`**: Express app configuration - middleware (CORS, Helmet, Morgan), route registration
- **`src/routes/`**: Route definitions mapping endpoints to controllers
- **`src/controllers/`**: Business logic handlers for each route
- **`src/middleware/`**: Auth validation, request validation (`auth.ts` - Supabase JWT)
- **`prisma/`**: Database schema, migrations, seed scripts
- **`shared/types/`**: Auto-generated Zod schemas and types shared with client
- **`pvlib_api/`**: Python FastAPI service for PV simulations
- **`tests/`**: Jest unit tests for controllers

### Database
**PostgreSQL via Prisma ORM:**
- Complex schema with 30+ models including organization management, PV equipment, project management, and surveys
- Authentication via Supabase JWT integration
- Excel import utilities for bulk data seeding

## Development Commands

### Server
```bash
pnpm run dev          # Start development server with hot reload
pnpm run build        # Compile TypeScript to dist/
pnpm start            # Run production build from dist/

# Database
npx prisma generate   # Generate Prisma Client after schema changes
npx prisma migrate dev --name <name>   # Create and apply migration
pnpm run seed         # Seed database with base data
pnpm run seed:excel   # Import organizations from Excel
pnpm run seed:excelPV # Import PV panels/inverters from Excel

# Type Generation
pnpm run generate:types   # Generate shared Zod schemas + TypeScript types

# Testing
pnpm test            # Run all Jest tests
pnpm test <filename> # Run specific test file
```

### Client
```bash
pnpm run dev              # Start Next.js dev server (port 3000)
pnpm run build            # Production build
pnpm run lint             # ESLint
pnpm run type-check       # TypeScript type checking
pnpm test                 # Run Jest tests
```

## Environment Variables

### Server (`.env`)
```env
# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Cookie Security
COOKIE_SECRET=your-64-char-random-string
COOKIE_DOMAIN=localhost

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

## Key Features

### Project Wizard
- **Multi-step form** for solar system design at `src/components/ProjectWizard/`
- **Integration** with Python PV simulation engine (`/server/pvlib_api/`)
- **Real-time simulation** and performance analysis
- **Comprehensive results** with metrics, tables, and interactive charts

### Equipment Management
- **PV Panels**: Database with performance ratings
- **Inverters**: String/central inverters with efficiency curves
- **Organizations**: Business management with review systems

### Python PV Simulation (`/server/pvlib_api/`)
**FastAPI-based solar PV production simulation using pvlib library**

**Key files:**
- `SPVSimAPI.py` - Main API server (port 8001)
- `simple_api.py` - Simplified API interface
- `run_api.sh` - Startup script

**API Endpoints (Port 8001):**
- `POST /simulate` - Main simulation endpoint
- `GET /simulate/quick` - Quick simulation
- `POST /simulate/year` - Full year production simulation

**Starting the Simulation Server:**
```bash
cd /server/pvlib_api
./run_api.sh    # Starts FastAPI server on port 8001
```

## Database Management

**Key Commands:**
```bash
# After schema changes
npx prisma generate
npx prisma migrate dev --name descriptive_name

# Seed data
pnpm run seed          # Base seed
pnpm run seed:excel    # Import organizations from Excel
pnpm run seed:excelPV  # Import PV panels and inverters
```

## Shared Types System

**Important:** Server generates Zod schemas and TypeScript types in `/server/shared/types/` using `pnpm run generate:types`. Client accesses these via symlink at `/client/src/shared -> /server/shared`.

**When modifying equipment models:** Run `pnpm run generate:types` from server to update shared types.

## Package Manager

**Use pnpm exclusively** - project has pnpm-lock.yaml configurations. Run `pnpm i` in both `/client` and `/server` after cloning.

## Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js and TypeScript
- Use async/await for asynchronous operations
- Prisma Client is instantiated once and reused (singleton pattern)
- Error handling: Controllers catch errors and return appropriate HTTP status codes
- API responses: JSON format with `{ data, error }` structure

## Key Components & Patterns

**Authentication:**
- Supabase-based JWT authentication
- Middleware at `src/middleware/auth.ts` validates tokens
- React Context for client-side auth state

**Data Flow:**
- Frontend API calls → Express routes → Prisma → Database
- Component → Store/Service → API → Controller → Prisma → Database
- Pagination: Default page 1, limit 50 entries per page

**Project Wizard Integration:**
- Form data transformed using `transformPVProjectToAPIFormat()`
- API call to Python simulation server: `POST http://localhost:8001/simulate`
- Results displayed with comprehensive metrics, tables, and charts
- Real-time data processing: hourly → daily → monthly aggregations

## Testing

**Server:** Jest with ts-jest preset. Tests in `/server/tests/`.
**Client:** Jest + React Testing Library.

## Troubleshooting

### PVLib API Issues
```bash
cd /server/pvlib_api
./run_api.sh
curl http://localhost:8001/health  # Verify endpoint
```

### Database Issues
- Ensure PostgreSQL is running
- Check connection string in server/.env
- Verify database exists

### Port Conflicts
- Client uses port 3001 if 3000 is occupied
- Server API port: 5000
- PVLib Python API port: 8001
