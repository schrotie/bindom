export default class Binder {
	constructor(map, path) {
		this.map = map;
		if(path.length) this.path = path;
	}

	get(object, property) {
		if(!this.map[property]) {
			if(this.path) return getDeep(object, this.path, property);
			return object && object[property];
		}
		return this.map[property].get();
	}

	set(object, property, value) {
		if(!this.map[property]) {
			return setBoundObject(object, this.path, property, value);
		}
		this.map[property].set(value);
		return true;
	}
}

function getDeep(object, path, property) {
	for(const segment of path) if(!(object = object[segment])) return undefined;
	return object[property];
}

function setBoundObject(object, path, property, value) {
	if(path) return setDeep(object, path, property, value);
	object[property] = value;
	return true;
}

function setDeep(object, path, property, value) {
	for(const segment of path) {
		if(!(object = object[segment])) invalidPath([...path, property]);
	}
	object[property] = value;
	return true;
}

function invalidPath(path) {throw new Error(
	`Cannot set invalid path "${path.join(', ')}"`,
);}
