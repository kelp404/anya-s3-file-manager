const AWS = require('aws-sdk');
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

exports.syncObjectsFromS3 = async () => {
	const start = new Date();
	const scanObjects = async continuationToken => {
		const pathSet = new Set();
		const result = await s3
			.listObjectsV2({Bucket: S3.BUCKET, ContinuationToken: continuationToken})
			.promise();
		const convertS3Object = ({Key, Size, LastModified, StorageClass}) => ({
			type: Key.slice(-1) === '/' ? OBJECT_TYPE.FOLDER : OBJECT_TYPE.FILE,
			path: Key,
			lastModified: LastModified,
			size: Size,
			storageClass: StorageClass,
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
				{updateOnDuplicate: ['type', 'lastModified', 'size', 'updatedAt', 'storageClass']},
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

/*
	https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
 */
exports.getObject = (path, options) => s3
	.getObject({
		...options,
		Bucket: S3.BUCKET,
		Key: path,
	});
