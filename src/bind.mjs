import $, {Quary} from 'quary';

import parse             from './parse.mjs';
import boundObject       from './bindObject.mjs';
import {monitor, unbind} from './monitor/index.mjs';
import selectBound       from './selectBound.mjs';

Quary.prototype.bind = function(object = {}) {return bind(object, this);};
Quary.prototype.unbind = function(what) {return unbind(this, what);};


export default $;

function bind(object, nodes) {
	const bound = selectBound(nodes);
	const map = parse(nodes, bound, object);
	monitor(object, map, bound, nodes);
	return boundObject(object, map);
}
