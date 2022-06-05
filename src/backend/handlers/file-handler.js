const config = require('config');
const contentDisposition = require('content-disposition');
const {Op} = require('sequelize');
const utils = require('../common/utils');
const s3 = require('../common/s3');
const {
	validateGetFilesQuery,
} = require('../validators/file-validator');
const FileModel = require('../models/data/file-model');
const {
	Http404,
	Http422,
} = require('../models/errors');

const {
	PAGINATION,
} = config;

/*
	GET /api/files
 */
exports.getFiles = async (req, res) => {
	const checkResult = validateGetFilesQuery(req.query);

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
		const cursor = await FileModel.findOne({
			where: {id: after},
			attributes: ['id', 'type', 'basename'],
		});

		if (cursor == null) {
			throw new Http404(`not found file ${after}`);
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

	const files = await FileModel.findAll({
		where: {
			dirname: keywordConditions.length
				? {[Op.like]: utils.generateLikeSyntax(dirname, {end: ''})}
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
		hasNextPage: files.length > limit,
		items: files.slice(0, limit),
	});
};

/*
	GET /api/files/:fileId/information
 */
exports.getFileInformation = async (req, res) => {
	const {fileId} = req.params;
	const file = await FileModel.findOne({
		where: {
			id: fileId,
		},
	});

	if (!file) {
		throw new Http404();
	}

	const objectHeaders = await s3.headObject(file.path);

	res.json({
		...file.toJSON(),
		objectHeaders,
	});
};

/*
	GET /api/files/:fileId
 */
exports.getFile = async (req, res) => {
	const {fileId} = req.params;
	const file = await FileModel.findOne({
		where: {
			id: fileId,
		},
	});

	if (!file) {
		throw new Http404();
	}

	const stream = await s3.getObjectStream(file.path);

	res.set({
		...stream.Body.headers,
		'Content-Disposition': contentDisposition(file.basename),
	});
	stream.Body.on('data', data => res.write(data));
	stream.Body.on('end', () => res.end());
};

/*
	DELETE /api/files/:fileId
 */
exports.deleteFile = async (req, res) => {
	const {fileId} = req.params;
	const file = await FileModel.findOne({
		where: {
			id: fileId,
		},
	});

	if (!file) {
		throw new Http404();
	}

	await s3.deleteObjects([file.path]);
	await file.destroy();
	res.sendStatus(204);
};
