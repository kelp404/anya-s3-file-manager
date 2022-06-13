const {getRouter} = require('capybara-router');
const nprogress = require('nprogress');
const PropTypes = require('prop-types');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const {
	STORAGE_CLASS,
} = require('../../../../shared/constants');
const Base = require('../../../core/pages/base');
const api = require('../../../core/apis/web');
const utils = require('../../../core/utils');
const {
	STORE_KEYS: {DELETED_OBJECT_NOTIFICATION},
} = require('../../../core/constants');
const store = require('../../../core/store');
const _ = require('../../../languages');

module.exports = class ObjectPage extends Base {
	static propTypes = {
		params: PropTypes.object.isRequired,
		object: PropTypes.shape({
			id: PropTypes.number.isRequired,
			path: PropTypes.string.isRequired,
			basename: PropTypes.string.isRequired,
			lastModified: utils.generateDatePropTypes({isRequired: false}),
			size: PropTypes.number,
			storageClass: PropTypes.oneOf(Object.keys(STORAGE_CLASS)),
			objectHeaders: PropTypes.object.isRequired,
		}).isRequired,
	};

	constructor(props) {
		super(props);
		this.myRoute = getRouter().findRouteByName('web.objects.details');
		this.state.isShowModal = true;
	}

	componentDidMount() {
		super.componentDidMount();
		this.$listens.push(
			getRouter().listen('ChangeStart', (action, toState, fromState, next) => {
				const isShowModal = toState.name === this.myRoute.name;

				this.setState({isShowModal});
				next();
			}),
		);
	}

	onDeleteObject = async () => {
		try {
			const {id} = this.props.object;

			nprogress.start();
			await api.object.deleteObjects({objectIds: [id]});
			store.broadcast(DELETED_OBJECT_NOTIFICATION, {objectId: id});
			getRouter().go({
				name: 'web.objects',
				params: this.props.params,
			});
		} catch (error) {
			nprogress.done();
			utils.renderError(error);
		}
	};

	onDownloadFile = () => {
		window.open(`/api/files?ids=${this.props.object.id}`, '_blank');
	};

	onHideModal = () => {
		getRouter().go({
			name: 'web.objects',
			params: this.props.params,
		});
	};

	renderPreview = object => {
		const contentType = object.objectHeaders.ContentType;

		if (/^image\//.test(contentType)) {
			return (
				<div className="col-12">
					<img
						className="rounded mw-100 mx-auto d-block"
						src={`/api/files?ids=${object.id}`}
						style={{maxHeight: '300px'}}
					/>
				</div>
			);
		}

		if (/^video\//.test(contentType)) {
			return (
				<div className="col-12">
					<video controls className="mw-100 d-block mx-auto" style={{maxHeight: '300px'}}>
						<source src={`/api/files?ids=${object.id}`} type={contentType}/>
					</video>
				</div>
			);
		}
	};

	render() {
		const {object} = this.props;
		const {$isApiProcessing, isShowModal} = this.state;

		return (
			<Modal
				scrollable
				show={isShowModal}
				size="xl"
				onHide={this.onHideModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>{object.basename}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<div className="row">
						{this.renderPreview(object)}
						<div className="col-12 mb-2">
							<strong className="d-block text-secondary mb-0">{_('Path')}</strong>
							<span>{object.path}</span>
						</div>
						{
							object.lastModified && (
								<div className="col-12 col-md-6 mb-2">
									<strong className="d-block text-secondary mb-0">{_('Last modified')}</strong>
									<span>{utils.formatDate(object.lastModified)}</span>
								</div>
							)
						}
						{
							object.size != null && (
								<div className="col-12 col-md-6 mb-2">
									<strong className="d-block text-secondary mb-0">{_('Size')}</strong>
									<span>{utils.formatSize(object.size)}</span>
								</div>
							)
						}
						{
							object.storageClass && (
								<div className="col-12 col-md-6 mb-2">
									<strong className="d-block text-secondary mb-0">{_('Storage class')}</strong>
									<span>{object.storageClass}</span>
								</div>
							)
						}
						<div className="col-12">
							<strong className="d-block text-secondary mb-0">{_('Object headers')}</strong>
							<pre>
								<code>{JSON.stringify(object.objectHeaders, null, 4)}</code>
							</pre>
						</div>
					</div>
				</Modal.Body>

				<Modal.Footer>
					<button
						type="button" className="btn btn-outline-secondary"
						onClick={this.onHideModal}
					>
						{_('Close')}
					</button>
					<button
						disabled={$isApiProcessing}
						type="button" className="btn btn-outline-danger"
						onClick={this.onDeleteObject}
					>
						{_('Delete')}
					</button>
					<button
						autoFocus
						type="button" className="btn btn-outline-primary"
						onClick={this.onDownloadFile}
					>
						{_('Download')}
					</button>
				</Modal.Footer>
			</Modal>
		);
	}
};
