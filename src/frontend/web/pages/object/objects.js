const nprogress = require('nprogress');
const PropTypes = require('prop-types');
const React = require('react');
const {Link, RouterView, getRouter} = require('capybara-router');
const InfiniteScroll = require('@kelp404/react-infinite-scroller');
const {
	OBJECT_TYPE,
} = require('../../../../shared/constants');
const api = require('../../../core/apis/web');
const Loading = require('../../../core/components/loading');
const Base = require('../../../core/pages/base');
const utils = require('../../../core/utils');
const {
	STORE_KEYS: {DELETED_OBJECT_NOTIFICATION},
} = require('../../../core/constants');
const store = require('../../../core/store');
const _ = require('../../../languages');

const {S3} = window.config;

module.exports = class ObjectsPage extends Base {
	static propTypes = {
		params: PropTypes.shape({
			dirname: PropTypes.string,
			keyword: PropTypes.string,
		}).isRequired,
		objects: PropTypes.shape({
			items: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				type: PropTypes.oneOf(Object.values(OBJECT_TYPE)).isRequired,
				path: PropTypes.string.isRequired,
				dirname: PropTypes.string.isRequired,
				basename: PropTypes.string.isRequired,
				lastModified: utils.generateDatePropTypes({isRequired: false}),
				size: PropTypes.number,
			}).isRequired).isRequired,
		}),
	};

	constructor(props) {
		super(props);

		const folders = props.params.dirname?.split('/') || [];

		this.myRoute = getRouter().findRouteByName('web.objects');
		this.state = {
			keyword: props.params.keyword || '',
			checked: Object.fromEntries(props.objects.items.map(({id}) => [id, false])),
			objectTable: {...props.objects, items: [null, ...props.objects.items]},
			breadcrumb: {
				items: [
					{
						id: Math.random().toString(36),
						title: S3.BUCKET,
						urlParams: {
							dirname: null,
						},
					},
					...folders.map((folder, index) => ({
						id: Math.random().toString(36),
						title: folder,
						urlParams: {
							dirname: folders.slice(0, index + 1).join('/'),
						},
					})),
				],
			},
		};
	}

	componentDidMount() {
		super.componentDidMount();
		this.$listens.push(
			store.subscribe(DELETED_OBJECT_NOTIFICATION, (event, {objectId}) => {
				this.setState(prevState => {
					const items = [...prevState.objectTable.items];
					const index = items.findIndex(item => item?.id === objectId);

					if (index < 0) {
						return;
					}

					const nextChecked = {...prevState.checked};

					delete nextChecked[objectId];
					items.splice(index, 1);
					return {
						checked: nextChecked,
						objectTable: {
							...prevState.objectTable,
							items,
						},
					};
				});
			}),
		);
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
			name: this.myRoute.name,
			params: {
				...this.props.params,
				[paramKey]: value === undefined
					? event.target.value
					: value == null ? undefined : value,
			},
		});
	};

	hasAnyChecked = () => {
		const {checked} = this.state;

		for (const key in checked) {
			if (checked[key]) {
				return true;
			}
		}

		return false;
	};

	onChangeKeyword = event => {
		this.setState({keyword: event.target.value});
	};

	onChangeCheckAll = event => {
		const {objectTable} = this.state;

		this.setState({
			checked: Object.fromEntries(
				objectTable.items.slice(1).map(object => [object.id, Boolean(event.target.checked)]),
			),
		});
	};

	onChangeCheckObject = event => {
		const {objectId} = event.target.dataset;

		this.setState(prevState => ({
			checked: {
				...prevState.checked,
				[objectId]: !prevState.checked[objectId],
			},
		}));
	};

	onDownloadFiles = () => {
		const {checked} = this.state;
		const objectIds = Object.entries(checked)
			.filter(([_, value]) => value)
			.map(([key]) => key);
		const queryString = new URLSearchParams({
			ids: objectIds,
		});

		window.open(`/api/files?${queryString}`, '_blank');
	};

	onDeleteObjects = async () => {
		try {
			const {checked} = this.state;
			const objectIds = Object.entries(checked)
				.filter(([_, value]) => value)
				.map(([key]) => Number(key));

			nprogress.start();
			await api.object.deleteObjects({objectIds});
			this.setState(prevState => {
				const nextChecked = {...prevState.checked};
				const nextObjectTableItems = [
					...prevState.objectTable.items.slice(0, 1),
					...prevState.objectTable.items.slice(1).filter(object => !objectIds.includes(object.id)),
				];

				for (const objectId of objectIds) {
					delete nextChecked[objectId];
				}

				return {
					checked: {
						...nextChecked,
					},
					objectTable: {
						...prevState.objectTable,
						items: nextObjectTableItems,
					},
				};
			});
		} catch (error) {
			utils.renderError(error);
		} finally {
			nprogress.done();
		}
	};

	onShowUploader = () => {
		getRouter().go({
			name: 'web.objects.uploader',
			params: this.props.params,
		});
	};

	onLoadNextPage = async () => {
		try {
			const {objectTable} = this.state;
			const response = await api.object.getObjects({
				...this.props.params,
				after: objectTable.items[objectTable.items.length - 1].id,
			});

			return new Promise(resolve => {
				this.setState(
					prevState => ({
						checked: {
							...prevState.checked,
							...Object.fromEntries(response.data.items.map(object => [object.id, false])),
						},
						objectTable: {
							...response.data,
							items: [
								...prevState.objectTable.items,
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

	objectsHeaderComponent = (
		<div key={0} className="d-flex align-items-end px-1">
			<div className="py-2 px-1">
				<div className="form-check">
					<input className="form-check-input" type="checkbox" onChange={this.onChangeCheckAll}/>
				</div>
			</div>
			<div className="flex-grow-1 py-2 px-1 text-truncate">
				<strong>{_('Name')}</strong>
			</div>
			<div className="py-2 px-1 text-truncate" style={{minWidth: '270px'}}>
				<strong>{_('Last modified')}</strong>
			</div>
			<div className="py-2 px-1" style={{minWidth: '86px'}}>
				<strong>{_('Size')}</strong>
			</div>
		</div>
	);

	emptyObjectRowComponent = (
		<div className="p-4 border-top text-muted text-center">{_('Empty')}</div>
	);

	renderObjectRow = object => {
		const {params} = this.props;
		const {checked} = this.state;
		const generateFolderLinkToParams = object => ({
			name: this.myRoute.name,
			params: {
				dirname: object.dirname ? `${object.dirname}/${object.basename}` : object.basename,
				keyword: null,
			},
		});
		const generateFileLinkToParams = object => ({
			name: 'web.objects.details',
			params: {...params, objectId: object.id},
		});
		let name = params.dirname
			? object.path.replace(`${params.dirname}/`, '')
			: object.path;

		if (object.type === OBJECT_TYPE.FOLDER) {
			// Remove "/" at suffix.
			name = name.slice(0, -1);
		}

		return (
			<div key={object.id} className="object-row d-flex align-items-end border-top px-1">
				<div className="py-2 px-1">
					<div className="form-check">
						<input
							data-object-id={object.id}
							className="form-check-input"
							type="checkbox"
							checked={checked[object.id]}
							onChange={this.onChangeCheckObject}
						/>
					</div>
				</div>
				<div className="py-2 px-1 text-muted">
					{
						object.type === OBJECT_TYPE.FILE
							? <i className="fa-fw fa-regular fa-file-lines"/>
							: <i className="fa-fw fa-regular fa-folder"/>
					}
				</div>
				<div className="flex-grow-1 py-2 px-1 text-truncate">
					{
						object.type === OBJECT_TYPE.FILE
							? <Link to={generateFileLinkToParams(object)}>{name}</Link>
							: <Link to={generateFolderLinkToParams(object)}>{name}</Link>
					}
				</div>
				<pre className="py-2 px-1 m-0 text-truncate" style={{minWidth: '270px'}}>
					{object.type === OBJECT_TYPE.FILE ? utils.formatDate(object.lastModified) : '-'}
				</pre>
				<pre className="py-2 px-1 m-0 text-end" style={{minWidth: '86px'}}>
					{object.type === OBJECT_TYPE.FILE ? utils.formatSize(object.size) : '-'}
				</pre>
			</div>
		);
	};

	render() {
		const {breadcrumb, keyword, objectTable, $isApiProcessing} = this.state;
		const hasAnyChecked = this.hasAnyChecked();

		return (
			<div className="container-fluid py-3">
				<div className="row">
					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between mb-3">
							{/* Breadcrumb */}
							<nav>
								<ol className="breadcrumb mb-0">
									{
										breadcrumb.items.map(item => (
											<li key={item.id} className="breadcrumb-item">
												<Link to={{name: this.myRoute.name, params: item.urlParams}}>
													{item.title}
												</Link>
											</li>
										))
									}
								</ol>
							</nav>

							{/* Search form */}
							<form className="form-row align-items-center">
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
										<button
											className="btn btn-outline-secondary"
											type="submit"
											onClick={this.generateChangeFilterHandler('keyword', keyword || null)}
										>
											{_('Search')}
										</button>
									</div>
								</div>
							</form>
						</div>

						<div className="card">
							<div className="card-header px-2 d-flex justify-content-between">
								<div>
									<button
										type="button" className="btn btn-sm btn-outline-danger"
										style={{lineHeight: 'initial'}}
										disabled={$isApiProcessing || !hasAnyChecked}
										onClick={this.onDeleteObjects}
									>
										{_('Delete')}
									</button>
									<button
										type="button" className="btn btn-sm btn-outline-primary ms-2"
										style={{lineHeight: 'initial'}}
										disabled={$isApiProcessing || !hasAnyChecked}
										onClick={this.onDownloadFiles}
									>
										{_('Download')}
									</button>
								</div>
								<div>
									<button
										type="button" className="btn btn-sm btn-outline-success ms-2"
										style={{lineHeight: 'initial'}}
										disabled={$isApiProcessing}
										onClick={this.onShowUploader}
									>
										{_('Upload')}
									</button>
								</div>
							</div>

							{
								objectTable.items.length === 1 && (
									<div className="objects-wrapper">
										{this.objectsHeaderComponent}
										{this.emptyObjectRowComponent}
									</div>
								)
							}
							{
								objectTable.items.length > 1 && (
									<InfiniteScroll
										className="objects-wrapper"
										pageStart={0}
										loadMore={this.onLoadNextPage}
										hasMore={objectTable.hasNextPage}
										loader={this.infiniteScrollLoadingComponent}
									>
										{this.objectsHeaderComponent}
										{objectTable.items.slice(1).map(object => this.renderObjectRow(object))}
									</InfiniteScroll>
								)
							}
						</div>
					</div>
				</div>
				<RouterView/>
			</div>
		);
	}
};
