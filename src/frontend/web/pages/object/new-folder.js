const classnames = require('classnames');
const {getRouter} = require('capybara-router');
const {Formik, Form, Field} = require('formik');
const nprogress = require('nprogress');
const PropTypes = require('prop-types');
const React = require('react');
const Modal = require('react-bootstrap/Modal').default;
const {
	FRONTEND_OPERATION_CODE: {
		SHOW_OBJECT_DUPLICATED_ALERT,
	},
} = require('../../../../shared/constants');
const {
	createFolderFormSchema,
} = require('../../../../shared/validation/form-schemas/object');
const {
	validateCreateFolderForm,
} = require('../../../core/validators/object-validator');
const Base = require('../../../core/pages/base');
const api = require('../../../core/apis/web');
const utils = require('../../../core/utils');
const _ = require('../../../languages');

module.exports = class ObjectPage extends Base {
	static propTypes = {
		params: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.myRoute = getRouter().findRouteByName('web.objects.new-folder');
		this.validators = {
			validateCreateFolderForm: utils.makeFormikValidator(validateCreateFolderForm),
		};
		this.state.isShowModal = true;
		this.state.pathDuplicatedAlertMessage = null;
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

	generateCreateFolderInitialValues = () => ({
		dirname: this.props.params.dirname || '',
		basename: '',
	});

	onSubmitCreateFolderForm = async values => {
		try {
			nprogress.start();
			this.setState({pathDuplicatedAlertMessage: null});
			await api.object.createFolder(values);
			getRouter().go(
				{
					name: 'web.objects',
					params: this.props.params,
				},
				{reload: true},
			);
		} catch (error) {
			nprogress.done();

			if (error.response?.data?.extra?.frontendOperationCode === SHOW_OBJECT_DUPLICATED_ALERT) {
				this.setState({
					pathDuplicatedAlertMessage: _(
						'The path "{0}" is already exists.',
						[error.response?.data?.extra?.frontendOperationValue],
					),
				});

				return;
			}

			utils.renderError(error);
		}
	};

	onHideModal = () => {
		getRouter().go({
			name: 'web.objects',
			params: this.props.params,
		});
	};

	renderCreateFolderForm = ({errors, submitCount, initialValues}) => {
		const {$isApiProcessing, pathDuplicatedAlertMessage} = this.state;
		const isSubmitted = submitCount > 0;

		return (
			<Form>
				<Modal.Header closeButton>
					<Modal.Title>{_('New folder')}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<div className="mb-3">
						<label htmlFor="input-basename" className="col-form-label">{_('Path')}</label>
						<div
							className={classnames(
								'input-group mb-3',
								{'has-validation': (errors.basename && isSubmitted) || pathDuplicatedAlertMessage},
							)}
						>
							{initialValues.dirname && <span className="input-group-text">{initialValues.dirname}/</span>}
							<Field
								autoFocus
								type="text" id="input-basename" name="basename"
								placeholder="Folder name"
								className={classnames(
									'form-control',
									{'is-invalid': (errors.basename && isSubmitted) || pathDuplicatedAlertMessage},
								)}
								maxLength={createFolderFormSchema.basename.max}/>
							{
								((errors.basename && isSubmitted) || pathDuplicatedAlertMessage) && (
									<div className="invalid-feedback">
										{errors.basename && isSubmitted && <div>{errors.basename}</div>}
										{pathDuplicatedAlertMessage && <div>{pathDuplicatedAlertMessage}</div>}
									</div>
								)
							}
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
						type="submit" className="btn btn-outline-primary"
					>
						{_('Submit')}
					</button>
				</Modal.Footer>
			</Form>
		);
	};

	render() {
		const {validateCreateFolderForm} = this.validators;
		const {isShowModal} = this.state;

		return (
			<Modal
				scrollable
				size="lg"
				show={isShowModal}
				onHide={this.onHideModal}
			>
				<Formik
					initialValues={this.generateCreateFolderInitialValues()}
					validate={validateCreateFolderForm}
					onSubmit={this.onSubmitCreateFolderForm}
				>
					{this.renderCreateFolderForm}
				</Formik>
			</Modal>
		);
	}
};
