const path = require('path');
const config = require('config');
const {Sequelize} = require('sequelize');

exports._sequelize = null;
exports.connectDatabase = ({isLogSQL = false} = {}) => {
	exports._sequelize = exports._sequelize || new Sequelize({
		dialect: 'sqlite',
		storage: path.join(__dirname, '..', '..', '..', config.DATABASE_PATH),
		logging: isLogSQL,
	});

	return {
		sequelize: exports._sequelize,
	};
};
