# System Patterns

## Overall Architecture

The application follows a client-server architecture, with distinct `client` and `server` directories.

*   **Client:**  Handles the frontend, user interface, and user interactions. This is a Next.js application.
*   **Server:**  Provides the backend API and database interactions. Uses Prisma and Express.js.

## Data Flow

1.  User interacts with the client-side application.
2.  Client makes requests to the server's API endpoints.
3.  Server processes requests, interacts with the database (via Prisma), and returns data.
4.  Client receives data and updates the UI.

## Key Components

*   **Frontend Components (Client):** React components for displaying and managing company data.
*   **API Routes (Server):**  Endpoints for CRUD operations on company data.
*   **Database Models (Server):** Prisma schema defining the structure of the data.
*   **Data Seeding (Server):**  Utility (`excelSeeder.ts`) to populate the database from an Excel file.

## Technologies

* React
* Prisma
* Excel (xlsx library)
* TypeScript
