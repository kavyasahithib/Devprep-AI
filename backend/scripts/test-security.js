const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log("Starting security test suite...");

const env = {
  ...process.env,
  PORT: '5099',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devprep_test',
  JWT_SECRET: 'test_jwt_secret',
  REFRESH_TOKEN_SECRET: 'test_refresh_secret',
  EMAIL_USER: 'test@example.com',
  EMAIL_PASS: 'testpass123',
  GOOGLE_API_KEY: 'test_gemini_key',
  GEMINI_API_KEY: 'test_gemini_key',
  NODE_ENV: 'test'
};

const serverProcess = spawn('node', ['server.js'], { env, cwd: path.join(__dirname, '..') });

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log(`[Server] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[Server Error] ${data.toString().trim()}`);
});

function runRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  let passed = true;

  try {
    // 1. Verify CSRF Protection with a Malicious Origin
    console.log("\n--- Test 1: Testing CSRF middleware blocking malicious Origin ---");
    const loginData = JSON.stringify({ email: 'test@example.com', password: 'Password123!' });
    const res1 = await runRequest({
      hostname: 'localhost',
      port: 5099,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
        'Origin': 'http://malicious-site.com'
      }
    }, loginData);

    console.log(`Status Code: ${res1.statusCode}`);
    console.log(`Response Body: ${res1.body}`);

    if (res1.statusCode === 403 && res1.body.includes('CSRF protection')) {
      console.log("✅ SUCCESS: Malicious request blocked by CSRF middleware.");
    } else {
      console.error("❌ FAILURE: Malicious request was NOT blocked properly.");
      passed = false;
    }

    // 2. Verify CSRF Protection with an Allowed Origin (http://localhost:3000)
    console.log("\n--- Test 2: Testing CSRF middleware allowing trusted Origin ---");
    const res2 = await runRequest({
      hostname: 'localhost',
      port: 5099,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
        'Origin': 'http://localhost:3000'
      }
    }, loginData);

    console.log(`Status Code: ${res2.statusCode}`);
    
    if (res2.statusCode !== 403) {
      console.log("✅ SUCCESS: Trusted request passed CSRF check.");
    } else {
      console.error("❌ FAILURE: Trusted request was blocked by CSRF middleware.");
      passed = false;
    }

  } catch (error) {
    console.error("❌ Error running request tests:", error);
    passed = false;
  } finally {
    console.log("\nTerminating test server...");
    serverProcess.kill('SIGTERM');
    
    if (passed) {
      console.log("\n🎉 ALL SECURITY AUDIT TESTS PASSED SUCCESSFULLY.");
      process.exit(0);
    } else {
      console.error("\n❌ SOME SECURITY TESTS FAILED.");
      process.exit(1);
    }
  }
}

console.log("Waiting 3 seconds for server to boot...");
setTimeout(runTests, 3000);
