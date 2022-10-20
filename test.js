var bs = require('browser-sync').create();
var serveIndex = require('serve-index');

bs.init(
	{
		browser: 'chromium',
		files: ['bindom.mjs', 'src/**/*.mjs', 'test/**'],
		server: {baseDir: '.'},
		startPath: '/test/test.html',
	},
	function(err, bs) {bs.addMiddleware('', serveIndex('.'));},
);
