# Project Brief

## Project Overview
This project is a comprehensive web application designed to manage and display information about various organizations, particularly those involved in renewable energy and solar power. The application includes both a frontend built with Next.js and a backend built with Express.js, utilizing Prisma for database management.

## Objectives
1. **Data Management:** Efficiently manage and display organization data, including details about their projects, services, and contact information.
2. **User Experience:** Provide an intuitive and user-friendly interface for users to explore and interact with organization information.
3. **Data Import:** Implement a robust data import system using the XLSX library to parse Excel files and seed the database.
4. **Scalability:** Ensure the application is scalable to handle a growing number of organizations and data entries.

## Scope
- **Frontend:** Developed using Next.js, a React framework.
- **Backend:** Developed using Express.js.
- **Database:** Managed using Prisma with PostgreSQL.
- **Data Import:** Utilizes the XLSX library for Excel parsing.
- **State Management:** Implements Redux for state management in the client.
- **Data Fetching:** Uses React Query for data fetching and caching.

## Constraints
- The project relies on PostgreSQL as the database.
- The data seeding process is dependent on the structure of the provided Excel files.
- The frontend is built with Next.js, which impacts routing and server-side rendering.
