const {Router} = require('capybara-router');
const history = require('history');
const _ = require('../languages');
const {WEB_TITLE} = require('../core/constants');

const webTitle = _(WEB_TITLE);

module.exports = new Router({
	history: history.createBrowserHistory(),
	errorComponent: require('./pages/shared/error-page'),
	routes: [
		{
			isAbstract: true,
			name: 'web',
			uri: '',
			component: require('./pages/shared/layout'),
		},
		{
			name: 'web.home',
			uri: '/',
			onEnter() {
				document.title = webTitle;
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-home" */
				'./pages/home'
			),
		},
		{
			name: 'not-found',
			uri: '.*',
			component: require('./pages/shared/not-found'),
		},
	],
});
