const bs = require('browser-sync').create();
const serveIndex = require('serve-index');

const {spawn} = require('child_process');

if(process.argv.indexOf('--headless') !== -1) {
	bs.init({server: {baseDir: '.'}, open: false}, function(err, b) {
		b.addMiddleware('', serveIndex('.'));
		const child = spawn('./node_modules/.bin/mocha-headless-chrome',
			['-f', 'http://localhost:3000/test/test.html']);
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);
		child.on('close', bs.exit);
	});
}
else {
	bs.init(
		{
			browser: 'chromium',
			files: ['bindom.mjs', 'src/**/*.mjs', 'test/**'],
			server: {baseDir: '.'},
			startPath: '/test/test.html',
		},
		function(err, bs) {bs.addMiddleware('', serveIndex('.'));},
	);
}
