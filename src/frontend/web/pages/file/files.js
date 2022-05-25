const PropTypes = require('prop-types');
const React = require('react');
const {Link} = require('capybara-router');
const Base = require('../../../core/pages/base');

const {S3} = window.config;

module.exports = class FilesPage extends Base {
	static propTypes = {
		params: PropTypes.shape({
			dirname: PropTypes.string,
		}).isRequired,
	};

	constructor(props) {
		super(props);

		const folders = props.params.dirname?.split('/') || [];

		this.state = {
			breadcrumb: {
				items: [
					{
						id: Math.random().toString(36),
						title: S3.BUCKET,
						urlParams: {dirname: null},
					},
					...folders.map((folder, index) => ({
						id: Math.random().toString(36),
						title: folder,
						urlParams: {dirname: folders.slice(0, index + 1).join('/')},
					})),
				],
			},
		};
	}

	render() {
		const {breadcrumb} = this.state;

		return (
			<div className="container-fluid py-3">
				<div className="row">
					<div className="col-12">
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb">
								{
									breadcrumb.items.map(item => (
										<li key={item.id} className="breadcrumb-item">
											<Link to={{name: 'web.files', params: item.urlParams}}>
												{item.title}
											</Link>
										</li>
									))
								}
							</ol>
						</nav>
					</div>
				</div>
			</div>
		);
	}
};
