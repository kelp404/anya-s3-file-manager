const {validator} = require('.');
const {
	getObjectsFormSchema,
	createFolderFormSchema,
	deleteObjectsFormSchema,
} = require('../../shared/validation/form-schemas/object');

module.exports = {
	validateGetObjectsQuery: validator.compile(getObjectsFormSchema),
	validateCreateObjectBody: validator.compile(createFolderFormSchema),
	validateDeleteObjectsQuery: validator.compile(deleteObjectsFormSchema),
};
