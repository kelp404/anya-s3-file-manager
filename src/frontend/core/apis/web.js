const {sendRequest} = require('.');

const BASE_PATH = '/api';

module.exports = {
	file: {
		uploadFile: ({dirname, file}) => sendRequest({
			method: 'post',
			url: `${BASE_PATH}/files`,
			params: {dirname},
			headers: {'content-type': 'multipart/form-data'},
			data: (() => {
				const formData = new FormData();

				formData.set('file', file, encodeURIComponent(file.name));
				return formData;
			})(),
		}),
	},
	object: {
		getObjects: ({dirname, keyword, after, limit} = {}) => sendRequest({
			method: 'get',
			url: `${BASE_PATH}/objects`,
			params: {dirname, keyword, after, limit},
		}),
		createObject: ({dirname, basename}) => sendRequest({
			method: 'post',
			url: `${BASE_PATH}/objects`,
			data: {dirname, basename},
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
