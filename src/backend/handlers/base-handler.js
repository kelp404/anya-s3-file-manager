const config = require('config');

/*
 * Don't throw an error at base view handlers.
 * Make sure handles are available at any situations.
 */
exports.getBaseView = (req, res) => {
	const {IS_USE_DEBUG_ASSETS, ASSETS_PATH, LIMIT, S3} = config;

	const values = {
		config: {
			IS_USE_DEBUG_ASSETS,
			ASSETS_PATH,
			LIMIT,
			S3: {
				BUCKET: S3.BUCKET,
			},
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
