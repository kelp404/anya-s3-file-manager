const lodash = require('lodash');
const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/database');

const {sequelize} = connectDatabase();
const attributes = {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};
const options = {
	indexes: [
		{
			unique: true,
			fields: ['title'],
		},
	],
};
const Model = sequelize.define('tag', attributes, options);

Model.prototype.toJSON = function () {
	const result = lodash.cloneDeep(this.get({plain: false}));

	delete result.file_tag;
	return result;
};

module.exports = Model;

const File = require('./file');
const FileTag = require('./file-tag');

Model.belongsToMany(File, {through: FileTag});
