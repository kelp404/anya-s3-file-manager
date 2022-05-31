const config = require('config');
const {Op} = require('sequelize');
const {
	validateGetFilesQuery,
} = require('../validators/file-validator');
const File = require('../models/data/file');
const {
	Http404,
	Http422,
} = require('../models/errors');

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
		dirname = '', after, limit = PAGINATION.DEFAULT_LIMIT,
	} = req.query;
	const where = {
		dirname,
	};

	if (after) {
		const cursor = await File.findOne({
			where: {id: after},
			attributes: ['id', 'type', 'basename'],
		});

		if (cursor == null) {
			throw new Http404(`not found file ${after}`);
		}

		where[Op.or] = [
			{
				[Op.and]: [
					{type: {[Op.gte]: cursor.type}},
					{basename: {[Op.gt]: cursor.basename}},
				],
			},
			{
				[Op.and]: [
					{type: {[Op.gte]: cursor.type}},
					{basename: cursor.basename},
					{id: {[Op.gt]: cursor.id}},
				],
			},
		];
	}

	const files = await File.findAll({
		where,
		order: [
			['type', 'ASC'],
			['basename', 'ASC'],
			['id', 'ASC'],
		],
		limit: limit + 1,
	});

	res.json({
		hasNextPage: files.length > limit,
		items: files.slice(0, limit),
	});
};
