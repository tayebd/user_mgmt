# Codebase Overview

Your codebase is a full-stack web application focused on **user management and renewable energy project planning**, particularly for solar power systems. It's structured as a monorepo with separate frontend and backend directories, emphasizing scalability, data import from Excel, and interactive tools like a project wizard. The project appears to be in active development, with a focus on master data (e.g., PV panels, inverters) and user authentication. Below is a high-level breakdown based on the file structure, dependencies, and documentation (including the memory bank).

## Project Structure
The root directory (`/home/tayebd/apps/user_mgmt`) contains:
- **client/**: Frontend application (Next.js-based).
- **server/**: Backend API (Node.js/Express) and tools (includes a `tech_study/` subdirectory with Python scripts for calculations and report generation).
- **memory-bank/**: Documentation files (Markdown) for project context, progress, and patterns (as per Cline's memory system).
- **Other root files**:
  - `.clinerules`: Project-specific rules and learned patterns (e.g., authentication paths, tool usage).
  - `README.md`: High-level setup guide.
  - `.gitignore`, `.github/`: Standard Git and workflow configs.
  - `cline_docs/`: Likely additional documentation or Cline-specific notes.

Key subdirectories in `client/`:
- **src/app/**: Next.js app router pages (e.g., `/dashboard`, `/inverters`, `/pvpanel`, `/project-wizard` routes).
- **src/components/**: Reusable UI components (e.g., `ProjectWizard/`, `Auth/`, `ui/` for ShadCN primitives like buttons, dialogs).
- **src/lib/**: Utilities (e.g., Supabase client, types).
- **src/state/**: State management (e.g., `api.ts` for data fetching, `auth.ts`).
- **public/**: Static assets (company images, data files like `dashboard_data.js`, survey JSONs).
- **tests/**: Test data (various survey JSONs for Industry 4.0/digital maturity assessments – suggests integration with survey tools).

In `server/`:
- Core backend files (inferred from memory bank: `companyRoutes.ts`, `pvPanelController.ts`, etc., though not all listed).
- `tech_study/`: Python-based tools for technical studies (e.g., `api.py`, `calculate.py`, templates for reports in English/French, YAML configs for components and calculations). This seems like a specialized module for solar system simulations (array config, cable sizing, grounding).

## Technology Stack
### Frontend (client/)
- **Framework**: Next.js 15 (App Router, TypeScript, server-side rendering).
- **UI/Styling**: Tailwind CSS 4, ShadCN/UI components (Radix UI primitives), Lucide icons.
- **State/Data Management**:
  - Zustand (lightweight store).
  - Axios for API calls.
  - React Hook Form + Zod for forms/validation.
- **Authentication**: Supabase (client-side JS SDK).
- **Other Libraries**:
  - Google Maps API for location/project mapping.
  - SurveyJS for dynamic surveys (e.g., Industry 4.0 assessments – multiple test JSONs in `tests/testdata/`).
  - Recharts for dashboards/charts.
  - React Markdown + MathJax for rendering reports with equations.
  - Drag-and-drop (DND Kit) for wizard interactions.
- **Testing**: Jest + React Testing Library, TypeScript checks.
- **Build/Tools**: pnpm, ESLint (Next.js config), PostCSS.

Dependencies highlight a focus on interactive, data-heavy UIs: surveys, maps, charts, and forms for project configuration.

### Backend (server/)
- **Framework**: Node.js with Express.js (inferred from memory bank; routes/controllers for CRUD operations).
- **Database/ORM**: Prisma with PostgreSQL (models like `Company`, `PVPanel`, `Inverter`, `Project`).
- **Data Import**: XLSX library for seeding from Excel files (e.g., `excelSeederPV.ts` for PV panels/inverters).
- **Auth**: Supabase integration (JWT, RBAC).
- **Python Tools (tech_study/)**: Separate for calculations/reports:
  - Flask-like API (`api.py`).
  - YAML configs for project specs, components, calculations.
  - Scripts for solar engineering (e.g., array configuration, cable sizing, protection).
  - Jinja2-style templates for Markdown reports (EN/FR).
  - Outputs: `report.md`, `final_document.md`.

### Database
- PostgreSQL (managed via PgAdmin).
- Prisma schema defines entities: Users, Companies (with projects/services), PVPanels, Inverters, Projects (wizard data), Locations, etc.
- Seeding: Scripts populate master data (e.g., company logos/images in `public/`).
- Constraints: Relies on Excel structure for imports; supports pagination (default: page 1, limit 50).

## Key Features & Architecture
From memory bank and code patterns:
1. **User Management & Auth**:
   - Login/Register via Supabase.
   - Role-based access (RBAC).
   - Components: `Login.tsx`, `UserManagement.tsx`, `AuthContext.tsx`.

2. **Data Management**:
   - CRUD for Companies, PV Panels, Inverters (paginated tables).
   - Excel import/seeding for bulk data.
   - Master data focus: Technical specs (e.g., panel power, inverter phases/voltage).

3. **Project Wizard** (`ProjectWizard.tsx`):
   - Multi-step form for solar system design.
   - Steps: Location (Google Maps), PV Panel selection, Inverter selection, Mounting, Misc Equipment, Report generation.
   - Calculations: TypeScript utils for array config, cable sizing, grounding, protection (e.g., `array_configuration.ts`).
   - Integrates Python tools? (via API for advanced calcs/reports).

4. **Dashboards & Analytics**:
   - `/dashboard` and `/dashboard1` pages with charts (Recharts, KPI cards).
   - Survey integration for assessments (e.g., digital maturity, supply chain).

5. **Other Pages/Components**:
   - Search, Settings, Tasks (Kanban-style with modals).
   - Inverter/Misc Equipment lists.
   - Navbar, Toasts, Modals (ShadCN).

**Architecture Patterns** (from `systemPatterns.md`):
- MVC on backend (Controllers → Models → Prisma DAO).
- Observer (Redux/Zustand for state).
- Microservices-like separation (frontend/backend).
- Data Flow: Frontend API calls → Express routes → Prisma → DB.
- Security: JWT auth, input validation.
- Performance: React Query caching, lazy loading, DB indexing.
- Scalability: Horizontal scaling, sharding ready.

**Deployment/Setup** (from README.md):
- Clone → pnpm install (client/server) → Prisma migrate/seed → Run dev server.
- Env: `DATABASE_URL`, `NEXT_PUBLIC_API_BASE_URL`.
- CI/CD: GitHub Actions implied.

## Current Status & Progress (from memory-bank/progress.md & activeContext.md)
- **What Works**: Company data CRUD/display, intuitive UI, Excel imports, basic pagination for PV Panels.
- **In Progress**: 
  - PV Panel pagination (controllers/API updated).
  - Inverter implementation (routes/controllers seeded).
  - Wizard integration for projects/inverters.
- **What's Left**: Master data prep (validation, more seeding), tests, docs.
- **Challenges**: Company logos management, ensuring Excel structure consistency, integrating Python calcs with JS frontend.
- **Todo List** (current, from reminders):
  1. Review/finalize PVPanel pagination.
  2. Implement Inverter data management.
  3. Update wizard for Inverter selection.
  4. Enhance data import.
  5. Add validation/quality checks.
  6. Update docs.
  7. Add unit tests.

## Recommendations
- **Strengths**: Modern stack (Next.js 15, TypeScript), good separation of concerns, extensible wizard for domain-specific (solar) workflows.
- **Areas for Improvement**: 
  - Add API docs (e.g., Swagger).
  - Integrate Python tools more seamlessly (e.g., via subprocess or API).
  - Expand tests (current Jest setup is basic).
  - Handle internationalization (EN/FR templates suggest multi-lang support).
- The codebase is ~500+ files, focused on renewable energy (company directory + design tools). Total size: Medium-scale app, suitable for team development.