const {setNoCacheHeader} = require('../common/utils');
const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');
const fileHandler = require('../handlers/file-handler');
const tagHandler = require('../handlers/tag-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get('/files', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get(/^\/files\/\d+$/, setNoCacheHeader, baseHandler.getBaseView);

expressRouter.get('/api/files', setNoCacheHeader, fileHandler.getFiles);
expressRouter.get('/api/files/:fileId(\\d+)', fileHandler.downloadFile);
expressRouter.get('/api/files/:fileId(\\d+)/information', setNoCacheHeader, fileHandler.getFileInformation);
expressRouter.delete('/api/files/:fileId(\\d+)', fileHandler.deleteFile);
expressRouter.get('/api/tags', tagHandler.getTags);
expressRouter.post('/api/tags', tagHandler.createTag);

module.exports = expressRouter.router;
