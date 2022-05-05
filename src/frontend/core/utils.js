const {getRouter} = require('capybara-router');

exports.renderError = error => {
	getRouter().renderError(error);
	if (typeof window.scrollTo === 'function') {
		window.scrollTo(0, 0);
	}
};
