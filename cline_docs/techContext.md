# Technical Context

## Technologies Used

-   **Frontend:** Next.js (React)
-   **Backend:** Express.js
-   **Database:** Prisma (PostgreSQL)
-   **Data Import:** XLSX library for Excel parsing
-   **Typescript:** For both frontend and backend

## Development Setup

1.  **Project Initialization:**
    -   Created a Next.js project using `create-next-app`.
    -   Created an Express.js server within the project.
    -   Initialized Prisma with PostgreSQL.

2.  **Environment Variables:**
    -   `.env` file in the `server` directory for database connection string (`DATABASE_URL`).

3.  **Dependencies:**
    -   `@prisma/client`: Prisma client for database interaction.
    -   `prisma`: Prisma CLI for database migrations and schema management.
    -   `express`: Web framework for building the API.
    -   `@types/express`: TypeScript definitions for Express.
    -   `xlsx`: Library for parsing Excel files.
    -   `@types/node`: TypeScript definitions for Node.js (should be installed, but currently missing).
    -   `@reduxjs/toolkit`: For state management in the client.
    -   `react-redux`: Redux bindings for React.
    -   `@tanstack/react-query`: For data fetching and caching in the client.

## Technical Constraints

-   The project uses PostgreSQL as the database.
-   The data seeding process relies on the structure of the provided Excel files.
- The frontend is built with Next.js, which has implications for routing and server-side rendering.
