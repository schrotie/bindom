// import {rollupImportMapPlugin} from 'rollup-plugin-import-map';

import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser}      from 'rollup-plugin-terser';

const terserOpts = {
	compress: true,
	mangle: true,
	keep_fnames: true,
};

export default {
	input: 'bindom.mjs',
	plugins: [nodeResolve(), terser(terserOpts)],
	// plugins: [rollupImportMapPlugin({imports: {
	// 	quary: './node_modules/quary/quary.mjs',
	// }})],
	output: {
		file: 'bindom.min.mjs',
	},
};
