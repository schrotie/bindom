import {addProperty, updateProperty}  from '../bindObject.mjs';
import isLeaf      from './isLeaf.mjs';
import parse       from '../parse.mjs';
import {moveId}    from './scopeId.mjs';
import selectBound from '../selectBound.mjs';


export default function addNodes({scopeId, object, rootNodes, map, mutated}) {
	const newMap = parse(rootNodes, selectBound(mutated), object);
	findEntryPoints(object, map, newMap);
	mutated.forEach(el => moveId(el, scopeId, 'bind', 'bound'));
	rootNodes.emit('addedBound', {bubbles: true});
}

function findEntryPoints(object, map, newMap, path = []) {
	for(const [key, value] of Object.entries(newMap)) {
		const pth = path.concat(key);
		if(!map[key]) addProperty(object, map, pth, value);
		else if(isLeaf(map[key], value)) {
			mergeEntry(object, map, key, pth, value.def);
		}
		else findEntryPoints(object, map[key].def, value.def, pth);
	}
}

function mergeEntry(object, map, key, path, entry) {
	map[key].def.push(...entry);
	updateProperty(object, map, path);
}
