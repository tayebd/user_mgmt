// Direct database query script for user lookup
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Prisma client
const prisma = new PrismaClient();

// Get UID from command line arguments
const uid = process.argv[2];

if (!uid) {
  console.error('Please provide a UID as a command line argument');
  console.log('Usage: node queryUserDirectly.js <uid>');
  process.exit(1);
}

async function queryUser() {
  try {
    console.log(`Querying database for user with UID: ${uid}`);
    
    // Query by UID
    const userByUid = await prisma.user.findFirst({
      where: { uid }
    });
    
    if (userByUid) {
      console.log('User found by UID:', userByUid);
    } else {
      console.log('No user found with this UID');
      
      // Try to find all users to see what's in the database
      console.log('\nListing all users in the database:');
      const allUsers = await prisma.user.findMany({
        take: 10 // Limit to 10 users for readability
      });
      
      if (allUsers.length > 0) {
        console.table(allUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          uid: user.uid,
          role: user.role
        })));
      } else {
        console.log('No users found in the database');
      }
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryUser();
