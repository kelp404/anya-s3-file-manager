const fileSchema = require('../model-schemas/file');
const {
	generateCursorPaginationSchema,
} = require('../schema-generators');

exports.getFilesFormSchema = {
	...generateCursorPaginationSchema(),
	dirname: {
		...fileSchema.dirname,
		optional: true,
	},
};
