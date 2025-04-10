import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Get UID from command line arguments
const uid = process.argv[2];
if (!uid) {
    console.error('Please provide a UID as a command line argument');
    console.log('Usage: ts-node debugUserEndpoint.ts <uid>');
    process.exit(1);
}
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration in environment variables');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);
async function getAuthToken() {
    var _a;
    try {
        // Create a service role token for testing
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: 'test@example.com'
        });
        if (error)
            throw error;
        console.log('Created Supabase auth token for testing');
        return ((_a = data.properties) === null || _a === void 0 ? void 0 : _a.hashed_token) || 'dummy-token';
    }
    catch (error) {
        console.error('Error creating Supabase token:', error);
        return 'dummy-token';
    }
}
async function testEndpoint() {
    console.log(`Testing endpoint for UID: ${uid}`);
    try {
        const token = await getAuthToken();
        console.log(`Using token: ${token.substring(0, 10)}...`);
        const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/users/uid/${uid}`;
        console.log(`Making request to: ${url}`);
        console.log('Request headers:', {
            'Authorization': `Bearer ${token}`
        });
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`Response status: ${response.status} ${response.statusText}`);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data, null, 2));
        }
        else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    }
    catch (error) {
        console.error('Error making request:', error);
    }
}
async function testDatabaseAccess() {
    try {
        const prisma = new PrismaClient();
        console.log(`Directly querying database for user with UID: ${uid}`);
        const dbUser = await prisma.user.findFirst({
            where: { uid }
        });
        if (dbUser) {
            console.log('User found in database:', dbUser);
        }
        else {
            console.log('No user found in database with this UID');
        }
        await prisma.$disconnect();
    }
    catch (error) {
        console.error('Error accessing database:', error);
    }
}
async function runTests() {
    console.log('=== Testing Database Access ===');
    await testDatabaseAccess();
    console.log('\n=== Testing API Endpoint ===');
    await testEndpoint();
}
runTests();
