const {validator} = require('.');
const {
	getFilesFormSchema,
	deleteFilesFormSchema,
} = require('../../shared/validation/form-schemas/file');

module.exports = {
	validateGetFilesQuery: validator.compile(getFilesFormSchema),
	validateDeleteFilesQuery: validator.compile(deleteFilesFormSchema),
};
