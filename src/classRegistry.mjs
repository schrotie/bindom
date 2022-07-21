const registry = new Map();
const wait     = new Map();


export function hasClass(name) {return registry.has(name);}

export function getClass(name, timeout = 3000) {
	if(registry.has(name)) return Promise.resolve(registry.get(name));
	if(!wait.has(name)) wait.set(name, []);
	return new Promise((resolve, reject) => wait.get(name).push({
		resolve, timeoutId: iniTimeout(name, timeout, reject),
	}));
}

function iniTimeout(name, timeout, reject) {
	return setTimeout(() => reject(new Error(
		`Failed to register required class "${name}" after ${timeout}ms`,
	)), timeout);
}

export function addClass(cls, options = {}) {
	checkNew(cls);
	const entry = {Class: cls, ...options};
	registry.set(cls.name, entry);
	resolveWait(cls, entry);
}

function checkNew({name}) {
	if(!registry.has(name)) return;
	throw new Error(
		`Cannot register class "${name}", because it already exists`,
	);
}

function resolveWait({name}, entry) {
	if(!wait.has(name)) return;
	for(const {resolve, timeoutId} of wait.get(name)) {
		clearTimeout(timeoutId);
		resolve(entry);
	}
	wait.delete(name);
}

export function deleteClassForTest(cls) {
	if(registry.has(cls.name)) registry.delete(cls.name);
	if(wait    .has(cls.name)) {
		for(const {timeoutId} of wait.get(cls.name)) clearTimeout(timeoutId);
		wait.delete(cls.name);
	}
}
