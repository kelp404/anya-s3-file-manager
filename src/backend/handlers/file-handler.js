const config = require('config');
const {
	validateGetFilesQuery,
} = require('../validators/file-validator');
const File = require('../models/data/file');
const {Http422} = require('../models/errors');

const {
	PAGINATION,
} = config;

/**
 * GET /api/files
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>}
 */
exports.getFiles = async (req, res) => {
	const checkResult = validateGetFilesQuery(req.query);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {
		dirname = '.', after, limit = PAGINATION.DEFAULT_LIMIT,
	} = req.query;

	const files = await File.findAll({
		where: {
			dirname,
		},
		order: [
			['type', 'ASC'],
			['basename', 'ASC'],
		],
		limit,
	});

	res.json({
		query: {dirname, after, limit},
		files,
	});
};
