const objectSchema = require('../model-schemas/object');
const {
	generateIdsSchema,
	generateKeywordSchema,
	generateCursorPaginationSchema,
} = require('../schema-generators');

exports.getObjectsFormSchema = {
	...generateCursorPaginationSchema(),
	...generateKeywordSchema(),
	dirname: {
		...objectSchema.dirname,
		optional: true,
	},
};

exports.createObjectFormSchema = {
	dirname: objectSchema.dirname,
	basename: objectSchema.basename,
};

exports.deleteObjectsFormSchema = generateIdsSchema();
