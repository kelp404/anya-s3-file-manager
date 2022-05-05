const config = require('config');
const {Http500} = require('../models/errors');
const {validateS3Settings} = require('../validators/s3-settings-validator');

const checkS3SettingsResult = validateS3Settings(config.S3);

/*
 * Don't throw an error at base view handlers.
 * Make sure handles are available at any situations.
 */
exports.getBaseView = (req, res) => {
	const {IS_USE_DEBUG_ASSETS, ASSETS_PATH, LIMIT} = config;

	if (!res.locals.error && checkS3SettingsResult !== true) {
		res.locals.error = new Http500('S3 settings failed', checkS3SettingsResult);
		res.status(res.locals.error.status);
	}

	const values = {
		config: {
			IS_USE_DEBUG_ASSETS,
			ASSETS_PATH,
			LIMIT,
		},
		browserSettings: {
			htmlLang: 'en',
			languageCode: 'en-us',
		},
		error: res.locals.error
			? {message: `${res.locals.error}`, status: res.locals.error.status}
			: null,
	};

	res.render('web', values);
};
