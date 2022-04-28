const config = require('config');
const {server} = require('./apps/web');

// Launch server
server.listen(config.EXPRESS_SERVER.PORT, config.EXPRESS_SERVER.HOST, () => {
	const {address, port} = server.address();
	console.log(`Server listening at http://${address}:${port}`);
});
