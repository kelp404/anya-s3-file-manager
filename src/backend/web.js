const {execSync} = require('child_process');
const bluebird = require('bluebird');
const config = require('config');
const {ENVIRONMENT_MODE} = require('../shared/constants');

const {
	S3, MODE, EXPRESS_SERVER, IS_SYNC_S3_OBJECTS_ON_LAUNCH,
} = config;

bluebird.longStackTraces();
global.Promise = bluebird;

async function initialDatabase() {
	const {validateS3Settings} = require('./validators/s3-settings-validator');
	const {connectDatabase} = require('./common/database');
	const {
		syncObjectsFromS3,
	} = require('./common/s3');

	const checkS3SettingsResult = validateS3Settings(S3);

	if (checkS3SettingsResult !== true) {
		const error = new Error('invalid config.S3');

		error.extra = checkS3SettingsResult;
		throw error;
	}

	// Migrate database.
	console.log('Migrate database.');
	const migrationScript = MODE === ENVIRONMENT_MODE.DEFAULT
		? 'npm run runmigration:dev'
		: 'npm run runmigration';
	const migrationResult = execSync(migrationScript);

	console.log(migrationResult.toString());
	connectDatabase();

	if (IS_SYNC_S3_OBJECTS_ON_LAUNCH) {
		console.log('Sync objects from S3.');
		await syncObjectsFromS3();
	}
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
