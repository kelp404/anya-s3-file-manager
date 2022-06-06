const crypto = require('crypto');
const config = require('config');
const sequelize = require('sequelize');
const sqlString = require('sequelize/lib/sql-string');

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

/**
 * Generate sequelize like syntax.
 * ref:
 * 	How to escape `$like` wildcard characters `%` and `_` in sequelize?
 * 	https://stackoverflow.com/a/44236635
 * @param {string} value
 * @param {string} start - "%"
 * @param {string} end - "%"
 * @returns {Literal}
 */
exports.generateLikeSyntax = (value, {start = '%', end = '%'} = {}) => {
	const escapedValue = sqlString.escape(value);
	const items = [
		escapedValue.slice(0, 1),
		start,
		escapedValue.slice(1, escapedValue.length - 1).replace(/(%|_)/g, '\\$1'),
		end,
		escapedValue.slice(-1),
		' ESCAPE \'\\\'',
	];

	return sequelize.literal(items.join(''));
};

/**
 * Parse the keyword.
 * @param {string} keyword - The keyword.
 * @returns {{plus: Array<string>, minus: Array<string>, fields: {}}} The query object.
 */
exports.parseKeyword = keyword => {
	const originalKeywords = [];
	const plus = [];
	const minus = [];
	const fields = {};

	if (!keyword) {
		return {plus, minus, fields};
	}

	// ": " -> ":", "\u200b" -> ""
	keyword = keyword
		.replace(/:\s/g, ':')
		.replace(/\u200b/g, '');

	// Match words in quotation mark
	const quotations = keyword.match(/["'](.*?)["']/g);
	(quotations || []).forEach(quotation => {
		keyword = keyword.replace(quotation, '');
		originalKeywords.push(quotation.substr(1, quotation.length - 2).trim());
	});

	// Remove " and '
	keyword = keyword.replace(/["']/g, '');
	keyword.split(' ').forEach(word => originalKeywords.push(word.trim()));

	originalKeywords.forEach(item => {
		if (!item) {
			return;
		}

		if (item.includes(':')) {
			const [field, value] = item.split(':');
			fields[field] = value;
		} else if (item[0] === '-') {
			minus.push(item.substr(1));
		} else {
			plus.push(item);
		}
	});

	return {plus, minus, fields};
};

exports.setNoCacheHeader = (_, res) => {
	res.set({
		'Cache-Control': 'no-store',
	});
};

exports.logError = error => {
	if (IS_LOG_ERROR) {
		console.error(error);
	}
};
