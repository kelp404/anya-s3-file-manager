const {program} = require('commander');
const pLimit = require('p-limit');

program
	.name(' ')
	.usage(
		`
  Force sync database schema (drop tables then create).
    node . sync`);

program
	.command('sync')
	.description('sync database schema');

program.parse(process.argv);

async function sync() {
	const utils = require('./src/backend/common/utils');
	const limit = pLimit(1);

	utils.connectDatabase({isLogSQL: true});

	const models = require('./src/backend/models/data');

	await Promise.all(
		Object.values(models.sequelize.models).map(model => limit(() => model.sync({force: true}))),
	);
}

async function execute() {
	const {args} = program;

	if (args[0] === 'sync') {
		return sync();
	}

	return program.help();
}

execute()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
