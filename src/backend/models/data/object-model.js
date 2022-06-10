const path = require('path');
const lodash = require('lodash');
const {DataTypes, NOW} = require('sequelize');
const {OBJECT_TYPE} = require('../../../shared/constants');
const {connectDatabase} = require('../../common/database');

const {sequelize} = connectDatabase();
const attributes = {
	type: {
		type: DataTypes.TINYINT,
		allowNull: false,
		validate: {
			isIn: [Object.values(OBJECT_TYPE)],
		},
	},
	path: {
		type: new DataTypes.STRING(1024),
		allowNull: false,
		set(value) {
			const {dir, base} = path.parse(value);

			this.setDataValue('path', value);
			this.setDataValue('dirname', dir);
			this.setDataValue('basename', base);
		},
	},
	/**
	 * The folder name.
	 * 	"test.txt": ""
	 * 	"a/b/": "a"
	 * 	"a/b/test.txt": "a/b"
	 */
	dirname: {
		type: new DataTypes.STRING(1024),
		allowNull: false,
	},
	/**
	 * The file, folder name.
	 * 	"test.txt": "test.txt"
	 * 	"a/b/": "b"
	 * 	"a/b/test.txt": "test.txt"
	 */
	basename: {
		type: DataTypes.CITEXT,
		allowNull: false,
	},
	lastModified: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: NOW,
	},
	size: {
		type: DataTypes.BIGINT,
		allowNull: false,
		defaultValue: 0,
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
		{
			unique: false,
			fields: ['dirname', 'type', 'basename', 'id'],
		},
	],
};
const Model = sequelize.define('object', attributes, options);

Model.prototype.toJSON = function () {
	const result = lodash.cloneDeep(this.get({plain: false}));

	return result;
};

module.exports = Model;
