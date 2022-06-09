const {validator} = require('.');
const {
	getObjectsFormSchema,
	downloadFilesFormSchema,
	deleteObjectsFormSchema,
} = require('../../shared/validation/form-schemas/object');

module.exports = {
	validateGetObjectsQuery: validator.compile(getObjectsFormSchema),
	validateDownloadFilesQuery: validator.compile(downloadFilesFormSchema),
	validateDeleteObjectsQuery: validator.compile(deleteObjectsFormSchema),
};
