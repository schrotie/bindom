import $ from './bind.mjs';

const styles = new Map();

/** Add a style (string) to the document head. Each style will be added only
  * once, regardless of how often addStyle is called for the same style string.
  * @example
import {addStyle} from 'bindom';
customElements.define('my-element', class extends HTMLElement {
	constructor(...arg) {
		super(...arg);
		addStyle('my-element {display: block; box-shadow: ${shadow[0]};}');
	}
});
  * @param {String} style style string
  * @return {HTMLStyleElement} style element
  */
export function addStyle(style) {
	if(styles.has(style)) return styles.get(style);
	$(document.head).append(`<style>${style}</style>`);
	styles.set(style, document.head.lastChild);
	return styles.get(style);
}
