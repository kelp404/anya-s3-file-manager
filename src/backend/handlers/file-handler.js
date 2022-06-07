const path = require('path');
const archiver = require('archiver');
const config = require('config');
const contentDisposition = require('content-disposition');
const pLimit = require('p-limit');
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
	PAGINATION, S3,
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
exports.downloadFile = async (req, res) => {
	const NOT_FORWARD_HEADERS = [
		'Accept-Ranges',
	];
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

	res.set('Content-Disposition', contentDisposition(file.basename));

	for (let index = 0; index < stream.Body.rawHeaders.length - 1; index += 2) {
		const key = stream.Body.rawHeaders[index];
		const value = stream.Body.rawHeaders[index + 1];

		if (NOT_FORWARD_HEADERS.includes(key)) {
			continue;
		}

		res.set(key, value);
	}

	stream.Body.on('data', data => res.write(data));
	stream.Body.on('end', () => res.end());
};

/*
	GET /api/files/:fileIds
 */
exports.downloadFiles = async (req, res) => {
	const fileIds = Array.from(new Set(req.params[0].split(',').map(Number)));
	const files = await FileModel.findAll({
		where: {
			id: {[Op.in]: fileIds},
		},
	});

	if (files.length !== fileIds) {
		const existsFileIds = files.map(file => file.id);

		fileIds.forEach(fileId => {
			if (!existsFileIds.includes(fileId)) {
				throw new Http404(`not found "${fileId}"`);
			}
		});
	}

	const limit = pLimit(1);
	const folderNames = Array.from(new Set(files.map(file => file.dirname || S3.BUCKET)));
	const isAllFilesInSameFolder = folderNames.length === 1;
	const archive = archiver('zip', {zlib: {level: 1}});
	const zipFilenameTable = {};
	const isFilenameExists = name => name.toLowerCase() in zipFilenameTable;
	const getNextFilenameIndex = name => ++zipFilenameTable[name.toLowerCase()];
	const initFilenameIndex = name => {
		zipFilenameTable[name.toLowerCase()] = 0;
	};

	res.set({
		'Content-Type': 'application/zip',
		'Content-disposition': isAllFilesInSameFolder
			? contentDisposition(`${folderNames[0].split('/').slice(-1)}.zip`)
			: contentDisposition('download.zip'),
	});
	archive.pipe(res);

	await Promise.all(files.map(file => limit(async () => {
		const filename = isAllFilesInSameFolder ? file.basename : file.path;
		let filenameInZip = filename;
		const stream = await s3.getObjectStream(file.path);

		if (isFilenameExists(filename)) {
			const extname = path.extname(filename);

			do {
				const filenameIndex = getNextFilenameIndex(filename);

				if (extname) {
					filenameInZip = [
						filename.replace(new RegExp(`\\${extname}$`), ''),
						` (${filenameIndex})`,
						extname,
					].join('');
				} else {
					filenameInZip = `${filename} (${filenameIndex})`;
				}
			} while (isFilenameExists(filenameInZip));
		} else {
			initFilenameIndex(filename);
		}

		archive.append(stream.Body, {name: filenameInZip});
		return new Promise(resolve => {
			stream.Body.on('end', resolve);
		});
	})));
	archive.finalize();
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
