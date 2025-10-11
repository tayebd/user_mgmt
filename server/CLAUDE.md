# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack renewable energy management application with a focus on solar PV system design and company directory. Structured as a monorepo with separate client (Next.js) and server (Node.js/Express) applications, plus Python-based technical calculation tools.

## Common Development Commands

### Server (from `/server` directory)

**Development:**
```bash
pnpm run dev          # Start development server with hot reload (nodemon + tsx)
pnpm run build        # Compile TypeScript to dist/
pnpm start            # Run production build from dist/
```

**Database:**
```bash
npx prisma generate                    # Generate Prisma Client after schema changes
npx prisma migrate dev --name <name>   # Create and apply migration
pnpm run seed                          # Seed database with base data
pnpm run seed:excel                    # Import companies from Excel
pnpm run seed:excelPV                  # Import PV panels/inverters from Excel
```

**Type Generation:**
```bash
pnpm run generate:types   # Generate shared Zod schemas + TypeScript types for client/server
```

**Testing:**
```bash
pnpm test                 # Run all Jest tests
pnpm test <filename>      # Run specific test file
```

### Client (from `/client` directory)

**Development:**
```bash
pnpm run dev              # Start Next.js dev server (port 3000)
pnpm run build            # Production build
pnpm start                # Run production server
```

**Code Quality:**
```bash
pnpm run lint             # ESLint
pnpm run type-check       # TypeScript type checking without build
pnpm run tsc              # Same as type-check
```

**Testing:**
```bash
pnpm test                 # Run Jest tests
pnpm run test:watch       # Jest watch mode
pnpm run test:coverage    # Generate coverage report
```

**Dependency Management:**
```bash
pnpm run update:check     # Check outdated packages
pnpm run update:next      # Update Next.js specifically
pnpm run update:deps      # Update all dependencies to latest
```

## Architecture

### Backend Structure (`/server`)

**Express + Prisma MVC Pattern:**
- **`src/server.ts`**: Entry point - initializes Prisma, starts Express server, handles graceful shutdown
- **`src/app.ts`**: Express app configuration - middleware (CORS, Helmet, Morgan), route registration, error handling
- **`src/routes/`**: Route definitions mapping endpoints to controllers
  - `companyRoutes.ts`, `pvPanelRoutes.ts`, `inverterRoutes.ts`, `surveyRoutes.ts`, `userRoutes.ts`, `dashboardRoutes.ts`, `searchRoutes.ts`
- **`src/controllers/`**: Business logic handlers for each route
  - Example: `companyController.ts`, `pvPanelController.ts`, `inverterController.ts`, `surveyController.ts`, `userController.ts`
- **`src/middleware/`**: Auth validation, request validation
  - `auth.ts` - Supabase JWT authentication middleware
  - `validateRequest.ts` - Request validation middleware
- **`src/config/`**: Configuration files (e.g., `supabase.ts`)
- **`src/utils/`**: Shared utilities (e.g., `auth.ts`)
- **`src/types/`**: TypeScript type definitions
- **`prisma/`**: Database schema, migrations, seed scripts
  - `schema.prisma` - Database models (User, Company, PVPanel, Inverter, Survey, PVProject, etc.)
  - `seed.ts` - Base seeding script
  - `utils/excelSeeder.ts`, `utils/excelSeederPV.ts` - Excel import utilities
- **`shared/types/`**: Auto-generated Zod schemas and types shared with client (via symlink)
- **`tests/`**: Jest unit tests for controllers
- **`tech_study/`**: Python-based solar calculation API (Flask) with Jinja2 report templates

**Authentication:** Supabase-based JWT authentication. Middleware at `src/middleware/auth.ts` validates tokens. Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `COOKIE_SECRET`, `COOKIE_DOMAIN`.

**Database:** PostgreSQL via Prisma ORM. Complex schema with 30+ models including company management (Company, Industry, Certification, Service), PV equipment (PVPanel, Inverter, BatteryBank, ChargeController, Wire, ProtectionDevice, MountingHardware), project management (PVProject, PVArray, Load, ProjectEquipment), and surveys (Survey, SurveyResponse).

### Frontend Structure (`/client`)

**Next.js 15 App Router + TypeScript:**
- **`src/app/`**: File-based routing (App Router)
  - `page.tsx` - Root landing page
  - `layout.tsx` - Root layout with AuthProvider and Toaster
  - `api/` - API routes (if any server-side logic)
  - `companies/`, `dashboard/`, `inverters/`, `pvpanels/`, `surveys/`, `users/`, `welcome/` - Feature pages
  - `login/` - Authentication pages
