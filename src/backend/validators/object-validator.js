const {validator} = require('.');
const {
	getObjectsFormSchema,
	createObjectFormSchema,
	deleteObjectsFormSchema,
} = require('../../shared/validation/form-schemas/object');

module.exports = {
	validateGetObjectsQuery: validator.compile(getObjectsFormSchema),
	validateCreateObjectBody: validator.compile(createObjectFormSchema),
	validateDeleteObjectsQuery: validator.compile(deleteObjectsFormSchema),
};
