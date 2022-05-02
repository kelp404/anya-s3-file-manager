const path = require('path');
const http = require('http');
const config = require('config');
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');
const {Http404} = require('../models/errors');
const webRouter = require('../routers/web-router');
const {setAssetsHeader, assetsHandler} = require('../middlewares/assets');
const requestLogger = require('../middlewares/request-logger');
const baseHandler = require('../handlers/base-handler');

const {
	IS_USE_DEBUG_ASSETS, ASSETS_PATH, COOKIES, LIMIT, IS_LOG_REQUEST,
} = config;

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
	IS_USE_DEBUG_ASSETS,
	ASSETS_PATH,
	COOKIES,
	LIMIT,
};

if (IS_LOG_REQUEST) {
	app.use(requestLogger());
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(/^\/assets(?!\/express)/, setAssetsHeader(), assetsHandler());
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
