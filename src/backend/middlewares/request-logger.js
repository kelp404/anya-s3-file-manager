const onFinished = require('on-finished');

module.exports = () => (req, res, next) => {
	try {
		const startTime = Date.now();
		const onFinishedHandler = async (error, res) => {
			const now = Date.now();
			const processTimeInMillisecond = now - startTime;
			const processTime = `${processTimeInMillisecond}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			console.log(
				`[${res.statusCode}] ${processTime.padStart(7)}ms ${`${req.method}      `.slice(0, 6)} ${req.originalUrl}`,
			);

			if (res.locals.error) {
				console.error(res.locals.error);
			}
		};

		onFinished(res, onFinishedHandler);
	} catch (error) {
		return next(error);
	}

	next();
};
