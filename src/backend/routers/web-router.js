const {setNoCacheHeader} = require('../common/utils');
const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');
const fileHandler = require('../handlers/file-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get('/files', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get(/^\/files\/\d+$/, setNoCacheHeader, baseHandler.getBaseView);

expressRouter.get('/api/files', setNoCacheHeader, fileHandler.getFiles);
expressRouter.get('/api/files/:fileId(\\d+)', fileHandler.downloadFile);
expressRouter.get(/^\/api\/files\/(\d+(?:,\d+)+)$/i, fileHandler.downloadFiles);
expressRouter.get('/api/files/:fileId(\\d+)/information', setNoCacheHeader, fileHandler.getFileInformation);
expressRouter.delete('/api/files', fileHandler.deleteFiles);

module.exports = expressRouter.router;
