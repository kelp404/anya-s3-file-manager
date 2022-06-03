const fileSchema = require('../model-schemas/file');
const {
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
