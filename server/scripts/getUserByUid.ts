import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


// Initialize Prisma client
const prisma = new PrismaClient();

async function getUserByUid(uid: string) {
  console.log(`Looking up user with UID: ${uid}`);

  try {

    // Then check if the user exists in the database
    const dbUser = await prisma.user.findFirst({
      where: { uid },
    });

    if (dbUser) {
      console.log('Database user found:', dbUser);
    } else {
      console.log('No database user found with this UID');
      
    }
  } catch (error) {
    console.error('Error looking up user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get UID from command line arguments
const uid = process.argv[2];

if (!uid) {
  console.error('Please provide a UID as a command line argument');
  console.log('Usage: npx ts-node src/scripts/getUserByUid.ts <uid>');
  process.exit(1);
}

getUserByUid(uid)
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
