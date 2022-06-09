const classnames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');

module.exports = class SuccessCheckmark extends React.Component {
	static propTypes = {
		className: PropTypes.any,
	};

	static defaultProps = {
		className: null,
	};

	shouldComponentUpdate() {
		return false;
	}

	render() {
		const {className} = this.props;

		return (
			<div className={classnames('success-checkmark', className)}>
				<div className="check-icon">
					<span className="icon-line line-tip"/>
					<span className="icon-line line-long"/>
					<div className="icon-circle"/>
					<div className="icon-fix"/>
				</div>
			</div>
		);
	}
};
