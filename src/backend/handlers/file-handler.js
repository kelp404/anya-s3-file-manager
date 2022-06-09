const path = require('path');
const archiver = require('archiver');
const busboy = require('busboy');
const config = require('config');
const contentDisposition = require('content-disposition');
const pLimit = require('p-limit');
const {Op, UniqueConstraintError} = require('sequelize');
const {
	OBJECT_TYPE,
	FRONTEND_OPERATION_CODE,
} = require('../../shared/constants');
const utils = require('../common/utils');
const s3 = require('../common/s3');
const {
	validateDownloadFilesQuery,
	validateUploadFileQuery,
} = require('../validators/file-validator');
const ObjectModel = require('../models/data/object-model');
const {
	Http404,
	Http409,
	Http422,
} = require('../models/errors');

const {
	S3,
} = config;

/*
	POST /api/files
 */
exports.uploadFile = async (req, res) => {
	const checkResult = validateUploadFileQuery(req.query);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {dirname = ''} = req.query;

	if (dirname) {
		const folder = await ObjectModel.findOne({
			where: {
				type: OBJECT_TYPE.FOLDER,
				path: `${dirname}/`,
			},
		});

		if (!folder) {
			throw new Http404();
		}
	}

	const bb = busboy({headers: req.headers});
	let object;

	await new Promise((resolve, reject) => {
		bb.on('error', error => reject(error));
		bb.on('file', async (name, file, {filename: encodedFilename, mimeType}) => {
			try {
				const filename = decodeURIComponent(encodedFilename);

				object = new ObjectModel({
					type: OBJECT_TYPE.FILE,
					path: dirname ? `${dirname}/${filename}` : filename,
					dirname: dirname || '',
					basename: filename,
				});

				try {
					await object.save();
				} catch (error) {
					if (
						error instanceof UniqueConstraintError
						&& (error.errors || [])[0]?.path === 'path'
					) {
						throw new Http409(error, {
							frontendOperationCode: FRONTEND_OPERATION_CODE.SHOW_OBJECT_DUPLICATED_ALERT,
							frontendOperationValue: object.path,
						});
					}

					throw error;
				}

				try {
					await s3.upload(object.path, file, {ContentType: mimeType});
					const objectHeaders = await s3.headObject(object.path);

					object.size = objectHeaders.ContentLength;
					object.lastModified = objectHeaders.LastModified;
				} catch (error) {
					await object.destroy();
					throw error;
				}

				await object.save();
				resolve();
			} catch (error) {
				reject(error);
			}
		});
		req.pipe(bb);
	});

	res.status(201).json(object);
};

/*
	GET /api/files
 */
exports.downloadFiles = async (req, res) => {
	const checkResult = validateDownloadFilesQuery(req.query);

	if (checkResult !== true) {
		throw new Http422('form validation failed', checkResult);
	}

	const {ids} = req.query;
	const limit = pLimit(1);
	const files = [];
	const objects = await ObjectModel.findAll({
		where: {
			id: {[Op.in]: ids},
		},
	});

	if (objects.length !== ids.length) {
		const existsIds = objects.map(({id}) => id);

		ids.forEach(id => {
			if (!existsIds.includes(id)) {
				throw new Http404(`not found object "${id}"`);
			}
		});
	}

	await Promise.all(objects.map(object => limit(async () => {
		if (object.type === OBJECT_TYPE.FILE) {
			files.push(object);
			return;
		}

		const deepFiles = await ObjectModel.findAll({
			where: {
				path: {[Op.like]: utils.generateLikeSyntax(object.path, {start: ''})},
				type: OBJECT_TYPE.FILE,
			},
		});

		files.push(...deepFiles);
	})));

	if (files.length === 1) {
		// Forward S3 response.
		const NOT_FORWARD_HEADERS = [
			'Accept-Ranges',
		];
		const stream = await s3.getObjectStream(files[0].path);

		res.set('Content-Disposition', contentDisposition(files[0].basename));

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
	} else {
		await archiveFilesAndDownload({files, res});
	}
};

/**
 * @param {Array<ObjectModel>} files
 * @param {ServerResponse} res
 * @returns {Promise<void>}
 */
async function archiveFilesAndDownload({files, res}) {
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
}
