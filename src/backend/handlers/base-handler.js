/*
 * Don't throw an error at base view handlers.
 * Make sure handles are available at any situations.
 */
exports.getBaseView = (req, res) => {
	const values = {
		error: res.locals.error
			? {message: `${res.locals.error}`, status: res.locals.error.status}
			: null,
	};

	res.render('web', values);
};
