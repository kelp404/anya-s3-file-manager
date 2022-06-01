class Http400 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'bad request');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 400;
		this.extra = extra;
	}
}

class Http401 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		// Redirect to the login page.
		super(message || 'unauthorized');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 401;
		this.extra = extra;
	}
}

class Http403 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'permission denied');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 403;
		this.extra = extra;
	}
}

class Http404 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'resource not found');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 404;
		this.extra = extra;
	}
}

class Http409 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'conflict');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 409;
		this.extra = extra;
	}
}

class Http422 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'unprocessable entity');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 422;
		this.extra = extra;
	}
}

class Http429 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'too many requests');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 429;
		this.extra = extra;
	}
}

class Http500 extends Error {
	/**
   * @param {*} message
   * @param {{frontendOperationCode: string, frontendOperationValue: *}|undefined} extra
   */
	constructor(message, extra) {
		super(message || 'server error');
		if (message?.stack) {
			this.secondaryStack = this.stack;
			this.stack = message.stack;
		}

		this.status = 500;
		this.extra = extra;
	}
}

module.exports = {
	Http400,
	Http401,
	Http403,
	Http404,
	Http409,
	Http422,
	Http429,
	Http500,
};
