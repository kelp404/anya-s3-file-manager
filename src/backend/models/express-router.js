const util = require('util');
const {Router} = require('express');
const {
	Http500,
} = require('./errors');

class ExpressRouter {
	constructor() {
		this.router = new Router();
		this.setRouter = this.setRouter.bind(this);
		this.get = this.get.bind(this);
		this.post = this.post.bind(this);
		this.put = this.put.bind(this);
		this.patch = this.patch.bind(this);
		this.delete = this.delete.bind(this);
	}

	static handlerWrap(handler, {hasNextHandler}) {
		return async (req, res, next) => {
			try {
				await handler(req, res);
			} catch (error) {
				if (error instanceof Error) {
					return next(error);
				}

				if (typeof error === 'object') {
					return next(
						new Http500(util.inspect(error, {showHidden: false, depth: null})),
					);
				}

				return next(new Http500(error));
			}

			if (hasNextHandler) {
				next();
			}
		};
	}

	/**
   * @this ExpressRouter
   * @param {string} method
   * @param {string|RegExp} path
   * @param {Array<function(req, res)|Array<function(req, res)>>} handlers
   * @returns {undefined}
   */
	setRouter(method, path, ...handlers) {
		const flattedHandlers = handlers.flat();

		this.router[method](
			path,
			...flattedHandlers.map((handler, index) =>
				ExpressRouter.handlerWrap(handler, {hasNextHandler: index < flattedHandlers.length - 1}),
			),
		);
	}

	get(path, ...handlers) {
		this.setRouter('get', path, ...handlers);
	}

	post(path, ...handlers) {
		this.setRouter('post', path, ...handlers);
	}

	put(path, ...handlers) {
		this.setRouter('put', path, ...handlers);
	}

	patch(path, ...handlers) {
		this.setRouter('patch', path, ...handlers);
	}

	delete(path, ...handlers) {
		this.setRouter('delete', path, ...handlers);
	}
}

module.exports = ExpressRouter;
