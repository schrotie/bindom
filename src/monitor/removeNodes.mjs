import {updateProperty}   from '../bindObject.mjs';
import isLeaf             from './isLeaf.mjs';
import parse              from '../parse.mjs';
import {moveId, removeId} from './scopeId.mjs';
import selectBound        from '../selectBound.mjs';


export default function removeNodes(
	{forgetScope, scopeId, object, rootNodes, map, mutated},
) {
	const bound = selectBound(mutated);
	const rmMap = parse(rootNodes, bound, {});
	findRmPoints(object, map, rmMap);
	if(forgetScope) bound.forEach(el => removeId(el, scopeId, 'bound'));
	else            bound.forEach(el =>   moveId(el, scopeId, 'bound', 'bind'));
	rootNodes.emit('removedBound', {bubbles: true});
}

function findRmPoints(object, map, rmMap, path = []) {
	for(const [key, value] of Object.entries(rmMap)) {
		if(!map[key]) continue; // rmNotFoundError(key);
		else if(isLeaf(map[key], value)) {
			const pth = path.concat(key);
			rmEntry(object, map, key, value.def, pth);
		}
		else removeNestedEntries(object, map, key, value, path);
	}
}

function removeNestedEntries(object, map, key, value, path) {
	findRmPoints(object, map[key].def, value.def, path);
	if(!Object.keys(map[key].def).length) {
		delete    map[key];
		delete object[key];
	}
}

// function rmNotFoundError(key) {
// 	throw new Error(`Could not remove binding to "${key}", not found`);
// }

function rmEntry(object, map, key, rm, path) {
	const {def} = map[key];
	for(const entry of rm) {
		def.splice(def.indexOf(def.find(({node}) => node === entry.node)), 1)
			.forEach(removeEventListener);
	}
	if((def.length === 1) || !def.length) updateProperty(object, map, path);
}

function removeEventListener({
	addEventListener, node, eventListener: {evt, handler} = {},
}) {
	if(!addEventListener) return;
	if(handler) node.off(evt, handler);
}
