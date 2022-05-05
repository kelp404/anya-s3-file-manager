const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/utils');

const {sequelize} = connectDatabase();
const attributes = {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};
const Model = sequelize.define('tag', attributes);

module.exports = Model;
