import $ from 'quary';

import selectBound from '../selectBound.mjs';

import {boundScopes, observe, observed} from './observe.mjs';
import removeNodes from './removeNodes.mjs';

let currentId = 0;

export function monitor(object, map, bound, rootNodes) {
	const id = currentId++;
	observed.set(id, {object, map, rootNodes});
	addIdToDom(id, bound, rootNodes);
	iniObserver();
}

function addIdToDom(id, bound, rootNodes) {
	bound.forEach(({dataset}) =>
		dataset.boundId = dataset.boundId ? `${dataset.boundId},${id}` : id,
	);
	addIdToTemplates(rootNodes, id);
}

function	addIdToTemplates(rootNodes, id) {
	filterBranch(rootNodes, 'template:not([data-class])')
		.forEach(({content}) => {
			const nodes = $(content.children);
			selectBound(nodes).attr('data-bind-id', id);
			addIdToTemplates(nodes, id);
		});
}

function filterBranch($nodes, selector) {
	return $nodes.query(selector)
		.concat($nodes.filter(node => node.matches && node.matches(selector)));
}

function iniObserver() {
	if(currentId > 1) return;
	const observer = new MutationObserver(observe);
	observer.observe(document, {childList: true, subtree: true});
}

export function unbind(bound, what) {
	const binding = bound.filter(node => node.dataset && node.dataset.boundId);
	if(!binding.length) return;
	const scopes = boundScopes(bound, 'bound');
	if(!what) scopes.forEach(rmNodes);
	else scopes.filter(filter(what)).forEach(rmNodes);
}

function rmNodes(arg) {removeNodes(Object.assign({forgetScope: true}, arg));}

function filter(what) {
	if(     typeof what === 'object') return ({object} ) => what === object;
	else if(typeof what === 'number') return ({scopeId}) => what === scopeId;
	else if(typeof what === 'string') {
		const id = parseInt(what, 10);
		return                                ({scopeId}) =>   id === scopeId;
	}
}
