const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const AWS = require('aws-sdk');
const config = require('config');
const sqlite3 = require('sqlite3').verbose();
const {ENVIRONMENT_MODE} = require('./models/constants');
const {validateS3Settings} = require('./validators/s3-settings-validator');
const utils = require('./common/utils');

const {
	DATABASE_PATH, S3, MODE,
} = config;
const LOCAL_DATABASE_PATH = path.join(__dirname, '..', '..', DATABASE_PATH);

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
async function downloadDatabaseFromS3() {
	const s3 = new AWS.S3({
		accessKeyId: S3.KEY,
		secretAccessKey: S3.SECRET,
		region: S3.REGION,
	});

	try {
		console.log('Start download database from S3.');

		const result = await s3
			.getObject({Bucket: S3.BUCKET, Key: S3.DATABASE_PATH})
			.promise();

		console.log('Finish download database from S3.');
		return result;
	} catch (error) {
		if (error.statusCode === 404) {
			console.log('Not found database on S3.');
			return null;
		}

		throw error;
	}
}

/**
 * @param {string} path
 * @param {boolean} force - Remove exists file when it is true.
 * @returns {Promise<sqlite3.Database>}
 */
async function createDatabase(path, {force} = {}) {
	let db;

	if (force) {
		fs.rmSync(path, {force});
	}

	await new Promise((resolve, reject) => {
		db = new sqlite3.Database(path, error => {
			if (error) {
				return reject(error);
			}

			resolve();
		});
	});

	return db;
}

async function initialDatabase() {
	let db;
	let databaseFileOnS3;
	const checkS3SettingsResult = validateS3Settings(S3);

	if (checkS3SettingsResult !== true) {
		const error = new Error('invalid config.S3');

		error.extra = checkS3SettingsResult;
		throw error;
	}

	try {
		// Try to open local database file.
		if (!fs.existsSync(LOCAL_DATABASE_PATH)) {
			throw new Error(`not found ${LOCAL_DATABASE_PATH}`);
		}

		// Test database.
		db = await createDatabase(LOCAL_DATABASE_PATH);
		await util.promisify(db.all).bind(db)('SELECT 1+1 AS result');
		db.close();
	} catch (_) {
		// Not found local database file.
		databaseFileOnS3 = await downloadDatabaseFromS3();

		if (databaseFileOnS3 != null) {
			fs.writeFileSync(LOCAL_DATABASE_PATH, databaseFileOnS3.Body);
		}
	}

	// Migrate database.
	console.log('Migrate database.');
	const migrationScript = MODE === ENVIRONMENT_MODE.DEFAULT
		? 'npm run runmigration:dev'
		: 'npm run runmigration';
	const migrationResult = execSync(migrationScript);

	console.log(migrationResult.toString());
}

function launchServer() {
	const {server} = require('./apps/web');

	server.listen(config.EXPRESS_SERVER.PORT, config.EXPRESS_SERVER.HOST, () => {
		const {address, port} = server.address();
		console.log(`Server listening at http://${address}:${port}`);
	});
}

async function execute() {
	await initialDatabase();
	utils.connectDatabase();
	launchServer();
}

execute()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
