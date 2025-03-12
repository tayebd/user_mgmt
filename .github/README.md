# User Management Application CI/CD

This application uses GitHub Actions for continuous integration and deployment. The pipeline includes automated testing, type checking, linting, and deployment.

## CI/CD Pipeline Overview

The pipeline consists of three main stages:

1. **Test Stage**
   - Runs ESLint for code quality
   - Performs TypeScript type checking
   - Executes Jest unit tests

2. **Build Stage**
   - Triggers after successful tests on main branch
   - Builds the Next.js application
   - Creates production-ready artifacts

3. **Deploy Stage**
   - Deploys the application to production
   - Only runs on the main branch after successful build

## Running Tests Locally

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run linting
pnpm run lint

# Run type checking
pnpm run type-check

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage
```

## Required Secrets

To enable deployment, add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel deployment token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Branch Protection Rules

Configure these branch protection rules for `main`:
1. Require status checks to pass before merging
2. Require branches to be up to date before merging
3. Include administrators in these restrictions
