const {getRouter} = require('capybara-router');
const filesize = require('filesize');

exports.renderError = error => {
	getRouter().renderError(error);
	if (typeof window.scrollTo === 'function') {
		window.scrollTo(0, 0);
	}
};

exports.formatSize = value =>
	filesize(value, {base: 2, round: 1, standard: 'jedec', symbols: {KB: 'kB'}});
