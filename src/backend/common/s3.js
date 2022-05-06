const AWS = require('aws-sdk');
const config = require('config');

const {
	S3,
} = config;

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
	const s3 = new AWS.S3({
		accessKeyId: S3.KEY,
		secretAccessKey: S3.SECRET,
		region: S3.REGION,
	});

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

