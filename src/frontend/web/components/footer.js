const React = require('react');
const _ = require('../../languages');
const {WEB_TITLE} = require('../../core/constants');

module.exports = class Footer extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<footer className="container-fluid py-5 bg-dark">
				<div className="row text-light">
					<div className="col-12 col-md-6">
						<h4>{_(WEB_TITLE)}</h4>
						<p className="mb-5">
							<span>{_('An AWS S3 file manager.')}</span>
						</p>
						<p>© 2022 {_(WEB_TITLE)}</p>
					</div>

					<div className="col-12 col-md-3 text-light">
						<p className="h4">{_('Links')}</p>
						<ul className="list-unstyled">
							<li>
								<a href="https://github.com/kelp404/anya-s3-file-manager" target="_blank" rel="noreferrer">
									{_('GitHub')}
								</a>
							</li>
						</ul>
					</div>

					<div className="col-12 col-md-3">
						<p className="h4 text-light">{_('Languages')}</p>
						<ul className="list-unstyled mb-3">
							<li><a href="#en-us">English</a></li>
						</ul>
					</div>
				</div>
			</footer>
		);
	}
};
