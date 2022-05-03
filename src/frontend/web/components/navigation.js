const {getRouter, Link} = require('capybara-router');
const React = require('react');
const _ = require('../../languages');
const {WEB_TITLE} = require('../../core/constants');
const Base = require('../../core/pages/base');

module.exports = class Navigation extends Base {
	constructor(props) {
		super(props);
		this.state.currentRouteName = getRouter().currentRoute.name;
	}

	componentDidMount() {
		super.componentDidMount();
		const router = getRouter();

		this.$listens.push(router.listen('ChangeStart', (action, toState, fromState, next) => {
			this.setState({
				currentRouteName: toState.name,
			});
			next();
		}));
	}

	render() {
		return (
			<nav className="navbar sticky-top navbar-dark bg-dark navbar-expand-md">
				<div className="container-fluid">
					<Link className="navbar-brand" to="/">
						<span className="ms-1">{_(WEB_TITLE)}</span>
					</Link>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-0">
							<li className="nav-item">
								<a className="nav-link" href="/">{_('Files')}</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="/settings">{_('Settings')}</a>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		);
	}
};
