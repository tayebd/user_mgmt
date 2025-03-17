import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Prisma client
const prisma = new PrismaClient();

async function getUserByEmail(email: string) {
  console.log(`Looking up user with email: ${email}`);

  try {
    // First check if the user exists in Supabase
    try {
      // Get user by email using the correct API method
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      if (error) throw error;
      
      // Find user by email in the returned users
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('User not found');

      console.log('Supabase user found:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      });
      
      // Check if this user exists in the database by ID
      // Convert ID to number safely
      const userId = parseInt(user.id);
      if (isNaN(userId)) throw new Error('Invalid user ID format');
      
      const dbUserById = await prisma.user.findFirst({
        where: { id: userId },
      });
      
      if (dbUserById) {
        console.log('Database user found by ID:', dbUserById);
      } else {
        console.log('No database user found with this ID');
      }
    } catch (error) {
      console.error('Supabase user not found:', error);
    }

    // Check if the user exists in the database by email
    const dbUser = await prisma.user.findFirst({
      where: { email },
    });

    if (dbUser) {
      console.log('Database user found by email:', dbUser);
    } else {
      console.log('No database user found with this email');
    }
  } catch (error) {
    console.error('Error looking up user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email as a command line argument');
  console.log('Usage: npx ts-node src/scripts/getUserByEmail.ts <email>');
  process.exit(1);
}

getUserByEmail(email)
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
