const config = require('config');
const Sequelize = require('sequelize');
const {
	FRONTEND_OPERATION_CODE,
} = require('../../shared/constants');
const {
	validateCreateTagBody,
} = require('../validators/tag-validator');
const TagModel = require('../models/data/tag-model');
const {
	Http403,
	Http409,
	Http422,
} = require('../models/errors');

const {
	LIMIT: {TAG_QUANTITY},
} = config;

/*
	GET /api/tags
 */
exports.getTags = async (req, res) => {
	const tags = await TagModel.findAll({
		order: [
			['title', 'ASC'],
		],
	});

	res.json({
		items: tags,
	});
};

/*
	POST /api/tags
 */
exports.createTag = async (req, res) => {
	const checkResult = validateCreateTagBody(req.body);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {
		title,
	} = req.body;

	const tagQuantity = await TagModel.count();

	if (tagQuantity >= TAG_QUANTITY) {
		throw new Http403('tag quantity over limit', {
			frontendOperationCode: FRONTEND_OPERATION_CODE.SHOW_TAG_OVER_LIMIT_ALERT,
			frontendOperationValue: TAG_QUANTITY,
		});
	}

	const tag = new TagModel({
		title,
	});

	try {
		await tag.save();
	} catch (error) {
		if (
			error instanceof Sequelize.UniqueConstraintError
			&& (error.errors || [])[0]?.path === 'title'
		) {
			throw new Http409(error, {
				frontendOperationCode: FRONTEND_OPERATION_CODE.SHOW_TAG_DUPLICATED_ALERT,
			});
		}

		throw error;
	}

	res.json(tag);
};
