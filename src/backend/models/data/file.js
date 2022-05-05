const lodash = require('lodash');
const {DataTypes} = require('sequelize');
const {connectDatabase} = require('../../common/utils');

const {sequelize} = connectDatabase();
const attributes = {
	path: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};
const options = {
	indexes: [
		{
			unique: true,
			fields: ['path'],
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
