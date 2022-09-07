import $ from 'quary';

import addNodes    from './addNodes.mjs';
import removeNodes from './removeNodes.mjs';
import {scopeIds}  from './scopeId.mjs';

export const observed = new Map();

class MutationEvaluator {
	constructor(mutationProp, handler, biound) {
		this.mutationProp = mutationProp;
		this.handle = handler;
		this.biound = biound;
	}

	process(mutations) {
		const nodes = mutations.map(m => Array.from(m[this.mutationProp])).flat();
		if(!nodes.length) return;
		if(this.timeout) this.nodes.push(...nodes);
		else {
			this.timeout = setTimeout(this.flush.bind(this));
			this.nodes = nodes;
		}
	}

	flush() {
		delete this.timeout;
		removeMoved();
		evaluateMutation(this.nodes, this.handle, this.biound);
		delete this.nodes;
	}
}

const addition = new MutationEvaluator('addedNodes',   addNodes,    'bind');
const removal  = new MutationEvaluator('removedNodes', removeNodes, 'bound');

export function observe(mutations) {
	addition.process(mutations);
	removal.process(mutations);
}

function removeMoved() {
	const a = addition.nodes;
	const b = removal.nodes;
	if(!a || !b) return;
	const moved = a.filter(n => b.includes(n));
	if(!moved.length) return;
	addition.nodes = a.filter(n => !moved.includes(n));
	removal .nodes = b.filter(n => !moved.includes(n));
}

function evaluateMutation(nodes, handle, biound) {
	if(!nodes.length) return;
	const bound = $(nodes)
		.query('[data-bind]')
		.concat(nodes.filter(n => n.matches && n.matches('[data-bind]')));
	if(!bound.length) return;
	boundScopes(bound, biound).forEach(handle);
}

export function boundScopes(bound, biound) {
	const scopes = {};
	for(const node of bound) addToScope(scopes, node, biound);
	return Object.values(scopes);
}

function addToScope(scopes, node, biound) {
	for(const sid of scopeIds(node, biound)) {
		if(scopes[sid]) scopes[sid].mutated.push(node);
		else scopes[sid] = {...observed.get(sid), mutated: $(node), scopeId: sid};
	}
}
