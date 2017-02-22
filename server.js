const http = require('http');
const app = require('./lib/app');
const updater = require('./lib/update-user');
require('./lib/connection');

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('server is running on ', server.address());
});

// TODO: add function to make a list of users to update; users who recently logged in 
// setInterval(updater/*update function here*/, 86400);