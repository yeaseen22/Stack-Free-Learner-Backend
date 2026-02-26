const http = require('http');

console.log('Testing server on port 8000...\n');

let authToken = '';

// Test root endpoint
http.get('http://localhost:8000/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Root endpoint response:');
    console.log(data);
    console.log('\n---\n');

    // Test login with existing user or register
    testLogin();
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});

function testLogin() {
  const postData = JSON.stringify({
    email: 'testuser999@example.com',
    password: 'Test123456'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    // Extract cookies
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      cookies.forEach(cookie => {
        if (cookie.startsWith('accessToken=')) {
          authToken = cookie.split(';')[0].split('=')[1];
        }
      });
    }

    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('✅ Login response:');
      console.log(data);

      if (authToken) {
        console.log('🔑 Auth token received');
        console.log('\n---\n');
        testProtectedEndpoint();
      } else {
        console.log('⚠️  No auth token - trying registration first');
        testRegistration();
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Login error:', err.message);
  });

  req.write(postData);
  req.end();
}

function testRegistration() {
  const postData = JSON.stringify({
    name: 'Test User',
    email: 'testuser999@example.com',
    password: 'Test123456'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/user/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('✅ Registration response:');
      console.log(data);
      console.log('\n---\n');
      // Try login again
      testLogin();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Registration error:', err.message);
  });

  req.write(postData);
  req.end();
}

function testProtectedEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/device/find-devices',
    method: 'GET',
    headers: {
      'Cookie': `accessToken=${authToken}`
    }
  };

  http.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('✅ Protected endpoint (/api/device/find-devices) response:');
      console.log(`Status: ${res.statusCode}`);
      console.log(data);
    });
  }).on('error', (err) => {
    console.error('❌ Protected endpoint error:', err.message);
  });
}