# User Management

## Technology Stack

- **Frontend**: Next.js, Tailwind CSS, Redux Toolkit, Zustand, ShadCN
- **Backend**: Node.js with Express, Prisma (PostgreSQL ORM)
- **Database**: PostgreSQL, managed with PgAdmin

## Getting Started

### Prerequisites

Ensure you have these tools installed:

- Git
- Node.js
- pnpm (Node Package Manager)
- PostgreSQL ([download](https://www.postgresql.org/download/))
- PgAdmin ([download](https://www.pgadmin.org/download/))

### Installation Steps

1. Clone the repository:
   `git clone [git url]`
   `cd user_mgmt`

2. Install dependencies in both client and server:
   `cd client`
   `pnpm i`
   `cd ..`
   `cd server`
   `pnpm i`

3. Set up the database:
   `npx prisma generate`
   `npx prisma migrate dev --name init`
   `pnpm run seed`

4. Configure environment variables:

- `.env` for server settings (PORT, DATABASE_URL)
- `.env.local` for client settings (NEXT_PUBLIC_API_BASE_URL)

5. Run the project
   `pnpm run dev`

## Additional Resources

### Code Repositories and Configuration Files



### Diagrams and Models



### Database Management Commands

- Command for resetting ID in database:
  ```sql
  SELECT setval(pg_get_serial_sequence('"[DATA_MODEL_NAME_HERE]"', 'id'), coalesce(max(id)+1, 1), false) FROM "[DATA_MODEL_NAME_HERE]";
  ```
