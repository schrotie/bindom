export default function isLeaf(map, newMap) {
	const mapIsLeaf = Array.isArray(map.def);
	if(mapIsLeaf !== Array.isArray(newMap.def)) {
		throw new Error(`Cannot add/remove ${newMap.def} to/from ${map.def}`);
	}
	return mapIsLeaf;
}
