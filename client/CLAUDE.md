# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 client application for a solar PV (photovoltaic) project management system with survey capabilities. The app uses TypeScript, React 19 RC, Tailwind CSS, and Supabase for authentication. The backend API runs separately on port 5000 (8000 for API, 8001 for simulation/report generation).

## Common Commands

### Development
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` or `pnpm tsc` - Run TypeScript compiler (no emit)

### Testing
- `pnpm test` - Run all tests with Jest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report

### Dependencies
- `pnpm update:check` - Check for outdated packages
- `pnpm update:next` - Update Next.js and eslint-config-next
- `pnpm update:deps` - Update all dependencies to latest

## Architecture

### State Management
- **Zustand** (`src/state/api.ts`): Global API state store managing all data fetching and caching
  - User cache with 5-minute TTL, failed lookup cache with 1-minute TTL
  - All API calls go through this store
  - API base URL: `process.env.NEXT_PUBLIC_API_URL` (default: http://localhost:5000/api)

### Authentication
- **Supabase Auth** (`src/lib/supabase.ts`): Currently using mock implementation for development
- **AuthContext** (`src/contexts/AuthContext.tsx`): React context provider for auth state
- Auth tokens obtained via `getAuthToken()` utility and passed as `Authorization: Bearer` headers

### API Integration
- Backend REST API uses credential-based requests (`credentials: 'include'`)
- Most mutations require authentication token in Authorization header
- API responses expect JSON format
- Survey responses include processed metrics via `SurveyMetricService`

### Key Features & Components

#### Survey System
- **Survey Creation**: Using SurveyJS library (survey-core, survey-creator-react)
- **Survey Responses**: Stored with processed metrics, linked to companies and users
- **Survey Results**: Display aggregated response data
- Located in `src/app/surveys/` and `src/components/surveys/`

#### Solar PV Project Wizard
- Multi-step wizard for creating solar PV projects (`src/components/ProjectWizard/`)
- Steps: Location → Array Attributes → Inverters → Mounting → Misc Equipment → Report
- Uses react-hook-form with Zod validation
- Calculations in `src/components/ProjectWizard/calculations/`
- Report generation endpoint: http://localhost:8001/simulate-and-report

#### Companies & Reviews
- Company management with descriptions, reviews, and ratings
- Review system linked to companies
- Company routes: `/companies`, `/companies/[id]`, `/companies/create`, `/companies/edit/[id]`

### Shared Types
- `src/shared/` is a symlink to `/home/tayebd/apps/user_mgmt/server/shared`
- Shared types include: `PVPanel`, `Inverter`, `PVProject`, and validation schemas
- Import from `@/shared/types` for type definitions shared between client and server

### UI Components
- **shadcn/ui**: Pre-built components in `src/components/ui/`
- Uses Radix UI primitives with Tailwind styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Sonner** for toast notifications via `src/components/ui/toaster.tsx`

### Styling
- Tailwind CSS 4.0 with CSS variables for theming
- Dark mode support via `next-themes` (class-based)
- Custom design tokens in CSS variables (--primary, --secondary, etc.)
- Typography plugin enabled for markdown content

## Development Notes

### Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json)

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL (see .env.example)
- Store in `.env.local` (gitignored)

### Testing
- Jest with jsdom environment
- React Testing Library for component tests
- Tests in `__tests__` directories or `*.test.ts(x)` files
- Mock for react-markdown due to ESM compatibility

### Special Considerations
- Supabase is currently mocked (src/lib/supabase.ts) - implement real Supabase client when ready
- Survey response submission requires valid auth token and companyId
- PV project calculations depend on array configuration and equipment selection
- The app uses Next.js App Router (not Pages Router)
- Client-side rendering required for most pages due to auth context (`'use client'` directive)

### Common Patterns
- API functions return promises and throw errors on failure - handle with try/catch
- Form validation uses react-hook-form + Zod schemas
- Loading states managed locally in components
- Error handling typically logs to console and re-throws for component handling
