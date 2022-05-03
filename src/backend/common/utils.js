const crypto = require('crypto');
const path = require('path');
const config = require('config');
const {Sequelize} = require('sequelize');

const {
	DATABASE_PATH, IS_LOG_ERROR, IS_LOG_SQL, S3, COOKIE_CIPHER,
} = config;

exports._sequelize = null;
exports.connectDatabase = ({isLogSQL} = {}) => {
	exports._sequelize = exports._sequelize || new Sequelize({
		dialect: 'sqlite',
		storage: path.join(__dirname, '..', '..', '..', DATABASE_PATH),
		logging: isLogSQL == null ? IS_LOG_SQL : isLogSQL,
	});

	return {
		sequelize: exports._sequelize,
	};
};

/**
 * Update Model.sequelize.
 * 	Sequelize is sucks.
 * 	We need to connect database before define models.
 * 	So we use sucks way to change database connection.
 * 	@returns {undefined}
 */
exports.updateConnectionOfModels = () => {
	const models = require('../models/data');
	const SYSTEM_FIELDS = ['sequelize', 'Sequelize'];

	Object.entries(models)
		.filter(([name]) => !SYSTEM_FIELDS.includes(name))
		.forEach(([_, model]) => {
			model.sequelize = exports._sequelize;
		});
};

exports.disconnectDatabase = () => {
	exports._sequelize = null;
};

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
 * @returns {{bucket: string, secret: string, region: string, key: string}}
 */
exports.getS3Settings = () => {
	const {Http500} = require('../models/errors');
	const {validateS3Settings} = require('../validators/s3-settings-validator');
	const s3SettingsFrom = {
		key: S3?.KEY,
		secret: S3?.SECRET,
		region: S3?.REGION,
		bucket: S3?.BUCKET,
	};
	const checkResult = validateS3Settings(s3SettingsFrom);

	if (checkResult !== true) {
		throw new Http500('S3 settings failed', checkResult);
	}

	return s3SettingsFrom;
};

exports.logError = error => {
	if (IS_LOG_ERROR) {
		console.error(error);
	}
};
