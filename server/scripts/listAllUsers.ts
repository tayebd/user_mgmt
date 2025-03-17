import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { User, AuthUser } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Service Role Key must be set in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Initialize Prisma client
const prisma = new PrismaClient();

interface EmailMismatch {
  id: string;
  dbEmail: string;
  sbEmail: string;
}

async function listAllUsers() {
  console.log('Listing all users in the database and Supabase...');

  try {
    // Get all users from the database
    const dbUsers = await prisma.user.findMany();
    console.log(`Found ${dbUsers.length} users in the database:`);
    
    // Create a table with user data
    console.table(dbUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      uid: user.uid,
      role: user.role
    })));

    // Get all users from Supabase
    try {
      const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers() as {
        data: { users: AuthUser[] };
        error: any;
      };
      if (error) throw error;

      console.log(`Found ${supabaseUsers.users.length} users in Supabase:`);
      
      // Create a table with Supabase user data
      console.table(supabaseUsers.users.map((user: User) => ({
        id: user.id,
        email: user.email || 'N/A',
        created_at: user.created_at || 'N/A',
        last_sign_in_at: user.last_sign_in_at || 'N/A',
        role: user.role || 'N/A'
      })));

      // Find discrepancies between Supabase and database
      console.log('\nChecking for discrepancies between Supabase and database...');
      
      // Supabase users not in database
      const supabaseIds = new Set(supabaseUsers.users.map((user: User) => user.id));
      const dbIds = new Set(dbUsers.map(user => user.uid));
      
      const missingInDb = [...supabaseIds].filter(id => !dbIds.has(id));
      if (missingInDb.length > 0) {
        console.log(`Found ${missingInDb.length} Supabase users not in the database:`);
        for (const id of missingInDb) {
          const sbUser = supabaseUsers.users.find((u: User) => u.id === id);
          console.log(`- ${sbUser?.email || 'N/A'} (${id})`);
        }
      } else {
        console.log('All Supabase users exist in the database.');
      }
      
      // Database users not in Supabase
      const missingInSupabase = [...dbIds].filter(id => !supabaseIds.has(id));
      if (missingInSupabase.length > 0) {
        console.log(`Found ${missingInSupabase.length} database users not in Supabase:`);
        for (const id of missingInSupabase) {
          const dbUser = dbUsers.find(u => u.uid === id);
          console.log(`- ${dbUser?.email || 'N/A'} (${id})`);
        }
      } else {
        console.log('All database users exist in Supabase.');
      }
      
      // Email mismatches
      console.log('\nChecking for email mismatches...');
      const emailMismatches: EmailMismatch[] = [];
      
      for (const dbUser of dbUsers) {
        const sbUser = supabaseUsers.users.find((u: User) => u.id === dbUser.uid);
        if (sbUser && sbUser.email !== dbUser.email) {
          emailMismatches.push({
            id: dbUser.uid,
            dbEmail: dbUser.email,
            sbEmail: sbUser.email
          });
        }
      }
      
      if (emailMismatches.length > 0) {
        console.log(`Found ${emailMismatches.length} email mismatches:`);
        console.table(emailMismatches);
      } else {
        console.log('No email mismatches found.');
      }
      
    } catch (error) {
      console.error('Error fetching Supabase users:', error);
    }
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers()
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
