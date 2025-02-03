import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        id: 'test-user-id', // Hardcoded ID for testing
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN
      }
    });

    console.log('Created test user:', user);


    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Clean the database before seeding
async function cleanDatabase() {
  try {
    console.log('Cleaning database...');
    await prisma.user.deleteMany();
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

// Run the seeder
cleanDatabase()
  .then(() => seed())
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
