const ExpressRouter = require('../models/express-router');
const baseHandler = require('../handlers/base-handler');

const expressRouter = new ExpressRouter();

expressRouter.get('/', baseHandler.getBaseView);

module.exports = expressRouter.router;
