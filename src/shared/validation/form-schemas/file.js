const fileSchema = require('../model-schemas/file');
const {
	generateIdSchema,
	generateKeywordSchema,
	generateCursorPaginationSchema,
} = require('../schema-generators');

exports.getFilesFormSchema = {
	...generateCursorPaginationSchema(),
	...generateKeywordSchema(),
	dirname: {
		...fileSchema.dirname,
		optional: true,
	},
};

exports.deleteFilesFormSchema = {
	ids: {
		type: 'array',
		min: 1,
		unique: true,
		items: generateIdSchema().id,
	},
};
