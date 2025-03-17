import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Define the user data
    const userData = {
      uid: "BhDHPjjgvaYi64QwfLllg9hOlk32",
      email: "test@example.com",
      name: "Test User",
      role: UserRole.USER
    };

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { uid: userData.uid },
          { email: userData.email }
        ]
      }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      
      // Update the user if needed to ensure UID matches
      if (existingUser.uid !== userData.uid) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { uid: userData.uid }
        });
        console.log('Updated user UID:', updatedUser);
      }
      
      return existingUser;
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: userData
    });

    console.log('User created successfully:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createUser()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
