const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');
const fileHandler = require('../handlers/file-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', baseHandler.getBaseView);
expressRouter.get('/api/files', fileHandler.getFiles);

module.exports = expressRouter.router;
