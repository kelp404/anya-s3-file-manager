const config = require('config');

const {
	PAGINATION,
} = config;

function generateIdSchema({fieldName = 'id'} = {}) {
	// Ref: https://dev.mysql.com/doc/refman/8.0/en/integer-types.html
	return {
		[fieldName]: {
			type: 'number',
			optional: false,
			convert: true,
			min: 1,
			max: 0x7FFFFFFF,
			integer: true,
		},
	};
}

function generateCursorPaginationSchema() {
	return {
		after: {
			...generateIdSchema().id,
			optional: true,
		},
		limit: {
			type: 'number',
			optional: true,
			convert: true,
			min: 1,
			max: PAGINATION.MAX_LIMIT,
			integer: true,
		},
	};
}

module.exports = {
	generateIdSchema,
	generateCursorPaginationSchema,
};
