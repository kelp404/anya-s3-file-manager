const {Router} = require('capybara-router');
const history = require('history');
const _ = require('../languages');
const api = require('../core/apis/web');
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
			component: require('./pages/home'),
		},
		{
			name: 'web.files',
			uri: '/files?dirname',
			onEnter() {
				document.title = `${_('Files')} - ${webTitle}`;
			},
			resolve: {
				files: ({dirname}) => api.file.getFiles({dirname}).then(response => response.data),
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-files" */
				'./pages/file/files'
			),
		},
		{
			name: 'not-found',
			uri: '.*',
			component: require('./pages/shared/not-found'),
		},
	],
});
