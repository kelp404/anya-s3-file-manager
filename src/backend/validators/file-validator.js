const {validator} = require('.');
const {
	downloadFilesFormSchema,
} = require('../../shared/validation/form-schemas/file');

module.exports = {
	validateDownloadFilesQuery: validator.compile(downloadFilesFormSchema),
};
