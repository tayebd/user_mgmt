import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a singleton Prisma client for tests
const prisma = new PrismaClient();

// Setup function to run before tests
export const setupTestEnvironment = async () => {
  // Add any global setup here
};

// Teardown function to run after tests
export const teardownTestEnvironment = async () => {
  await prisma.$disconnect();
};

// Export the prisma client for tests to use
export { prisma };
