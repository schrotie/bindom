import $ from 'quary';

export default function parse(root, nodes, object, options) {
	const bound = nodes.map(parseBoundNode(root, options)).flat();
	return assemble(object, bound);
}


function parseBoundNode(root, {noRoot} = {}) {return function(bound) {
	const parser = noRoot ? (b => parseSingleBinding(false, sq(bound), b)) :
		(b => parseSingleBinding(root.includes(bound), sq(bound), b));
	return splitBindings(bound)
		.map(parser)
		.filter(b => b);
};}

function splitBindings(bound) {
	return bound.dataset.bind
		.replace(/\s+/g, ';')
		.replace(/(?:^;)|(?:;$)/g, '')
		.split(';')
		.filter(b => b);
}


function sq(node) {return node.shadowRoot ? $(node, ':host') : $(node);}

function parseSingleBinding(isRoot, node, binding) {
	const bind = binding.split(':');
	validateSingleBinding(bind);
	const key = parseKey(isRoot, node, bind[0]);
	if(!key) return;
	return bindingDefinition(node, bind, key);
}

function validateSingleBinding(bind) {
	if(bind.length !== 2) {throw new Error(
		`Invalid binding "${bind.join(':')}"; expecting "key:domBindExpression"`,
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

function bindingDefinition(node, bind, key) {
	const def = {node, key, to: parseDomExp(bind[1])};
	if(
		!/^\^/.test(bind[0]) &&
		node.attr('data-class') &&
		{attr: 1, prop: 1, text: 1}[def.to.type]
	) def.hostBinding = true;
	return def;
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

