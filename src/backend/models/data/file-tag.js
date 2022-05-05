const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/utils');

const {sequelize} = connectDatabase();
const attributes = {
	fileId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	tagId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
};
const options = {
	timestamps: false,
	indexes: [
		{
			unique: true,
			fields: ['fileId', 'tagId'],
		},
		{
			unique: false,
			fields: ['tagId', 'fileId'],
		},
	],
};
const Model = sequelize.define('file_tag', attributes, options);

module.exports = Model;
