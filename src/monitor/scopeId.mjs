export function scopeIds(node, biound) {
	const prop = `${biound}Id`;
	if(!node.dataset || !node.dataset[prop]) return [];
	return node.dataset[prop].split(',').map(n => parseInt(n, 10));
}

export function moveId(el, id, from, to) {
	if(!el.dataset || !scopeIds(el, from).includes(id)) return;
	removeId(el, id, from);
	addId(   el, id,   to);
}

export function addId(el, id, biound) {
	el.dataset[`${biound}Id`] = [...scopeIds(el, biound), id].join(',');
}

export function removeId(el, id, biound) {
	if(!el.dataset) return;
	const scopes = scopeIds(el, biound).filter(sc => sc !== id);
	if(!scopes.length) delete el.dataset[`${biound}Id`];
	else el.dataset[`${biound}Id`] = scopes.join(',');
}
