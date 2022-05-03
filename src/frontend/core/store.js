const PubSub = require('pubsub-js');
const {STORE_EVENT_PREFIX} = require('./constants');

const data = {};

/**
 * @param {string} key
 * @param {function(keyWithPrefix: string, data)} handler
 * @returns {function()} - The unsubscribe function.
 */
function subscribe(key, handler) {
	const token = PubSub.subscribe(`${STORE_EVENT_PREFIX}${key}`, handler);

	return () => PubSub.unsubscribe(token);
}

/**
 * @param {string} key
 * @param {any} value
 * @returns {*}
 */
function broadcast(key, value) {
	return PubSub.publishSync(`${STORE_EVENT_PREFIX}${key}`, value);
}

/**
 * @param {string} key
 * @param {any} value
 * @returns {*}
 */
function set(key, value) {
	data[key] = value;

	return PubSub.publishSync(`${STORE_EVENT_PREFIX}${key}`, value);
}

/**
 * @param {string} key
 * @returns {*}
 */
function get(key) {
	return data[key];
}

module.exports = {
	subscribe,
	broadcast,
	set,
	get,
};
