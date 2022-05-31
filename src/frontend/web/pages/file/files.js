const PropTypes = require('prop-types');
const React = require('react');
const {Link} = require('capybara-router');
const {
	FILE_TYPE,
} = require('../../../../shared/constants');
const Base = require('../../../core/pages/base');
const utils = require('../../../core/utils');
const _ = require('../../../languages');

const {S3} = window.config;

module.exports = class FilesPage extends Base {
	static propTypes = {
		params: PropTypes.shape({
			dirname: PropTypes.string,
		}).isRequired,
		files: PropTypes.shape({
			items: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				type: PropTypes.oneOf(Object.values(FILE_TYPE)).isRequired,
				basename: PropTypes.string.isRequired,
				lastModified: utils.generateDatePropTypes({isRequired: true}),
				size: PropTypes.number,
			})).isRequired,
		}),
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
		const {files} = this.props;
		const {breadcrumb} = this.state;
		const generateLinkToParams = file => ({
			name: 'web.files',
			params: {dirname: `${file.dirname}${file.basename}`},
		});

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

				<div className="row files-wrapper">
					<div className="col-12">
						<div className="border rounded">
							<div className="d-flex align-items-end bg-light">
								<div className="flex-grow-1 p-2 text-truncate">
									<strong>{_('Name')}</strong>
								</div>
								<div className="p-2 text-truncate" style={{minWidth: '270px'}}>
									<strong>{_('Last modified')}</strong>
								</div>
								<div className="p-2" style={{minWidth: '86px'}}>
									<strong>{_('Size')}</strong>
								</div>
							</div>
							{
								files.items.map(file => (
									<div key={file.id} className="d-flex align-items-end border-top">
										<div className="pr-0 py-2 pl-2 text-muted">
											{
												file.type === FILE_TYPE.FILE
													? <i className="fa-fw fa-regular fa-file-lines"/>
													: <i className="fa-fw fa-regular fa-folder"/>
											}
										</div>
										<div className="flex-grow-1 p-2 text-truncate">
											{
												file.type === FILE_TYPE.FILE
													? file.basename
													: <Link to={generateLinkToParams(file)}>{file.basename}</Link>
											}
										</div>
										<pre className="p-2 m-0 text-truncate" style={{minWidth: '270px'}}>
											{file.type === FILE_TYPE.FILE ? utils.formatDate(file.lastModified) : '-'}
										</pre>
										<pre className="p-2 m-0 text-right" style={{minWidth: '86px'}}>
											{file.type === FILE_TYPE.FILE ? utils.formatSize(file.size) : '-'}
										</pre>
									</div>
								))
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
};
