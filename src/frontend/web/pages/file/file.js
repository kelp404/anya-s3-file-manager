const {getRouter} = require('capybara-router');
const PropTypes = require('prop-types');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const Base = require('../../../core/pages/base');
const utils = require('../../../core/utils');
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

	onHideModal = () => {
		getRouter().go({
			name: 'web.files',
			params: this.props.params,
		});
	};

	render() {
		const {file} = this.props;
		const {isShowModal} = this.state;

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
					<button type="button" className="btn btn-outline-secondary" onClick={this.onHideModal}>
						{_('Close')}
					</button>
					<button type="button" className="btn btn-outline-primary">
						{_('Download')}
					</button>
				</Modal.Footer>
			</Modal>
		);
	}
};
