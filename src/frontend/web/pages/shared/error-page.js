const React = require('react');
const PropTypes = require('prop-types');
const _ = require('../../../languages');
const {WEB_TITLE} = require('../../../core/constants');

module.exports = class ErrorPage extends React.PureComponent {
	static propTypes = {
		error: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				status: PropTypes.number,
				message: PropTypes.string,
			}),
		]),
	};

	static defaultProps = {
		error: 'Error',
	};

	state = {};

	constructor(props) {
		super(props);

		const {error} = props;

		this.state.status = error.status || '';
		this.state.message = error.message || `${error}`;

		if (error.status === 404) {
			document.title = `${_('Not found')} - ${WEB_TITLE}`;
		} else {
			document.title = `${_('Error')} - ${WEB_TITLE}`;
		}
	}

	render() {
		const {status, message} = this.state;

		return (
			<>
				<div className="main-content">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-12 col-md-8 col-lg-6">
								<div className="card shadow my-5">
									<div className="card-body text-center py-5">
										<h2 className="card-title mb-4">{_('Error')} {status}</h2>
										<p className="card-title mb-4">{message}</p>
										<a className="btn btn-outline-primary btn-lg" href="/">
											{_('Go to homepage')}
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* <Footer/> */}
			</>
		);
	}
};
