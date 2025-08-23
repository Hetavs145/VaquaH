// Test script to verify CORS fix for Firebase Functions
const https = require('https');

// Test the health check endpoint first (no auth required)
function testHealthCheck() {
  console.log('Testing health check endpoint...');
  
  const options = {
    hostname: 'us-central1-vaquah-react.cloudfunctions.net',
    port: 443,
    path: '/healthCheck',
    method: 'GET',
    headers: {
      'Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Health Check Status: ${res.statusCode}`);
    console.log('CORS Headers:');
    console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Health Check Error:', e.message);
  });

  req.end();
}

// Test the initializeAdminCollections endpoint (requires auth)
function testAdminCollections() {
  console.log('\nTesting admin collections endpoint...');
  console.log('Note: This will fail with 401 Unauthorized without a valid token');
  
  const options = {
    hostname: 'us-central1-vaquah-react.cloudfunctions.net',
    port: 443,
    path: '/initializeAdminCollections',
    method: 'POST',
    headers: {
      'Origin': 'http://localhost:8080',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer INVALID_TOKEN_FOR_TESTING'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Admin Collections Status: ${res.statusCode}`);
    console.log('CORS Headers:');
    console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Admin Collections Error:', e.message);
  });

  // Send empty body
  req.write('{}');
  req.end();
}

// Test OPTIONS request (preflight)
function testPreflight() {
  console.log('\nTesting OPTIONS preflight request...');
  
  const options = {
    hostname: 'us-central1-vaquah-react.cloudfunctions.net',
    port: 443,
    path: '/initializeAdminCollections',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Preflight Status: ${res.statusCode}`);
    console.log('CORS Headers:');
    console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
    console.log('  Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
  });

  req.on('error', (e) => {
    console.error('Preflight Error:', e.message);
  });

  req.end();
}

// Run all tests
console.log('Testing Firebase Functions CORS Configuration...\n');

testHealthCheck();
setTimeout(testAdminCollections, 1000);
setTimeout(testPreflight, 2000);