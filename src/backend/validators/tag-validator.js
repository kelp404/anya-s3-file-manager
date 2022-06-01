const {validator} = require('.');
const {
	createTagFormSchema,
} = require('../../shared/validation/form-schemas/tag');

module.exports = {
	validateCreateTagBody: validator.compile(createTagFormSchema),
};
