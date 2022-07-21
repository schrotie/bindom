import $ from '../bindom.mjs';

import {addClass} from '../src/classRegistry.mjs';

const dom = /* html */`<bind-dom data-class=test></bind-dom>`;
const style = /* css */`bind-dom[data-class="test"] {display: block;}`;
const template = /* html */`<input data-bind=value:.value>`;

addClass(class test {set value(v) {this._value = v;}}, {style, template});

describe('bind-dom', () => {
	let proxy;
	let $sqBind;
	let $input;
	beforeEach(async() => {
		document.getElementById('test').innerHTML = dom;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		proxy = $sqBind.prop('proxy');
		$input = $(document, '#test > bind-dom > input');
	});

	after(() => {
		document.getElementById('test').innerHTML = '';
		$(document.head).query('style').call('remove');
	});

	it('binds value', () => {
		proxy.value.should.equal('');
		$input.prop('value', 'test');
		proxy .value.should.equal('test');
		proxy._value.should.equal('test');
	});

	it('adds style', () => {
		$(document.head).query('style').prop('innerHTML').should.equal(style);
	});
});
