const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const bluebird = require('bluebird');
const config = require('config');
const sqlite3 = require('sqlite3').verbose();
const {ENVIRONMENT_MODE} = require('../shared/constants');

const {
	DATABASE_PATH, S3, MODE, EXPRESS_SERVER,
} = config;
const LOCAL_DATABASE_PATH = path.join(__dirname, '..', '..', DATABASE_PATH);

bluebird.longStackTraces();
global.Promise = bluebird;

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
	const {validateS3Settings} = require('./validators/s3-settings-validator');
	const {connectDatabase} = require('./common/database');
	const {
		downloadDatabaseFromS3,
		syncObjectsFromS3,
	} = require('./common/s3');

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
		databaseFileOnS3 = await downloadDatabaseFromS3({logger: console.log});

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
	connectDatabase();
	console.log('Sync objects from S3.');
	await syncObjectsFromS3();
}

function launchServer() {
	const {server} = require('./apps/web');

	server.listen(EXPRESS_SERVER.PORT, EXPRESS_SERVER.HOST, () => {
		console.log(`Server listening at http://${EXPRESS_SERVER.HOST}:${EXPRESS_SERVER.PORT}`);
	});
}

async function execute() {
	await initialDatabase();
	launchServer();
}

execute()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
