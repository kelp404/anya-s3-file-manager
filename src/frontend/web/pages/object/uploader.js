const {getRouter} = require('capybara-router');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const Base = require('../../../core/pages/base');
const _ = require('../../../languages');

module.exports = class UploaderPage extends Base {
	constructor(props) {
		super(props);
		this.myRoute = getRouter().findRouteByName('web.objects.uploader');
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

	render() {
		const {isShowModal} = this.state;

		return (
			<Modal
				scrollable
				show={isShowModal}
				size="xl"
				onHide={this.onHideModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>{_('Upload')}</Modal.Title>
				</Modal.Header>
			</Modal>
		);
	}
};
