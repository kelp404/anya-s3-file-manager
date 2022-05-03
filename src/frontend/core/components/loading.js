const classNames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');

module.exports = class Loading extends React.Component {
	static propTypes = {
		className: PropTypes.string,
	};

	static defaultProps = {
		className: null,
	};

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div className={classNames('text-center text-muted py-5', this.props.className)}>
				<div className="spinner-border">
					<span className="sr-only">Loading...</span>
				</div>
			</div>
		);
	}
};
