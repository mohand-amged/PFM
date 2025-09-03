const https = require('https');
const http = require('http');

async function testAPIRoute(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script'
      }
    };

    if (data && method !== 'GET') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: responseBody
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testDeployedAPI() {
  console.log('🚀 Testing API routes...\n');
  
  // Test data for API calls
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };

  // Get base URL from environment or use localhost
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.BASE_URL 
    ? process.env.BASE_URL 
    : 'http://localhost:3000';

  console.log(`Base URL: ${baseUrl}\n`);

  // Test signup endpoint
  try {
    console.log('📝 Testing POST /api/auth/signup...');
    const signupResponse = await testAPIRoute(
      `${baseUrl}/api/auth/signup`,
      'POST',
      testUser
    );
    console.log(`   Status: ${signupResponse.status}`);
    console.log(`   Response: ${signupResponse.body.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test login endpoint
  try {
    console.log('\\n🔐 Testing POST /api/auth/login...');
    const loginResponse = await testAPIRoute(
      `${baseUrl}/api/auth/login`,
      'POST',
      { email: testUser.email, password: testUser.password }
    );
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${loginResponse.body.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test logout endpoint
  try {
    console.log('\\n🚪 Testing POST /api/auth/logout...');
    const logoutResponse = await testAPIRoute(
      `${baseUrl}/api/auth/logout`,
      'POST'
    );
    console.log(`   Status: ${logoutResponse.status}`);
    console.log(`   Response: ${logoutResponse.body}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\\n✅ API testing completed!');
}

// Run the test
testDeployedAPI().catch(console.error);
