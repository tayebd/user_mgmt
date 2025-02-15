# Active Context

## Current Work Focus

The current focus is on implementing the CRUD operations for companies and related models. The database seeding is complete, and the company data is displayed on the client.

## Recent Changes

- Implemented basic project setup with Next.js (client) and Express (server).
- Defined Prisma schema for Company, Service, Partnership, Certification, Description, Review, CompanyProject, and ProjectPhoto models.
- Established database connection.
- Implemented Excel seeding functionality to import data from `Company.xlsx` into the database.
- Created API endpoint for getting all companies.
- Displayed companies on the client-side `/companies` page.

## Next Steps

- Implement API endpoints for creating, updating, and deleting companies.
- Implement API endpoints for related models (services, partnerships, etc.).
- Develop UI components to display and manage company data (beyond the basic list).
- Develop UI components for related models.
- Implement user authentication and authorization.
- Implement image uploading and management.
- Configure deployment.

## Active Decisions and Considerations

- The project uses PostgreSQL as the database.
- The data seeding process relies on the structure of the provided Excel files.
- The frontend is built with Next.js, which has implications for routing and server-side rendering.
