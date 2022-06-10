const {getRouter} = require('capybara-router');
const classnames = require('classnames');
const nprogress = require('nprogress');
const pLimit = require('p-limit');
const PropTypes = require('prop-types');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const utils = require('../../../core/utils');
const SuccessCheckmark = require('../../../core/components/success-checkmark');
const api = require('../../../core/apis/web');
const Base = require('../../../core/pages/base');
const _ = require('../../../languages');

module.exports = class UploaderPage extends Base {
	static propTypes = {
		params: PropTypes.shape({
			dirname: PropTypes.string,
		}),
	};

	constructor(props) {
		super(props);
		this.myRoute = getRouter().findRouteByName('web.objects.uploader');
		this.files = [];
		this.state.files = [];
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

	onHideModal = () => {
		getRouter().go({
			name: 'web.objects',
			params: this.props.params,
		});
	};

	onAddFiles = event => {
		const prevFilesLength = this.files.length;

		this.files.push(...event.target.files);
		this.files.slice(prevFilesLength).forEach(file => {
			file.id = file.id || Math.random().toString(36);
		});
		this.setState({
			files: this.files.map(({name, size, id}) => ({name, size, id})),
		});
	};

	onDeleteFile = event => {
		const {fileId} = event.target.dataset;

		this.setState(prevState => {
			const index = prevState.files.findIndex(file => file.id === fileId);

			if (index < 0) {
				return null;
			}

			this.files.splice(index, 1);
			return {
				files: [
					...prevState.files.slice(0, index),
					...prevState.files.slice(index + 1),
				],
			};
		});
	};

	onUploadFiles = async () => {
		try {
			const {params} = this.props;
			const limit = pLimit(3);

			nprogress.start();
			await Promise.all(this.files.map(file => limit(async () => {
				await api.file.uploadFile({file, dirname: params.dirname});

				this.setState(prevState => {
					const index = prevState.files.findIndex(({id}) => file.id === id);

					if (index < 0) {
						return null;
					}

					return {
						files: [
							...prevState.files.slice(0, index),
							{
								...prevState.files[index],
								isDone: true,
							},
							...prevState.files.slice(index + 1),
						],
					};
				});
			})));
			getRouter().go(
				{name: 'web.objects', params},
				{reload: true},
			);
		} catch (error) {
			nprogress.done();
			utils.renderError(error);
		}
	};

	emptyFileRowComponent = (
		<li className="list-group-item text-muted text-center py-4">{_('Please add files to upload.')}</li>
	);

	render() {
		const {params} = this.props;
		const {$isApiProcessing, isShowModal, files} = this.state;

		return (
			<Modal
				scrollable
				show={isShowModal}
				backdrop="static"
				size="xl"
				onHide={this.onHideModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>{_('Upload files')}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<h5>{_('Upload files to /{0}.', [params.dirname || ''])}</h5>
					<div className="card">
						<div className="card-header d-flex justify-content-between">
							<div>{_('Files')}</div>
							<label
								className={classnames(
									'btn btn-sm btn-outline-success',
									{disabled: $isApiProcessing},
								)}
								style={{lineHeight: 'initial'}}
							>
								<input multiple type="file" className="d-none" onChange={this.onAddFiles}/>
								<span>{_('Add')}</span>
							</label>
						</div>
						<ul className="list-group list-group-flush">
							{files.length === 0 && this.emptyFileRowComponent}
							{
								files.map(file => (
									<li key={file.id} className="list-group-item d-flex justify-content-between">
										<div className="d-flex align-items-center">
											<span>{file.name}</span>
											<span className="ms-2">
												<small className="text-muted">{utils.formatSize(file.size)}</small>
											</span>
											{file.isDone && <span><SuccessCheckmark className="small"/></span>}
										</div>
										<button
											disabled={$isApiProcessing || file.isDone}
											data-file-id={file.id}
											type="button"
											className="btn btn-sm btn-outline-danger"
											style={{lineHeight: 'initial'}}
											onClick={this.onDeleteFile}
										>
											{_('Delete')}
										</button>
									</li>
								))
							}
						</ul>
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
						disabled={$isApiProcessing || !files.length}
						type="button" className="btn btn-outline-primary"
						onClick={this.onUploadFiles}
					>
						{_('Submit')}
					</button>
				</Modal.Footer>
			</Modal>
		);
	}
};
