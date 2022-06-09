const {validator} = require('.');
const {
	getObjectsFormSchema,
	deleteObjectsFormSchema,
} = require('../../shared/validation/form-schemas/object');

module.exports = {
	validateGetObjectsQuery: validator.compile(getObjectsFormSchema),
	validateDeleteObjectsQuery: validator.compile(deleteObjectsFormSchema),
};
