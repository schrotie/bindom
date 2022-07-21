import {addClass, hasClass} from './classRegistry.mjs';
import {insertAndBindTemplate}  from './insertTemplate.mjs';


const map = new WeakMap();

customElements.define('loop-dom', class extends HTMLTemplateElement {
	constructor(...arg) {
		const self = super(...arg);
		defaultLoopClass(self);
		return self;
	}
	get array() {return map.get(this);}
	set array(array) {
		const updateStrategy = handleUpdateStrategy(this, array);
		if(updateStrategy === 'skip') return;
		map.set(this, array);
		defaultLoopClass(this);
		insertAndBindTemplate(this, options(this, array, updateStrategy));
	}
}, {extends: 'template'});

function defaultLoopClass(loop) {
	if(!loop.hasAttribute('data-class')) {
		if(!hasClass('Object')) addClass(Object);
		loop.setAttribute('data-class', 'Object');
	}
}

function handleUpdateStrategy(template, array) {
	const [ar, el] = (template.dataset.update &&
		template.dataset.update.split(',')) || [];
	if(!ar) return;
	if((ar === 'unidentical') && (array === map.get(template))) return 'skip';
	return el || ar;
}


function options(loop, array, updateStrategy) {
	const toItem = item => (typeof item === 'object' ? item : {item: item});
	const opt = {array: array.map(toItem)};
	if(updateStrategy) opt.updateStrategy = updateStrategy;
	if(loop.hasAttribute('data-chunks')) {
		opt.chunks = parseInt(loop.getAttribute('data-chunks'), 10);
	}
	return opt;
}
