const axios = require('axios');
const store = require('../store');
const {
	STORE_KEYS: {IS_API_PROCESSING},
} = require('../constants');

const pool = {
	front: {},
	background: {},
};

/**
 * Update store.$isApiProcessing.
 * @returns {undefined}
 */
function updateApiStatus() {
	if (Object.keys(pool.front).length) {
		if (!store.get(IS_API_PROCESSING)) {
			store.set(IS_API_PROCESSING, true);
		}
	} else if (store.get(IS_API_PROCESSING)) {
		store.set(IS_API_PROCESSING, false);
	}
}

/**
 * @param {Object} config - axios config https://github.com/axios/axios#axiosconfig
 * @returns {Promise<Response|undefined>}
 *  Response: axios response https://github.com/axios/axios#response-schema
 *  undefined: The server return an error then we catch it.
 */
async function sendRequest(config) {
	const id = Math.random().toString(36);
	const source = axios.CancelToken.source();

	config.cancelToken = source.token;
	pool.front[id] = {
		config,
		cancelTokenSource: source,
	};
	updateApiStatus();

	try {
		return await axios(config);
	} finally {
		delete pool.front[id];
		delete pool.background[id];
		updateApiStatus();
	}
}

function cancelAllFrontRequests() {
	Object.values(pool.front).forEach(({cancelTokenSource}) => cancelTokenSource.cancel());
}

module.exports = {
	sendRequest,
	cancelAllFrontRequests,
};
