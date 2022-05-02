const path = require('path');
const config = require('config');
const {Sequelize} = require('sequelize');

exports._sequelize = null;
exports.connectDatabase = ({isLogSQL} = {}) => {
	exports._sequelize = exports._sequelize || new Sequelize({
		dialect: 'sqlite',
		storage: path.join(__dirname, '..', '..', '..', config.DATABASE_PATH),
		logging: isLogSQL == null ? config.IS_LOG_SQL : isLogSQL,
	});

	return {
		sequelize: exports._sequelize,
	};
};

/*
	Update Model.sequelize.
	Sequelize is sucks.
	We need to connect database before define models.
	So we use sucks way to change database connection.
 */
exports.updateConnectionOfModels = () => {
	const models = require('../models/data');
	const SYSTEM_FIELDS = ['sequelize', 'Sequelize'];

	Object.entries(models)
		.filter(([name]) => !SYSTEM_FIELDS.includes(name))
		.forEach(([_, model]) => {
			model.sequelize = exports._sequelize;
		});
};

exports.disconnectDatabase = () => {
	exports._sequelize = null;
};
