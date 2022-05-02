module.exports = {
	// Direct set S3 secret at here to replace typing S3 secret on the browser.
	// Please DON'T public anya s3 file manager.
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
