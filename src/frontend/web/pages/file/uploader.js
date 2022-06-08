const {getRouter} = require('capybara-router');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const Base = require('../../../core/pages/base');
const _ = require('../../../languages');

module.exports = class UploaderPage extends Base {
	onHideModal = () => {
		getRouter().go({
			name: 'web.files',
			params: this.props.params,
		});
	};

	render() {
		const isShowModal = true;

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
