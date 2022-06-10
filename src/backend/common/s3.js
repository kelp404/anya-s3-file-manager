const AWS = require('aws-sdk');
const {S3Client, GetObjectCommand} = require('@aws-sdk/client-s3');
const config = require('config');
const {Op} = require('sequelize');
const ObjectModel = require('../models/data/object-model');
const {OBJECT_TYPE} = require('../../shared/constants');

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

exports.syncObjectsFromS3 = async () => {
	const start = new Date();
	const scanObjects = async continuationToken => {
		const pathSet = new Set();
		const result = await s3
			.listObjectsV2({Bucket: S3.BUCKET, ContinuationToken: continuationToken})
			.promise();
		const convertS3Object = ({Key, Size, LastModified}) => ({
			type: Key.slice(-1) === '/' ? OBJECT_TYPE.FOLDER : OBJECT_TYPE.FILE,
			path: Key,
			lastModified: LastModified,
			size: Size,
		});

		await Promise.all([
			ObjectModel.bulkCreate(
				result.Contents
					.map(content => {
						const pieces = content.Key.split('/').slice(0, -1);

						return [
							convertS3Object(content),
							...pieces.map((piece, index) => convertS3Object({
								Key: `${pieces.slice(0, index + 1).join('/')}/`,
							})),
						];
					})
					.flat()
					.filter(object => {
						if (object.type === OBJECT_TYPE.FILE) {
							pathSet.add(object.path);
							return true;
						}

						if (pathSet.has(object.path)) {
							return false;
						}

						pathSet.add(object.path);
						return true;
					}),
				{updateOnDuplicate: ['type', 'lastModified', 'size', 'updatedAt']},
			),
			result.NextContinuationToken ? scanObjects(result.NextContinuationToken) : null,
		]);
	};

	await scanObjects();

	// Remove missing objects.
	await ObjectModel.destroy({
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

/*
	https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
 */
exports.upload = (path, body, options) => s3
	.upload({
		...options,
		Bucket: S3.BUCKET,
		Key: path,
		Body: body,
	})
	.promise();

/*
	https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
 */
exports.putObject = (path, options) => s3
	.putObject({
		...options,
		Bucket: S3.BUCKET,
		Key: path,
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
