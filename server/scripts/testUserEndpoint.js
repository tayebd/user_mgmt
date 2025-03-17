// Simple script to test the user endpoint directly
const fetch = require('node-fetch');

// Test UID - replace with a valid UID from your system
const testUid = process.argv[2] || 'test-uid';

async function testUserEndpoint() {
  try {
    console.log(`Testing /api/users/uid/${testUid} endpoint...`);
    
    // Make the request to the local server
    const response = await fetch(`http://localhost:5000/api/users/uid/${testUid}`, {
      method: 'GET',
      headers: {
        // Add a dummy authorization header to pass the auth middleware
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}

testUserEndpoint();
