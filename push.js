var https = require('https');

var email = 'justus.sager@gmail.com',
    password = '5afLf3miG7sQaa716j0x',
    data = {
        branch: 'default',         
        modules: {
            main: 'require("hello");',
            hello: 'console.log("Hello World!");'
        }
    };

var req = https.request({
    hostname: 'screeps.com',
    port: 443,
    path: '/api/user/code',
    method: 'POST',
    auth: email + ':' + password,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

req.write(JSON.stringify(data));
req.end();