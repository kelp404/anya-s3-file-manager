const config = require('config');
const pLimit = require('p-limit');
const {Op} = require('sequelize');
const {
	OBJECT_TYPE,
} = require('../../shared/constants');
const utils = require('../common/utils');
const s3 = require('../common/s3');
const {
	validateGetObjectsQuery,
	validateDeleteObjectsQuery,
} = require('../validators/object-validator');
const ObjectModel = require('../models/data/object-model');
const {
	Http404,
	Http422,
} = require('../models/errors');

const {
	PAGINATION,
} = config;

/*
	GET /api/objects
 */
exports.getObjects = async (req, res) => {
	const checkResult = validateGetObjectsQuery(req.query);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {
		dirname = '', keyword, after, limit = PAGINATION.DEFAULT_LIMIT,
	} = req.query;
	const keywordConditions = [];
	const afterConditions = [];

	if (keyword) {
		const {plus, minus} = utils.parseKeyword(keyword);

		plus.forEach(plusKeyword => {
			keywordConditions.push({
				path: {[Op.like]: utils.generateLikeSyntax(plusKeyword)},
			});
		});
		minus.forEach(minusKeyword => {
			keywordConditions.push({
				path: {[Op.notLike]: utils.generateLikeSyntax(minusKeyword)},
			});
		});
	}

	if (after) {
		const cursor = await ObjectModel.findOne({
			where: {id: after},
			attributes: ['id', 'type', 'basename'],
		});

		if (cursor == null) {
			throw new Http404(`not found object ${after}`);
		}

		afterConditions.push(
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
		);
	}

	const objects = await ObjectModel.findAll({
		where: {
			dirname: keywordConditions.length
				? {[Op.like]: utils.generateLikeSyntax(dirname, {start: ''})}
				: dirname,
			...(afterConditions.length ? {[Op.or]: afterConditions} : undefined),
			...(keywordConditions.length ? {[Op.and]: keywordConditions} : undefined),
		},
		order: [
			['type', 'ASC'],
			['basename', 'ASC'],
			['id', 'ASC'],
		],
		limit: limit + 1,
	});

	res.json({
		hasNextPage: objects.length > limit,
		items: objects.slice(0, limit),
	});
};

/*
	GET /api/objects/:objectId
 */
exports.getObject = async (req, res) => {
	const {objectId} = req.params;
	const object = await ObjectModel.findOne({
		where: {
			id: objectId,
		},
	});

	if (!object) {
		throw new Http404();
	}

	const objectHeaders = await s3.headObject(object.path);

	res.json({
		...object.toJSON(),
		objectHeaders,
	});
};

/*
	DELETE /api/objects
 */
exports.deleteObjects = async (req, res) => {
	const checkResult = validateDeleteObjectsQuery(req.query);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {ids} = req.query;
	const limit = pLimit(1);
	const files = [];
	const folders = [];
	const objects = await ObjectModel.findAll({
		where: {
			id: {[Op.in]: ids},
		},
	});

	if (objects.length !== ids.length) {
		const existsIds = objects.map(({id}) => id);

		ids.forEach(id => {
			if (!existsIds.includes(id)) {
				throw new Http404(`not found "${id}"`);
			}
		});
	}

	await Promise.all(objects.map(object => limit(async () => {
		if (object.type === OBJECT_TYPE.FILE) {
			files.push(object);
		} else {
			const [deepFiles, deepFolders] = await Promise.all([
				ObjectModel.findAll({
					where: {
						type: OBJECT_TYPE.FILE,
						path: {[Op.like]: utils.generateLikeSyntax(object.path, {start: ''})},
					},
				}),
				ObjectModel.findAll({
					where: {
						type: OBJECT_TYPE.FOLDER,
						path: {[Op.like]: utils.generateLikeSyntax(object.path, {start: ''})},
					},
				}),
			]);

			files.push(...deepFiles);
			folders.push(...deepFolders);
		}
	})));

	if (files.length) {
		await Promise.all([
			s3.deleteObjects(files.map(file => file.path)),
			ObjectModel.destroy({
				where: {id: {[Op.in]: files.map(file => file.id)}},
			}),
		]);
	}

	if (folders.length) {
		await Promise.all([
			s3.deleteObjects(
				folders
					.map(folder => folder.path)
					.sort((a, b) => b.split('/').length - a.split('/').length),
			),
			ObjectModel.destroy({
				where: {id: {[Op.in]: folders.map(folder => folder.id)}},
			}),
		]);
	}

	res.sendStatus(204);
};
