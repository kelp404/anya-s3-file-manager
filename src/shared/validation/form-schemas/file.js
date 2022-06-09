const {
	generateIdsSchema,
} = require('../schema-generators');
const objectSchema = require('../model-schemas/object');

exports.downloadFilesFormSchema = generateIdsSchema();
exports.uploadFileFormSchema = {
	dirname: {
		...objectSchema.dirname,
		optional: true,
	},
};
