import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';

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

    // Create a test project
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'A test project created by the seeder',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: ProjectStatus.NOT_STARTED,
        createdById: user.id
      }
    });

    console.log('Created test project:', project);

    // Create some test tasks
    const task1 = await prisma.task.create({
      data: {
        title: 'Test Task 1',
        description: 'A high priority task',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.HIGH,
        projectId: project.id,
        assignedToId: user.id,
        createdById: user.id
      }
    });

    console.log('Created test task 1:', task1);

    const task2 = await prisma.task.create({
      data: {
        title: 'Test Task 2',
        description: 'A medium priority task',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
        projectId: project.id,
        assignedToId: user.id,
        createdById: user.id
      }
    });

    console.log('Created test task 2:', task2);

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
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
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
