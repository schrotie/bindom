export default function(object, map) {return bindObject(object, map);}

function bindObject(object, map, path = []) {
	for(const [key, entry] of Object.entries(map)) {
		const {get, set} = accessor(object, entry.def, path.concat([key]));
		Object.defineProperty(object, key, {get, set, configurable: true});
	}
	return object;
}

export function addProperty(object, map, pth, entry) {
	for(const {obj, prop} of path(object, pth)) {
		map[prop] = entry;
		const {get, set} = accessor(obj, entry.def, pth);
		Object.defineProperty(obj, prop, {get, set, configurable: true});
	}
}

export function updateProperty(object, map, pth) {
	for(const {obj, prop} of path(object, pth)) {
		const {def} = map[prop];
		const preValue = revertObj(def, obj, prop);
		if(!def.length) return delete map[prop];
		if(!def.revertProp && (preValue !== undefined)) obj[prop] = preValue[0];
		const {get, set} = accessor(obj, def, pth);
		Object.defineProperty(obj, prop, {get, set, configurable: true});
	}
}

function revertObj(def, obj, prop) {
	let preValue;
	try {preValue = Object.prototype.hasOwnProperty.call(obj, prop) ?
		[obj[prop]] : undefined;} catch(e) {}
	delete obj[prop];
	if(def.revertProp) obj.defineProperty(prop, def.revertProp);
	return preValue;
}

function accessor(object, def, path) {
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
	const set = getSetter(object, def.key.at(-1), def);
	let handler;
	if(set) handler = propagateToBound(object, def.key, set, value);
	else if(def.hostBinding) handler = propagateToProxy(object, def.key, value);
	else return;
	def.eventListener = {evt, handler};
	def.node.on(evt, handler);
}

function getSetter(object, key, def) {
	if(Object.prototype.hasOwnProperty.call(object, key)) {
		const prop = Object.getOwnPropertyDescriptor(object, key);
		if(def) def.revertProp = prop;
		return prop.set;
	}
	const proto = Object.getPrototypeOf(object);
	if(proto) return getSetter(proto, key);
}

function propagateToBound(object, key, set, value) {return function(evt) {
	for(const {obj, prop} of path(object, key)) {
		if((obj === object) && (prop === key[0])) set.call(object, value(evt));
		else obj[prop] = value(evt);
	}
};}

function propagateToProxy(object, key, value) {
	return function(evt) {
		for(const {obj, prop} of path(object, key)) {
			if(obj[prop] !== value(evt)) obj[prop] = value(evt);
		}
	};
}

function funcAccessor({node, to, key}) {return {
	get: () => (...arg) => node.call(to.key, ...arg),
	set() {throw new Error(
		`Cannot assign to bound function "${to.key}" with key "${key}"`);},
};}

function nodeAccessor({node, key}) {return {
	get: () => node,
	set() {throw new Error(`Cannot assign to bound node with key "${key}"`);},
};}


function defaultAccessor(object, def) {
	const accessor = {
		get: () => def.node[def.to.type](def.to.key),
		set:  v => def.node[def.to.type](def.to.key, v),
	};
	defaultPropagtation(object, def, accessor);
	return accessor;
}

function defaultPropagtation(object, def, accessor) {
	const hadProp = (def.to.type === 'prop') &&
		Object.prototype.hasOwnProperty.call(def.node[0], def.to.key);
	registerListener( object, def, def.to.on, () => accessor.get());
	if(!hasPath(object, def)) {
		if(def.to.type === 'attr') propagatePreAttribute(object, def);
		if(def.to.type === 'prop') propagatePreProperty( object, def, hadProp);
	}
	propagateToDom(   object, def, accessor);
}

function hasPath(object, {key}) {
	for(const {obj, prop} of path(object, key)) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}
}

function propagatePreAttribute(object, def) {
	if(
		!def.hostBinding ||
		!def.node[0].hasAttribute(def.to.key) ||
		!def.eventListener
	) return;
	setTimeout(() => def.eventListener.handler(def.node.attr(def.to.key)));
}

function propagatePreProperty(object, def, hadProp) {
	if(!def.hostBinding || !hadProp || !def.eventListener) return;
	setTimeout(() => def.eventListener.handler(def.node[0][def.to.key]));
}

function textAccessor(object, def) {
	registerListener(object, def, '§', () => def.node.text());
	const accessor = {get: () => def.node.text(), set: t => def.node.text(t)};
	propagateToDom(object, def, accessor);
	return accessor;
}

function* path(object, path) {
	for(const segment of path.slice(0, -1)) {
		if(!(object = object[segment])) return;
	}
	yield {obj: object, prop: path.at(-1)};
}

function propagateToDom(object, def, accessor) {
	const key = def.key.at(-1);
	if(Object.prototype.hasOwnProperty.call(object, key)) {
		accessor.set(object[key]);
	}
}

function arrayAccessor(object, def) {
	def = def.map(d => simpleAccessor(object, d));
	return {
		get: () => def[0].get(), // .map(({get}) => get()),
		set: v  => def.map(({set}) => set(v)),
	};
}

function objectAccessor(object, def, path) {
	const proxy = object[path.at(-1)] || {};
	bindObject(proxy, def, path);
	return {
		get: () => proxy,
		set: v => {
			Object.entries(v).forEach(([key, value]) => proxy[key] = value);
			return proxy;
		},
	};
}
