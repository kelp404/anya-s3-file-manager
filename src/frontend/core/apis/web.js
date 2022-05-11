const {sendRequest} = require('.');

const BASE_PATH = '/api';

module.exports = {
	file: {
		getFiles: ({dirname, after, limit} = {}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/files`,
			params: {dirname, after, limit},
		}),
	},
};
