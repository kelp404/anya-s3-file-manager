const {RouterView} = require('capybara-router');
const React = require('react');
const Loading = require('../../../core/components/loading');
const Base = require('../../../core/pages/base');
const Footer = require('../../components/footer');
const Navigation = require('../../components/navigation');

module.exports = class Layout extends Base {
	render() {
		return (
			<>
				<Navigation/>
				<div className="main-content">
					<RouterView><Loading/></RouterView>
				</div>
				<Footer/>
			</>
		);
	}
};
