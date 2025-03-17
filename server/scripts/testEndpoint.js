const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Get UID from command line arguments
const uid = process.argv[2];

if (!uid) {
  console.error('Please provide a UID as a command line argument');
  console.log('Usage: node testEndpoint.js <uid>');
  process.exit(1);
}

async function testEndpoint() {
  console.log(`Testing endpoint for UID: ${uid}`);
  
  try {
    // Get a ID token for authentication
    // For this test script, we'll need to manually provide a token
    const token = process.argv[3] || '';
    
    if (!token) {
      console.warn('No token provided. The request might fail if authentication is required.');
    }
    
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const url = `${apiUrl}/users/uid/${uid}`;
    
    console.log(`Making request to: ${url}`);
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.error('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
}

testEndpoint();
