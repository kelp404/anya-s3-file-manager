const path = require('path');
const http = require('http');
const config = require('config');
const ejs = require('ejs');
const express = require('express');
const nocache = require('nocache');
const {Http404} = require('../models/errors');
const webRouter = require('../routers/web-router');
const baseHandler = require('../handlers/base-handler');

const app = express();
const server = http.createServer(app);

// Hide x-powered-by
app.locals.settings['x-powered-by'] = false;
// Disable ETag at headers
app.disable('etag');

ejs.delimiter = '?';
app.set('views', path.join(__dirname, '..', '..', 'frontend', 'express'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.locals.archive = (object = null) => Buffer.from(JSON.stringify(object)).toString('base64');
app.locals.config = {
	IS_USE_DEBUG_ASSETS: config.IS_USE_DEBUG_ASSETS,
	ASSETS_PATH: config.ASSETS_PATH,
	COOKIES: config.COOKIES,
	LIMIT: config.LIMIT,
};

app.use(
	/^\/assets(?!\/express)/,
	(req, res, next) => {
		if (/\.(js|css|svg)$/.test(req.path)) {
			res.set('Content-Encoding', 'gzip');
		}

		next();
	},
	express.static(path.join(__dirname, '..', '..', 'frontend')),
);
app.use(nocache(), webRouter);

// Error handlers
app.use((req, res, next) => {
	// Didn't match any routers.
	next(new Http404());
});
app.use((error, req, res, _) => {
	error.status = error.status || 500;
	res.status(error.status);
	res.locals.error = error;

	if (req.headers.accept && req.headers.accept.includes('application/json')) {
		// Return JSON.
		res.json({
			message: `${error}`,
			extra: error.extra,
		});
	} else {
		// Return HTML.
		baseHandler.getBaseView(req, res);
	}
});

module.exports = {app, server};
