const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');
const fileHandler = require('../handlers/file-handler');
const tagHandler = require('../handlers/tag-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', baseHandler.getBaseView);
expressRouter.get('/files', baseHandler.getBaseView);

expressRouter.get('/api/files', fileHandler.getFiles);
expressRouter.get('/api/tags', tagHandler.getTags);

module.exports = expressRouter.router;
