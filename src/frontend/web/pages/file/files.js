const classnames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');
const {Link, getRouter} = require('capybara-router');
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
			tagId: PropTypes.string,
		}).isRequired,
		tags: PropTypes.shape({
			items: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				title: PropTypes.string.isRequired,
			}).isRequired).isRequired,
		}),
		files: PropTypes.shape({
			items: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				type: PropTypes.oneOf(Object.values(FILE_TYPE)).isRequired,
				basename: PropTypes.string.isRequired,
				lastModified: utils.generateDatePropTypes({isRequired: true}),
				size: PropTypes.number,
			}).isRequired).isRequired,
		}),
	};

	constructor(props) {
		super(props);

		const folders = props.params.dirname?.split('/') || [];

		this.currentRoute = getRouter().findRouteByName('web.files');
		this.state = {
			keyword: props.params.keyword || '',
			fileTable: {...props.files, items: [null, ...props.files.items]},
			tagTable: {...props.tags},
			breadcrumb: {
				items: [
					{
						id: Math.random().toString(36),
						title: S3.BUCKET,
						urlParams: {
							tagId: props.params.tagId,
							dirname: null,
						},
					},
					...folders.map((folder, index) => ({
						id: Math.random().toString(36),
						title: folder,
						urlParams: {
							tagId: props.params.tagId,
							dirname: folders.slice(0, index + 1).join('/'),
						},
					})),
				],
			},
		};
	}

	/**
   * @param {string} paramKey - The parameter key.
   * @param {*} value
   *  Pass null to remove the parameter.
   *  Pass undefined to use `event.target.value`.
   * @returns {function(Event)} - (event) =>
   */
	generateChangeFilterHandler = (paramKey, value) => event => {
		event.preventDefault();
		getRouter().go({
			name: this.currentRoute.name,
			params: {
				...this.props.params,
				[paramKey]: value === undefined
					? event.target.value
					: value == null ? undefined : value,
			},
		});
	};

	onChangeKeyword = event => {
		this.setState({keyword: event.target.value});
	};

	loadNextPage = async () => {
		try {
			const {fileTable} = this.state;
			const response = await api.file.getFiles({
				...this.props.params,
				after: fileTable.items[fileTable.items.length - 1].id,
			});

			return new Promise(resolve => {
				this.setState(
					prevState => ({
						fileTable: {
							...response.data,
							items: [
								...prevState.fileTable.items,
								...response.data.items,
							],
						},
					}),
					resolve,
				);
			});
		} catch (error) {
			utils.renderError(error);
		}
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

	emptyFileRowComponent = (
		<div className="p-4 border-top text-muted text-center">{_('Empty')}</div>
	);

	renderFileRow = file => {
		const {params} = this.props;
		const generateLinkToParams = file => ({
			name: this.currentRoute.name,
			params: {...params, dirname: `${file.dirname}${file.basename}`},
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
		const {params} = this.props;
		const {breadcrumb, keyword, tagTable, fileTable} = this.state;

		return (
			<div className="container-fluid py-3">
				<div className="row">
					<div className="d-none d-md-block col-md-4 col-lg-3 col-xl-2">
						<div className="card">
							<div className="card-header d-flex justify-content-between">
								{_('Tags')}
								<button type="button" className="btn btn-sm btn-outline-secondary" style={{lineHeight: 0}}>
									{_('Modify')}
								</button>
							</div>
							<div className="list-group list-group-flush">
								{
									tagTable.items.length === 0 && (
										<div className="list-group-item text-muted text-center">{_('Empty')}</div>
									)
								}
								{
									tagTable.items.map(tag => (
										<Link
											key={tag.id}
											className={classnames(
												'list-group-item list-group-item-action text-truncate',
												{active: tag.id === Number(params.tagId)},
											)}
											to={{name: this.currentRoute.name, params: {...params, tagId: `${tag.id}`}}}
										>
											{tag.title}
										</Link>
									))
								}
							</div>
						</div>
					</div>

					<div className="col-12 col-md-8 col-lg-9 col-xl-10">
						<div className="breadcrumb-wrapper d-flex justify-content-between mb-3">
							<nav>
								<ol className="breadcrumb mb-0">
									{
										breadcrumb.items.map(item => (
											<li key={item.id} className="breadcrumb-item">
												<Link to={{name: this.currentRoute.name, params: item.urlParams}}>
													{item.title}
												</Link>
											</li>
										))
									}
								</ol>
							</nav>

							<form className="form-row align-items-center pr-3">
								<div className="col-auto my-1">
									<div className="input-group">
										<input
											type="text"
											className="form-control border-secondary"
											placeholder={_('Name')}
											autoFocus={Boolean(keyword)}
											value={keyword}
											onChange={this.onChangeKeyword}
										/>
										<div className="input-group-append">
											<button
												className="btn btn-outline-secondary"
												type="submit"
												onClick={this.generateChangeFilterHandler('keyword', keyword || null)}
											>
												{_('Search')}
											</button>
										</div>
									</div>
								</div>
							</form>
						</div>

						{
							fileTable.items.length === 1 && (
								<div className="files-wrapper border rounded">
									{this.filesHeaderComponent}
									{this.emptyFileRowComponent}
								</div>
							)
						}
						{
							fileTable.items.length > 1 && (
								<InfiniteScroll
									className="files-wrapper border rounded"
									pageStart={0}
									loadMore={this.loadNextPage}
									hasMore={fileTable.hasNextPage}
									loader={this.infiniteScrollLoadingComponent}
								>
									{
										fileTable.items.map((file, index) => index === 0
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
