const {validator} = require('.');
const {
	getFilesFormSchema,
} = require('../../shared/validation/form-schemas/file');

module.exports = {
	validateGetFilesQuery: validator.compile(getFilesFormSchema),
};
