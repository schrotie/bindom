// import {rollupImportMapPlugin} from 'rollup-plugin-import-map';

import {nodeResolve} from '@rollup/plugin-node-resolve';

export default {
	input: 'bindom.mjs',
	plugins: [nodeResolve()],
	// plugins: [rollupImportMapPlugin({imports: {
	// 	bindom: './node_modules/bindom/bindom.mjs',
	// 	quary: './node_modules/quary/quary.mjs',
	// 	xt8: './node_modules/xt8/index.mjs',
	// }})],
	output: {
		file: 'bindom.min.mjs',
	},
};
