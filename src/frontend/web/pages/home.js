const React = require('react');
const {getRouter} = require('capybara-router');
const Loading = require('../../core/components/loading');

module.exports = class Home extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	componentDidMount() {
		getRouter().go({name: 'web.objects'});
	}

	render() {
		return (
			<div className="main-content py-5">
				<Loading/>
			</div>
		);
	}
};
