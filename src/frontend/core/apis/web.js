const {sendRequest} = require('.');

const BASE_PATH = '/api';

module.exports = {
	file: {
		getFiles: ({dirname, keyword, after, limit} = {}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/files`,
			params: {dirname, keyword, after, limit},
		}),
	},
	tag: {
		getTags: () => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/tags`,
		}),
	},
};
