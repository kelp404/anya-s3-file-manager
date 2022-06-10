const PAGINATION_MAX_LIMIT = 100;
const MAX_ID_VALUE = 0x7FFFFFFF;

function generateIdSchema({fieldName = 'id'} = {}) {
	// Ref: https://dev.mysql.com/doc/refman/8.0/en/integer-types.html
	return {
		[fieldName]: {
			type: 'number',
			optional: false,
			convert: true,
			min: 1,
			max: MAX_ID_VALUE,
			integer: true,
		},
	};
}

function generateIdsSchema({fieldName = 'ids'} = {}) {
	return {
		[fieldName]: {
			type: 'string',
			pattern: /^\d+(,\d+)*$/,
			optional: false,
			empty: false,
			custom(value, errors, schema) {
				if (schema.optional && value == null) {
					return value;
				}

				const items = value.split(',').map(Number);
				const set = new Set(items);

				if (items.length !== set.size) {
					errors.push({
						type: 'arrayUnique',
						actual: value,
						expected: Array.from(set),
					});
				}

				for (const item of items) {
					if (item > MAX_ID_VALUE) {
						errors.push({
							type: 'numberMax',
							actual: item,
							expected: MAX_ID_VALUE,
						});
						break;
					}
				}

				return items;
			},
		},
	};
}

function generateKeywordSchema({fieldName = 'keyword'} = {}) {
	return {
		[fieldName]: {
			type: 'string',
			optional: true,
			trim: true,
			max: 255,
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
			max: PAGINATION_MAX_LIMIT,
			integer: true,
		},
	};
}

module.exports = {
	generateIdSchema,
	generateIdsSchema,
	generateKeywordSchema,
	generateCursorPaginationSchema,
};
