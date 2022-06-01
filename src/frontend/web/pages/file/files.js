const PropTypes = require('prop-types');
const React = require('react');
const {Link} = require('capybara-router');
const InfiniteScroll = require('@kelp404/react-infinite-scroller');
const {
	FILE_TYPE,
} = require('../../../../shared/constants');
const api = require('../../../core/apis/web');
const Loading = require('../../../core/components/loading');
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
			files: {...props.files, items: [null, ...props.files.items]},
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

	loadNextPage = async () => {
		const response = await api.file.getFiles({
			...this.props.params,
			after: this.state.files.items[this.state.files.items.length - 1].id,
		});

		return new Promise(resolve => {
			this.setState(
				prevState => ({
					files: {
						...response.data,
						items: [
							...prevState.files.items,
							...response.data.items,
						],
					},
				}),
				resolve,
			);
		});
	};

	infiniteScrollLoadingComponent = (
		<div key="loading" className="border-top"><Loading/></div>
	);

	filesHeaderComponent = (
		<div key={0} className="d-flex align-items-end">
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
	);

	renderFileRow = file => {
		const generateLinkToParams = file => ({
			name: 'web.files',
			params: {dirname: `${file.dirname}${file.basename}`},
		});

		return (
			<div key={file.id} className="file-row d-flex align-items-end border-top">
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
		);
	};

	render() {
		const {breadcrumb, files} = this.state;

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
						{
							files.items.length > 0 && (
								<InfiniteScroll
									className="border rounded"
									pageStart={0}
									loadMore={this.loadNextPage}
									hasMore={files.hasNextPage}
									loader={this.infiniteScrollLoadingComponent}
								>
									{
										files.items.map((file, index) => index === 0
											? this.filesHeaderComponent
											: this.renderFileRow(file),
										)
									}
								</InfiniteScroll>
							)
						}
					</div>
				</div>
			</div>
		);
	}
};
