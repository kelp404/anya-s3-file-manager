// Stylesheets
require('../stylesheets/web.scss');

require('@babel/polyfill');
const nprogress = require('nprogress');
const dayjs = require('dayjs');
const LocalizedFormat = require('dayjs/plugin/localizedFormat');
const React = require('react');
const {createRoot} = require('react-dom/client');
const {RouterView} = require('capybara-router');
const {PUSH, REPLACE, RELOAD} = require('capybara-router/lib/constants/history-actions');
const utils = require('../core/utils');
const Loading = require('../core/components/loading');
const {cancelAllFrontRequests} = require('../core/apis');
const router = require('./router');

dayjs.extend(LocalizedFormat);
nprogress.configure({showSpinner: false});

router.listen('ChangeStart', (action, toState, fromState, next) => {
	nprogress.start();
	cancelAllFrontRequests();
	if (window.error) {
		// Backend need we render the error page.
		setTimeout(() => {
			nprogress.done();
			utils.renderError(window.error);
		});
		return;
	}

	next();
});
router.listen('ChangeSuccess', (action, toState, fromState) => {
	nprogress.done();

	// Scroll to top.
	if ([PUSH, REPLACE].includes(action)) {
		const modalPages = [
			'web.objects.details',
			'web.objects.uploader',
			'web.objects.new-folder',
		];

		if (modalPages.includes(toState.name)) {
			return;
		}

		if (
			(fromState.name === 'web.objects.details' && toState.name === 'web.objects')
			|| (fromState.name === 'web.objects.uploader' && toState.name === 'web.objects')
			|| (fromState.name === 'web.objects.new-folder' && toState.name === 'web.objects')
		) {
			// From modal pages back to the parent.
			return;
		}

		if (typeof window.scrollTo === 'function') {
			window.scrollTo(0, 0);
		}
	} else if (action === RELOAD) {
		if (typeof window.scrollTo === 'function') {
			window.scrollTo(0, 0);
		}
	}
});
router.listen('ChangeError', error => {
	console.error(error);
	nprogress.done();
});

createRoot(document.getElementById('root')).render(
	<RouterView><Loading/></RouterView>,
);
