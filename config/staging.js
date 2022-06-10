module.exports = {
	// Please DON'T public this website to anonymous.
	// Please DON'T commit S3 secret to the public repository.
	S3: {
		KEY: null,
		SECRET: null,
		BUCKET: null,
		REGION: null,
	},

	MODE: 'staging',
	IS_USE_DEBUG_ASSETS: false,
	ASSETS_PATH: '/assets',
	IS_LOG_SQL: false,
};
