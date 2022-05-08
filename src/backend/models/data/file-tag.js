const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/database');

const {sequelize} = connectDatabase();
const attributes = {
	fileId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
	tagId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
};
const options = {
	timestamps: false,
	indexes: [
		{
			unique: false,
			fields: ['tagId', 'fileId'],
		},
	],
};
const Model = sequelize.define('file_tag', attributes, options);

module.exports = Model;
