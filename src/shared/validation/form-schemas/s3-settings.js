exports.s3SettingsFormSchema = {
	KEY: {
		type: 'string',
		empty: false,
		max: 255,
	},
	SECRET: {
		type: 'string',
		empty: false,
		max: 255,
	},
	REGION: {
		type: 'string',
		empty: false,
		max: 255,
	},
	BUCKET: {
		type: 'string',
		empty: false,
		max: 255,
	},
};