- **`src/components/`**: Reusable UI components
  - `Auth/` - Login, registration components
  - `ui/` - ShadCN/UI primitives (Button, Dialog, Card, Toast, etc.)
  - `ProjectWizard/` - Multi-step solar project design wizard
- **`src/lib/`**: Client utilities
  - `supabase.ts` - Supabase client configuration (currently mock for development)
- **`src/services/`**: API client functions (Axios-based)
- **`src/state/`**: State management (Zustand stores, API integration)
- **`src/contexts/`**: React Context providers (e.g., `AuthContext`)
- **`src/shared/`**: Symlinked to server's shared types for consistency
- **`public/`**: Static assets (company logos, data files)

**State Management:** Zustand for global state, React Context for auth, React Hook Form + Zod for form validation.

**UI Library:** ShadCN/UI (Radix UI primitives) + Tailwind CSS 4, Lucide icons.

**Key Features:**
- **Project Wizard:** Multi-step form for solar system design (location, panel selection, inverter selection, mounting, report generation) at `src/components/ProjectWizard/`
- **Survey System:** SurveyJS integration for dynamic surveys (Industry 4.0, supply chain assessments)
- **Google Maps:** Location selection and project mapping
- **Dashboards:** Recharts-based analytics with KPI cards

### Shared Types System

**Important:** Server generates Zod schemas and TypeScript types in `/server/shared/types/` using `pnpm run generate:types`. Client accesses these via symlink at `/client/src/shared -> /server/shared`. This ensures type consistency across client/server for PV-related entities (PVPanel, Inverter, BatteryBank, etc.).

**When modifying equipment models:** Run `pnpm run generate:types` from server to update shared types.

## Database Management

**Key Commands:**
```bash
# After schema changes
npx prisma generate
npx prisma migrate dev --name descriptive_name

# Seed data
pnpm run seed          # Base seed (sample companies, users)
pnpm run seed:excel    # Import companies from Excel files
pnpm run seed:excelPV  # Import PV panels and inverters from Excel

# Reset auto-increment ID (PostgreSQL)
# Run this SQL in PgAdmin if needed after manual data operations:
SELECT setval(pg_get_serial_sequence('"ModelName"', 'id'), coalesce(max(id)+1, 1), false) FROM "ModelName";
```

**Excel Import Dependencies:** Excel seeding scripts expect specific column structures. Files should be placed appropriately and referenced in `prisma/utils/excelSeeder*.ts` scripts.

**Database URL:** Set `DATABASE_URL` in `.env` (format: `postgresql://user:password@host:port/database`)

## Environment Variables

### Server (`.env`)
```
# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Cookie Security
COOKIE_SECRET=your-64-char-random-string  # Generate with: openssl rand -base64 48
COOKIE_DOMAIN=localhost  # or production domain

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# Add Google Maps API key if using location features
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

## Testing

**Server:** Jest with ts-jest preset. Tests in `/server/tests/`. Configuration in `package.json` jest section.
- Test match pattern: `**/tests/**/*.test.ts`
- Run: `pnpm test` or `pnpm test <filename>`

**Client:** Jest + React Testing Library. Configuration in `package.json` and `jest.config.js`.
- Run: `pnpm test` (from client directory)

## Python Tools (`/server/tech_study/`)

Separate Flask-based API for advanced solar calculations (array configuration, cable sizing, grounding, protection). Uses YAML configs and generates Markdown reports (English/French templates).

**Key files:**
- `api.py` - Flask API endpoints
- `calculate.py` - Calculation logic
- `templates/` - Jinja2 templates for report generation

## Package Manager

**Use pnpm exclusively** - project has pnpm-lock.yaml and pnpm-specific configurations in package.json. Run `pnpm i` in both `/client` and `/server` after cloning.

## CORS Configuration

Server configured for cross-origin requests from `CLIENT_URL` environment variable (defaults to `http://localhost:3000`). Supports credentials for cookie-based auth.

## Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js and TypeScript
- Use async/await for asynchronous operations
- Prisma Client is instantiated once and reused (singleton pattern)
- Error handling: Controllers catch errors and return appropriate HTTP status codes
- API responses: JSON format with `{ data, error }` structure
