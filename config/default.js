const path = require('path');

module.exports = {
	MODE: 'default',
	URL: 'http://localhost:8000',
	EXPRESS_SERVER: {
		HOST: 'localhost',
		PORT: 8000,
	},
	WEBPACK_DEV_SERVER: {
		HOST: 'localhost',
		PORT: 8001,
	},
	DATABASE_PATH: path.join('caches', 'data.db'),
	IS_LOG_REQUEST: true,
	IS_LOG_ERROR: true,
	IS_LOG_SQL: true,
	IS_SYNC_S3_OBJECTS_ON_LAUNCH: true,
	S3: {
		KEY: null,
		SECRET: null,
		BUCKET: null,
		REGION: null,
		DATABASE_PATH: '_anya_data.db',
	},
	GZIP_FILE_PATTERN: /\.(js|css|svg)$/,
	IS_USE_DEBUG_ASSETS: true,
	ASSETS_PATH: '//localhost:8001',
	COOKIE_CIPHER: {
		ALGORITHM: 'aes-256-cbc',
		KEY: '0dd2abb4aca4e7ee1af64133c62a8de705c086f589ca6de3869767662df1a84b',
		IV: 'cc57728778bbcb36a44a56bc81e1b7fb',
	},
	PAGINATION: {
		DEFAULT_LIMIT: 50,
	},
};
