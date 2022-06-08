const {getRouter} = require('capybara-router');
const nprogress = require('nprogress');
const PropTypes = require('prop-types');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const Base = require('../../../core/pages/base');
const api = require('../../../core/apis/web');
const utils = require('../../../core/utils');
const {
	STORE_KEYS: {DELETED_FILE_NOTIFICATION},
} = require('../../../core/constants');
const store = require('../../../core/store');
const _ = require('../../../languages');

module.exports = class FilePage extends Base {
	static propTypes = {
		file: PropTypes.shape({
			id: PropTypes.number.isRequired,
			path: PropTypes.string.isRequired,
			basename: PropTypes.string.isRequired,
			size: PropTypes.number.isRequired,
			objectHeaders: PropTypes.object.isRequired,
		}).isRequired,
	};

	constructor(props) {
		super(props);
		this.myRoute = getRouter().findRouteByName('web.files.details');
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

	onDeleteFile = async () => {
		try {
			const {id: fileId} = this.props.file;

			nprogress.start();
			await api.file.deleteFiles({fileIds: [fileId]});
			store.broadcast(DELETED_FILE_NOTIFICATION, {fileId});
			getRouter().go({
				name: 'web.files',
				params: this.props.params,
			});
		} catch (error) {
			nprogress.done();
			utils.renderError(error);
		}
	};

	onDownloadFile = () => {
		window.open(`/api/files/${this.props.file.id}`, '_blank');
	};

	onHideModal = () => {
		getRouter().go({
			name: 'web.files',
			params: this.props.params,
		});
	};

	renderPreview = file => {
		const contentType = file.objectHeaders.ContentType;

		if (/^image\//.test(contentType)) {
			return (
				<div className="col-12">
					<img src={`/api/files/${file.id}`} className="rounded mx-auto d-block" style={{maxHeight: '300px'}}/>
				</div>
			);
		}
	};

	render() {
		const {file} = this.props;
		const {$isApiProcessing, isShowModal} = this.state;

		return (
			<Modal
				scrollable
				show={isShowModal}
				size="xl"
				onHide={this.onHideModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>{file.basename}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<div className="row">
						{this.renderPreview(file)}
						<div className="col-12 mb-2">
							<strong className="d-block text-secondary mb-0">{_('Path')}</strong>
							<span>{file.path}</span>
						</div>
						<div className="col-12 col-md-6 mb-2">
							<strong className="d-block text-secondary mb-0">{_('Last modified')}</strong>
							<span>{utils.formatDate(file.lastModified)}</span>
						</div>
						<div className="col-12 col-md-6 mb-2">
							<strong className="d-block text-secondary mb-0">{_('Size')}</strong>
							<span>{utils.formatSize(file.size)}</span>
						</div>
						<div className="col-12">
							<strong className="d-block text-secondary mb-0">{_('Object headers')}</strong>
							<pre>
								<code>{JSON.stringify(file.objectHeaders, null, 4)}</code>
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
						onClick={this.onDeleteFile}
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
