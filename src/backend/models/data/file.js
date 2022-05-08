const lodash = require('lodash');
const {DataTypes} = require('sequelize');
const {FILE_TYPE} = require('../../../shared/constants');
const {connectDatabase} = require('../../common/database');

const {sequelize} = connectDatabase();
const attributes = {
	type: {
		type: DataTypes.TINYINT,
		allowNull: false,
		validate: {
			isIn: [Object.values(FILE_TYPE)],
		},
	},
	path: {
		type: new DataTypes.STRING(1024),
		allowNull: false,
	},
	/**
	 * The folder name.
	 * AWS S3 Key: dirname
	 * "test.txt": "."
	 * "a/b/": "a"
	 * "a/b/test.txt": "a/b"
	 */
	dirname: {
		type: new DataTypes.STRING(1024),
		allowNull: false,
	},
	/**
	 * The file, folder name.
	 * AWS S3 Key: dirname
	 * "test.txt": "test.txt"
	 * "a/b/": "b"
	 * "a/b/test.txt": "test.txt"
	 */
	basename: {
		type: new DataTypes.STRING(1024),
		allowNull: false,
	},
	lastModified: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	size: {
		type: DataTypes.BIGINT.UNSIGNED,
		allowNull: false,
	},
};
const options = {
	indexes: [
		{
			unique: true,
			fields: ['path'],
		},
		{
			unique: false,
			fields: ['updatedAt'],
		},
	],
};
const Model = sequelize.define('file', attributes, options);

Model.prototype.toJSON = function () {
	const result = lodash.cloneDeep(this.get({plain: false}));

	return result;
};

module.exports = Model;

const Tag = require('./tag');
const FileTag = require('./file-tag');

Model.belongsToMany(Tag, {through: FileTag});
