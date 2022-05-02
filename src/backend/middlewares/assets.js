const path = require('path');
const config = require('config');
const express = require('express');

const {GZIP_FILE_PATTERN} = config;

module.exports = {
	setAssetsHeader: () => (req, res, next) => {
		if (GZIP_FILE_PATTERN.test(req.path)) {
			res.set('Content-Encoding', 'gzip');
		}

		next();
	},
	assetsHandler: () => express.static(path.join(__dirname, '..', '..', 'frontend')),
};
