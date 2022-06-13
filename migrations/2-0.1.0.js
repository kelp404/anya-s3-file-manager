'use strict';

const Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "storageClass" to table "objects"
 * changeColumn "lastModified" on table "objects"
 * changeColumn "size" on table "objects"
 *
 **/

const info = {
	revision: 2,
	name: '0.1.0',
	created: '2022-06-13T02:48:04.317Z',
	comment: '',
};

const migrationCommands = [{
	fn: 'addColumn',
	params: [
		'objects',
		'storageClass',
		{
			type: Sequelize.TINYINT,
			field: 'storageClass',
			validate: {
				isIn: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9],
				],
			},
			allowNull: true,
		},
	],
},
{
	fn: 'changeColumn',
	params: [
		'objects',
		'lastModified',
		{
			type: Sequelize.DATE,
			field: 'lastModified',
			defaultValue: Sequelize.NOW,
			allowNull: true,
		},
	],
},
{
	fn: 'changeColumn',
	params: [
		'objects',
		'size',
		{
			type: Sequelize.BIGINT,
			field: 'size',
			defaultValue: 0,
			allowNull: true,
		},
	],
}];

module.exports = {
	pos: 0,
	up(queryInterface, Sequelize) {
		let index = this.pos;
		return new Promise((resolve, reject) => {
			function next() {
				if (index < migrationCommands.length) {
					const command = migrationCommands[index];
					console.log('[#' + index + '] execute: ' + command.fn);
					index++;
					queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
				} else {
					resolve();
				}
			}

			next();
		});
	},
	info,
};
