import Binder from './Binder.mjs';

export default function(object, map) {return mapToProxy(object, map);}

function mapToProxy(object, map, path = []) {
	for(const [key, entry] of Object.entries(map)) {
		Object.assign(entry, accessor(object, entry.def, path.concat([key])));
	}
	return new Proxy(object, new Binder(map, path));
}

export function accessor(object, def, path) {
	if(Array.isArray(def)) {
		if(def.length === 1) return simpleAccessor(object, def[0]);
		return arrayAccessor(object, def);
	}
	return objectAccessor(object, def, path);
}

function simpleAccessor(object, opt) {
	switch(opt.to.type) {
		case 'event': return eventAccessor(object, opt);
		case 'func':  return funcAccessor( opt);
		case 'node':  return nodeAccessor( opt);
		case 'text':  return textAccessor( object, opt);
		default: return defaultAccessor(   object, opt);
	}
}

function eventAccessor(object, def) {
	registerListener(object, def, def.to.key, evt => evt);
	return {
		get() {throw new Error(
			`Cannot get event "${def.to.key}" with key "${def.key}"`,
		);},
		set: v => def.node.emit(def.to.key, v),
	};
}

function registerListener(object, def, evt, value) {
	const handler = evt => propagateToBound(object, def.key, value(evt));
	def.eventListener = {evt, handler};
	def.node.on(evt, handler);
}

function funcAccessor({node, to, key}) {return {
	get: () => (...arg) => node.call(to.key, ...arg),
	set() {throw new Error(
		`Cannot assign to bound function "${to.key}" with key "${key}"`);},
};}

function nodeAccessor({node, key}) {return {
	get: () => () => node,
	set() {throw new Error(`Cannot assign to bound node with key "${key}"`);},
};}

function defaultAccessor(object, def) {
	const accessor = {
		get: () => def.node[def.to.type](def.to.key),
		set:  v => def.node[def.to.type](def.to.key, v),
	};
	if(def.addEventListener) {
		registerListener(object, def, def.to.on, () => accessor.get());
	}
	propagateToDom(object, def.key, accessor);
	return accessor;
}

function textAccessor(object, def) {
	if(def.addEventListener) {
		registerListener(object, def, '§', () => def.node.text());
	}
	const accessor = {get: () => def.node.text(), set: t => def.node.text(t)};
	propagateToDom(object, def.key, accessor);
	return accessor;
}

function propagateToBound(object, key, what) {
	for(const {obj, prop} of path(object, key)) obj[prop] = what;
}

function* path(object, path) {
	for(const segment of path.slice(0, -1)) {
		if(!(object = object[segment])) return;
	}
	yield {obj: object, prop: path[path.length - 1]};
}

function propagateToDom(object, key, accessor) {
	for(const {obj, prop} of path(object, key)) {
		if(Object.prototype.hasOwnProperty.call(obj, prop)) {
			accessor.set(obj[prop]);
		}
	}
}

function arrayAccessor(object, def) {
	def = def.map(d => simpleAccessor(object, d));
	return {
		get: () => def.map(({get}) => get()),
		set: v  => def.map(({set}) => set(v)),
	};
}

function objectAccessor(object, def, path) {
	const proxy = mapToProxy(object, def, path);
	return {
		get: () => proxy,
		set: v => {
			Object.entries(v).forEach(([key, value]) => proxy[key] = value);
			return proxy;
		},
	};
}
