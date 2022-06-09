const {validator} = require('.');
const {
	downloadFilesFormSchema,
	uploadFileFormSchema,
} = require('../../shared/validation/form-schemas/file');

module.exports = {
	validateDownloadFilesQuery: validator.compile(downloadFilesFormSchema),
	validateUploadFileQuery: validator.compile(uploadFileFormSchema),
};
