// Stylesheets
require('../stylesheets/web.scss');

const React = require('react');
const ReactDOM = require('react-dom');
const {RouterView} = require('capybara-router');
const Loading = require('../core/components/loading');
const router = require('./router');

// Todo: debug code
router.listen('ChangeStart', (action, toState, fromState, next) => {
	console.log({toState, fromState});
	next();
});

ReactDOM.render(
	<RouterView><Loading/></RouterView>,
	document.getElementById('root'),
);
