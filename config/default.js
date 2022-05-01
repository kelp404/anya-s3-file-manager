module.exports = {
	URL: 'http://localhost:8000',
	EXPRESS_SERVER: {
		HOST: 'localhost',
		PORT: 8000,
	},
	WEBPACK_DEV_SERVER: {
		HOST: 'localhost',
		PORT: 8001,
	},
	IS_USE_DEBUG_ASSETS: true,
	ASSETS_PATH: '//localhost:8001',
	COOKIES: {
		S3_SECRET: {
			NAME: 's',
		},
	},
	LIMIT: {
		FILE_SIZE: 900 * 1024 * 1024, // 900MB
	},
};
