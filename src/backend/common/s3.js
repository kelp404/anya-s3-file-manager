const path = require('path');
const AWS = require('aws-sdk');
const {S3Client, GetObjectCommand} = require('@aws-sdk/client-s3');
const config = require('config');
const {Op} = require('sequelize');
const FileModel = require('../models/data/file-model');
const {FILE_TYPE} = require('../../shared/constants');

const {
	S3,
} = config;
const s3 = new AWS.S3({
	accessKeyId: S3.KEY,
	secretAccessKey: S3.SECRET,
	region: S3.REGION,
});

/**
 * @returns {Promise<null|
 * 		{
 * 			Body: Buffer,
 * 			LastModified: date,
 * 			ContentLength: number,
 * 			ContentType: string,
 * 			Metadata: {}
 * 		}
 * >}
 */
exports.downloadDatabaseFromS3 = async ({logger} = {}) => {
	const isShowLog = typeof logger === 'function';

	try {
		if (isShowLog) {
			logger('Start download database from S3.');
		}

		const result = await s3
			.getObject({Bucket: S3.BUCKET, Key: S3.DATABASE_PATH})
			.promise();

		if (isShowLog) {
			logger('Finish download database from S3.');
		}

		return result;
	} catch (error) {
		if (error.statusCode === 404) {
			logger('Not found database on S3.');
			return null;
		}

		throw error;
	}
};

exports.syncFilesFromS3 = async () => {
	const start = new Date();
	const scanObjects = async continuationToken => {
		const result = await s3
			.listObjectsV2({Bucket: S3.BUCKET, ContinuationToken: continuationToken})
			.promise();

		await Promise.all([
			FileModel.bulkCreate(
				result.Contents.map(content => {
					const dirname = path.dirname(content.Key);

					return {
						type: content.Key.slice(-1) === '/' ? FILE_TYPE.FOLDER : FILE_TYPE.FILE,
						path: content.Key,
						dirname: dirname === '.' ? '' : dirname,
						basename: path.basename(content.Key),
						lastModified: content.LastModified,
						size: content.Size,
					};
				}),
				{updateOnDuplicate: ['type', 'lastModified', 'size', 'updatedAt']},
			),
			result.NextContinuationToken ? scanObjects(result.NextContinuationToken) : null,
		]);
	};

	await scanObjects();

	// Remove missing files.
	await FileModel.destroy({
		where: {updatedAt: {[Op.lt]: start}},
	});
};

/*
	https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
 */
exports.headObject = (path, options) => s3
	.headObject({
		...options,
		Bucket: S3.BUCKET,
		Key: path,
	})
	.promise();

/*
	https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property
 */
exports.deleteObjects = (paths, options) => s3
	.deleteObjects({
		Bucket: S3.BUCKET,
		Delete: {
			...options,
			Objects: paths.map(path => ({Key: path})),
		},
	})
	.promise();

exports.getObjectStream = path => {
	const client = new S3Client({
		region: S3.REGION,
		credentials: {
			accessKeyId: S3.KEY,
			secretAccessKey: S3.SECRET,
		},
	});

	return client.send(new GetObjectCommand({
		Bucket: S3.BUCKET,
		Key: path,
	}));
};
