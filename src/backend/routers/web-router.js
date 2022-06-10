const {setNoCacheHeader} = require('../common/utils');
const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');
const fileHandler = require('../handlers/file-handler');
const objectHandler = require('../handlers/object-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get('/objects', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get('/objects/uploader', setNoCacheHeader, baseHandler.getBaseView);
expressRouter.get(/^\/objects\/\d+$/, setNoCacheHeader, baseHandler.getBaseView);

expressRouter.get('/api/objects', setNoCacheHeader, objectHandler.getObjects);
expressRouter.post('/api/objects', objectHandler.createObject);
expressRouter.delete('/api/objects', objectHandler.deleteObjects);
expressRouter.get('/api/objects/:objectId(\\d+)', setNoCacheHeader, objectHandler.getObject);
expressRouter.get('/api/files', fileHandler.downloadFiles);
expressRouter.post('/api/files', fileHandler.uploadFile);

module.exports = expressRouter.router;
