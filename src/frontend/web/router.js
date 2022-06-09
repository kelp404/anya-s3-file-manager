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
			uri: '/files?dirname?keyword?tagId',
			onEnter() {
				document.title = `${_('Files')} - ${webTitle}`;
			},
			resolve: {
				files: ({dirname, keyword}) => api.file.getFiles({dirname, keyword}).then(response => response.data),
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-files" */
				'./pages/file/files'
			),
		},
		{
			name: 'web.files.details',
			uri: '/{fileId:\\d+}',
			dismissalDelay: 300,
			onEnter({file}) {
				document.title = `${file.basename} - ${_('Files')} - ${webTitle}`;
			},
			resolve: {
				file: ({fileId}) => api.file.getFileInformation({fileId}).then(response => response.data),
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-file" */
				'./pages/file/file'
			),
		},
		{
			name: 'web.files.uploader',
			uri: '/uploader',
			dismissalDelay: 300,
			onEnter() {
				document.title = `${_('Upload')} - ${webTitle}`;
			},
			loadComponent: () => import(
				/* webpackChunkName: "web-uploader" */
				'./pages/file/uploader'
			),
		},
		{
			name: 'not-found',
			uri: '.*',
			component: require('./pages/shared/not-found'),
		},
	],
});
