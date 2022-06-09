const {sendRequest} = require('.');

const BASE_PATH = '/api';

module.exports = {
	file: {
		getFiles: ({dirname, keyword, after, limit} = {}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/files`,
			params: {dirname, keyword, after, limit},
		}),
		getFileInformation: ({fileId}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/files/${fileId}/information`,
		}),
		deleteFiles: ({fileIds}) => sendRequest({
			method: 'delete',
			url: `${BASE_PATH}/files`,
			params: {ids: fileIds},
		}),
	},
};
