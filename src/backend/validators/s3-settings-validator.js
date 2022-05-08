const {validator} = require('.');
const {
	s3SettingsFormSchema,
} = require('../../shared/validation/form-schemas/s3-settings');

module.exports = {
	validateS3Settings: validator.compile(s3SettingsFormSchema),
};
