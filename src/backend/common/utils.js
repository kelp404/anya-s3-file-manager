const crypto = require('crypto');
const config = require('config');

const {
	IS_LOG_ERROR, COOKIE_CIPHER,
} = config;

/**
 * @param {string} text
 * @returns {string} - The base64 string.
 */
exports.encryptCookieValue = text => {
	const cipher = crypto.createCipheriv(
		COOKIE_CIPHER.ALGORITHM,
		Buffer.from(COOKIE_CIPHER.KEY, 'hex'),
		Buffer.from(COOKIE_CIPHER.IV, 'hex'),
	);

	return Buffer.concat([cipher.setAutoPadding(true).update(text), cipher.final()]).toString('base64');
};

/**
 * @param {string} text - The base64 string.
 * @returns {string}
 */
exports.decryptCookieValue = text => {
	const decipher = crypto.createDecipheriv(
		COOKIE_CIPHER.ALGORITHM,
		Buffer.from(COOKIE_CIPHER.KEY, 'hex'),
		Buffer.from(COOKIE_CIPHER.IV, 'hex'),
	);

	return Buffer.concat([decipher.update(Buffer.from(text, 'base64')), decipher.final()]).toString();
};

exports.logError = error => {
	if (IS_LOG_ERROR) {
		console.error(error);
	}
};
