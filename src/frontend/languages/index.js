const pupa = require('pupa').default;

const languageResource = window.languageResource || {};

/**
 * Translate for i18n.
 * @param {string} key - The key.
 * @param {(Array<string>|Object|undefined)} values - The parameters.
 * @returns {string}
 */
module.exports = (key, values) => {
	const template = languageResource[key] || key;

	return values ? pupa(template, values) : template;
};
