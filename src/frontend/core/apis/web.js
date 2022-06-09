const {sendRequest} = require('.');

const BASE_PATH = '/api';

module.exports = {
	object: {
		getObjects: ({dirname, keyword, after, limit} = {}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/objects`,
			params: {dirname, keyword, after, limit},
		}),
		getObject: ({objectId}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/objects/${objectId}`,
		}),
		deleteObjects({objectIds}) {
			const queryString = new URLSearchParams({
				ids: objectIds,
			});

			return sendRequest({
				method: 'delete',
				url: `${BASE_PATH}/objects?${queryString}`,
			});
		},
	},
};
