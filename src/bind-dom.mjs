import $ from './bind.mjs';
import {getClass}  from './classRegistry.mjs';
import {addStyle}  from './addStyle.mjs';

export async function dataClassAttributeChangedCallback(
	name, oldValue, newValue) {
	if((name !== 'data-class') || !newValue) return;
	const opt = await getClass(newValue);
	const $node = $(this); // eslint-disable-line
	iniDom($node, oldValue, newValue, opt);
	ini($node, opt);
}

function iniDom($node, oldClass, newClass, {bindHost, style, template}) {
	if(style) addStyle(style);
	if(oldClass) $node.removeClass(oldClass);
	else markPersistentChildren($node);
	$node.addClass(newClass);
	if(template) append($node, template);
	if(!bindHost) return;
	const attr = $node.attr('data-bind');
	$node.attr('data-bind', attr ? `${attr};${bindHost}` : bindHost);
}

function markPersistentChildren($node) {
	$node
		.forEach(({childNodes}) => $(childNodes)
			.forEach(node => node._sqBindPersistent = true),
		);
}

function append($node, template) {
	// TODO clean up instantiated templates
	$node.append({condition: false, id: 'dom-bind', template});
	$node
		.forEach(({childNodes}) => $(childNodes)
			.filter(node => !node._sqBindPersistent)
			.call('remove'),
		);
	$node.append({condition: true,  id: 'dom-bind', template});
}

function ini($node, {Class}) {
	const object = new Class();
	const pre = $node.prop('proxy');
	// TODO: no worky, at least not for bindHost stuff ...
	if(pre) $node.unbind(pre);
	iniProxy($node[0], $node.bind(object));
	$node.emit('bound', {detail: object});
}

function iniProxy(node, proxy) {Object.defineProperty(node, 'proxy', {
	get( ) {return proxy;},
	set(v) {Object.assign(proxy, v);},
	configurable: true,
});}

customElements.define('bind-dom', class SqBind extends HTMLElement {
	static get observedAttributes() { return ['data-class']; }
	async attributeChangedCallback(...arg) {
		dataClassAttributeChangedCallback.call(this, ...arg);
	}
});
