const http = require('http');

const data = JSON.stringify({
    name: 'John Test',
    email: 'john.test' + Date.now() + '@example.com',
    password: 'password123'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => console.log(`CODE: ${res.statusCode} RES: ${d}`));
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
