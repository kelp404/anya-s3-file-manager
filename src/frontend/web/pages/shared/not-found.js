const ErrorPage = require('./error-page');

module.exports = class NotFound extends ErrorPage {
	constructor(props = {}) {
		super({
			...props,
			error: {
				status: 404,
				message: 'The page not found.',
			},
		});
	}
};
