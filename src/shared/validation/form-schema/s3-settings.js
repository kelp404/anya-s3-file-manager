exports.s3SettingsFormSchema = {
	key: {
		type: 'string',
		empty: false,
		max: 255,
	},
	secret: {
		type: 'string',
		empty: false,
		max: 255,
	},
	region: {
		type: 'string',
		empty: false,
		max: 255,
	},
	bucket: {
		type: 'string',
		empty: false,
		max: 255,
	},
};
