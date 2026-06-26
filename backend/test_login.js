const https = require('https');

const data = JSON.stringify({
  email: 'sameersamee1523@gmail.com',
  password: 'Admin@123'
});

const options = {
  hostname: 'telangana-today.vercel.app',
  port: 444, // using standard port for https (handled automatically by https module, but we can omit it)
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

// Remove explicit port to let https handle it
delete options.port;

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Body:', body);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();
