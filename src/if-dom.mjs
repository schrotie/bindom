import {insertTemplate, insertAndBindTemplate}  from './insertTemplate.mjs';

const map = new WeakMap();

customElements.define('if-dom', class extends HTMLTemplateElement {
	get if() {return map.get(this);}
	set if(v) {
		map.set(this, v);
		(
			this.hasAttribute('data-class') ?
			insertAndBindTemplate : insertTemplate
		)(this, {condition: v});
	}
}, {extends: 'template'});
