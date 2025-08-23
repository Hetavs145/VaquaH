// Test script to verify CORS fixes
console.log('🧪 Testing CORS Fixes...');

// Test 1: Check if Cloud Function endpoint is accessible
async function testCloudFunction() {
  try {
    const response = await fetch(
      'https://us-central1-vaquah-react.cloudfunctions.net/healthCheck',
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cloud Function accessible:', data);
      return true;
    } else {
      console.log('❌ Cloud Function failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Cloud Function error:', error.message);
    return false;
  }
}

// Test 2: Check CORS headers
async function testCORSHeaders() {
  try {
    const response = await fetch(
      'https://us-central1-vaquah-react.cloudfunctions.net/healthCheck',
      {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      }
    );
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('🔍 CORS Headers:', corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS headers present');
      return true;
    } else {
      console.log('❌ CORS headers missing');
      return false;
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('\n🚀 Running CORS Tests...\n');
  
  const functionTest = await testCloudFunction();
  const corsTest = await testCORSHeaders();
  
  console.log('\n📊 Test Results:');
  console.log(`Cloud Function Access: ${functionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CORS Headers: ${corsTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (functionTest && corsTest) {
    console.log('\n🎉 All tests passed! CORS issues should be resolved.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the deployment and configuration.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
} else {
  // Browser environment
  window.testCORSFixes = runTests;
  console.log('🌐 Browser environment detected. Run window.testCORSFixes() to test.');
}