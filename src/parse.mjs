import $ from '../node_modules/quary/quary.mjs';

export default function parse(root, nodes, object) {
	const bound = nodes.map(parseBoundNode(root)).flat();
	return assemble(object, bound);
}


function parseBoundNode(root) {return function(bound) {
	return bound.dataset.bind
		.replace(/\s+/g, ';')
		.replace(/(?:^;)|(?:;$)/g, '')
		.split(';')
		.filter(b => b)
		.map(b => parseSingleBinding(root.includes(bound), sq(bound), b))
		.filter(b => b);
};}

function sq(node) {return node.shadowRoot ? $(node, ':host') : $(node);}

function parseSingleBinding(root, node, binding) {
	const splitChar = /÷/.test(binding) ? '÷' : ':';
	const bind = binding.split(splitChar);
	validateSingleBinding(bind);
	const key = parseKey(root, node, bind[0]);
	if(!key) return;
	return {node, key, to: parseDomExp(bind[1])};
}

function validateSingleBinding(bind) {
	if(bind.length !== 2) {throw new Error(
		`Invalid binding "${bind.join(':')}"; expecting "key:domBindExpression" \
or "key÷domBindExpression"`,
	);}
}

function parseKey(isRoot, [node], key) {
	if(isRoot) return /^\^/.test(key) ? false : key.split('.');
	else {
		if(node.hasAttribute('data-class')) {
			return /^\^/.test(key) ? key.replace(/^\^/, '').split('.') : false;
		}
		else return key.split('.');
	}
}

function parseDomExp(value) {
	const key = value.replace(/(?:^[.!@§])|(?:\(\)$)/, '');
	if(/^\./   .test(value)) return {type: 'prop',  on: value, key};
	if(/^!/    .test(value)) return {type: 'event', on: value, key};
	if(/^@/    .test(value)) return {type: 'attr',  on: value, key};
	if(/^§/    .test(value)) return {type: 'text',  on: value, key};
	if(/^\*$/  .test(value)) return {type: 'node'};
	if(/\(\)$/ .test(value)) return {type: 'func',  key};
	bindExpErr(value);
}

function bindExpErr(value) {
	throw new Error(
		`Invalid DOM-bind-expression "${value}"; \
expecting ".property" or "!event" or "@attribute" or "§" (for text)`,
	);
}


function assemble(object, bound) {
	const map = {};
	let stage;
	const setStage = l => stage = bound.filter(({key}) => key.length > l);
	for(let level = 0; setStage(level).length; level++) for(const bnd of stage) {
		setMap(map, level, bnd);
	}
	return map;
}

function setMap(map, level, bound) {
	let mapLvl = map;
	for(let i = 0; i < level; i++) mapLvl = mapLvl[bound.key[i]].def;
	const key = bound.key[level];
	if(bound.key.length === (level + 1)) setMapLeaf(mapLvl, key, bound);
	else if(mapLvl[key] && Array.isArray(mapLvl[key].def)) {
		inconsistentBindings(bound);
	}
	else if(!mapLvl[key]) mapLvl[key] = {def: {}};
}

function setMapLeaf(mapLvl, key, bound) {
	if(!mapLvl[key]) mapLvl[key] = {def: []};
	else if(!Array.isArray(mapLvl[key].def)) inconsistentBindings(bound);
	mapLvl[key].def.push(bound);
}

function inconsistentBindings({key}) {throw new Error(
	`Inconsistent binding for ${key.join('.')}; EITHER nested object OR binding`,
);}

