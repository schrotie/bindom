import {getClass}  from './classRegistry.mjs';
import {addStyle}  from './addStyle.mjs';

import $ from './bind.mjs';

let id = 0;
const templates       = new WeakMap();
const previousClass   = new WeakMap();
const previousElement = new WeakMap();

export function insertAndBindTemplate(template, opt = {}) {
	return withOutBinding(true, template, opt);
}

export function insertTemplate(template, opt = {}) {
	return withOutBinding(false, template, opt);
}

async function withOutBinding(withBinding, template, opt) {
	const parent = determineParent(template);
	if(!parent) return;
	const insertMethod = determineInsertMethod(template);
	const reset = id => parent[insertMethod]({id, template, array: []});
	const options = await getInsertOptions(withBinding, template, opt, reset);
	return parent[insertMethod](options);
}

function determineParent(template) {
	if(!template.dataset.parent) {
		if(!template.dataset.insert) return $(template, ':host');
		else return $(template.parentElement);
	}
	else return findParent(template);
}

function findParent(element) {
	let parent = element.parentElement;
	const select = element.dataset.parent;
	while(parent) {
		const node = parent.querySelector(select);
		if(node) return $(node);
		parent = parent.parentElement;
	}
	return undefined;
}

function determineInsertMethod(template) {
	return template.dataset.insert ?
		template.dataset.insert :
		(template.dataset.parent ? 'append' : 'before');
}

async function getInsertOptions(withBinding, template, opt, reset) {
	const {id, Class} = await getTemplate(withBinding, template, reset);
	const options = {id, template, ...opt, done: done(template, opt)};
	if(withBinding) options.update = bind(Object.assign(opt, {Class}));
	if(withBinding && !opt.array) options.array = [new Class()];
	return options;
}

async function getTemplate(withBinding, template, reset) {
	if(!templates.has(template)) return await iniTemplate(withBinding, template);
	if(!withBinding) return templates.get(template);
	const tmpl = templates.get(template);
	if(tmpl.Class.name === template.dataset.class) return tmpl;
	reset(tmpl.id);
	return await updateTemplate(template, tmpl, true);
}

async function iniTemplate(withBinding, tmplElement) {
	if(!withBinding) {
		templates.set(tmplElement, {id: `sq-instantiate-template-${id++}`});
		return templates.get(tmplElement);
	}
	const opt = {id: `sq-instantiate-template-${id++}`};
	templates.set(tmplElement, opt);
	return await updateTemplate(tmplElement, opt);
}

async function updateTemplate(tmplElement, opt, changed) {
	const {Class, style, template} = await getClass(tmplElement.dataset.class);
	if(style) addStyle(style);
	const $template = $(tmplElement.content);
	if(changed)  $template.append({array: [], id: opt.id});
	if(template) $template.append({template, id: opt.id});
	opt.Class = Class;
	return opt;
}

function bind({Class, update, updateStrategy}) {
	return function($dom, arrayElement, idx) {
		if(doReOrNewBind(updateStrategy, $dom, Class)) {
			reOrNewBind(Class, update, $dom, arrayElement, idx);
		}
		else {
			const forceUpdate = updateStrategy === 'always';
			updateDom($dom, arrayElement, idx, update, forceUpdate);
		}
	};
}

function doReOrNewBind(updateStrategy, [dom], Class) {
	if(!updateStrategy || (updateStrategy === 'rebind')) return true;
	if(previousClass.get(dom) === Class) return false;
	previousClass.set(dom, Class);
	return true;
}

function reOrNewBind(Class, update, $dom, arrayElement, idx) {
	const correctClass = arrayElement.constructor.name === Class.name;
	const el = correctClass ? arrayElement : new Class();
	$dom.unbind();
	el.proxy = $($dom).bind(el);
	$dom.forEach(node => iniProxy(node, el.proxy));
	if(!correctClass) $dom.forEach(node => node.proxy = arrayElement);
	$dom.addClass(Class.name);
	if(update) update($dom, arrayElement, idx);
	$dom.emit('bound', {detail: arrayElement});
}

function iniProxy(node, proxy) {
	Object.defineProperty(node, 'proxy', {
		get( ) {return proxy;},
		set(v) {Object.assign(proxy, v);},
		configurable: true,
	});
}

function updateDom($dom, arrayElement, idx, update, forceUpdate) {
	if(!forceUpdate && isIdentical($dom, arrayElement)) return;
	$dom.forEach(node => node.proxy = arrayElement);
	if(update) update($dom, arrayElement, idx);
	$dom.emit('updated', {detail: arrayElement});
}

function isIdentical([dom], arrayElement) {
	if(previousElement.get(dom) === arrayElement) return true;
	previousElement.set(dom, arrayElement);
}


function done(template, {done}) {return function() {
	$(template).emit('inserted');
	if(done) done();
};}
