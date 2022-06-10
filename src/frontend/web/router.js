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
			name: 'web.objects',
			uri: '/objects?dirname?keyword',
			onEnter() {
				document.title = `${_('Objects')} - ${webTitle}`;
			},
			resolve: {
				objects: ({dirname, keyword}) => api.object.getObjects({dirname, keyword}).then(response => response.data),
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-objects" */
				'./pages/object/objects'
			),
		},
		{
			name: 'web.objects.details',
			uri: '/{objectId:\\d+}',
			dismissalDelay: 300,
			onEnter({object}) {
				document.title = `${object.basename} - ${_('Objects')} - ${webTitle}`;
			},
			resolve: {
				object: ({objectId}) => api.object.getObject({objectId}).then(response => response.data),
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-object" */
				'./pages/object/object'
			),
		},
		{
			name: 'web.objects.uploader',
			uri: '/uploader',
			dismissalDelay: 300,
			onEnter() {
				document.title = `${_('Upload files')} - ${webTitle}`;
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-uploader" */
				'./pages/object/uploader'
			),
		},
		{
			name: 'not-found',
			uri: '.*',
			component: require('./pages/shared/not-found'),
		},
	],
});
