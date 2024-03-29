import $ from '../bindom.mjs';

import {addClass, deleteClassForTest} from '../src/classRegistry.mjs';

const dom = /* html */`<bind-dom data-class=test></bind-dom>`;
const style = /* css */`bind-dom[data-class="test"] {display: block;}`;
const template = /* html */`<input data-bind=value:.value>`;


describe('bind-dom', () => {
	let proxy;
	let $sqBind;
	let $input;

	class test {set value(v) {this._value = v;}}
	class testA {}
	class testHostBinding {}
	class testHostBinding2 {}
	before(function() {
		addClass(test, {style, template});
		addClass(testA);
		addClass(testHostBinding,  {bindHost: 'a:.a'});
		addClass(testHostBinding2, {bindHost: 'a:.a'});
	});

	beforeEach(async() => {
		document.getElementById('test').innerHTML = dom;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		proxy = $sqBind.prop('proxy');
		$input = $(document, '#test > bind-dom > input');
	});

	after(() => {
		deleteClassForTest(test);
		deleteClassForTest(testA);
		deleteClassForTest(testHostBinding);
		deleteClassForTest(testHostBinding2);
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

	it('adds className', () => $sqBind.attr('class').should.equal('test'));

	it('ignores same className', () => $sqBind.attr('data-class', false));

	it('adds className', async function() {
		$sqBind.attr('data-class', 'testA');
		await $sqBind.when('bound');
		$sqBind.attr('class').should.equal('testA');
	});

	it('add and removes hostBinding', async function() {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testHostBinding></bind-dom>
		`;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		$sqBind.attr('data-bind').should.equal('a:.a');
		$sqBind.attr('data-class', 'testA');
		await $sqBind.when('bound');
		$sqBind.attr('data-bind').should.equal('');
	});

	it('reuses hostBinding', async function() {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testHostBinding></bind-dom>
		`;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		$sqBind.attr('data-bind').should.equal('a:.a');
		$sqBind.attr('data-class', 'testHostBinding2');
		await $sqBind.when('bound');
		$sqBind.attr('data-bind').should.equal('a:.a');
	});


	it('preserves parent binding', async function() {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testHostBinding data-bind=^a:.a></bind-dom>
		`;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		$sqBind.attr('data-bind').should.equal('^a:.a;a:.a');
	});

	it('preserves children', async function() {
		document.getElementById('test').innerHTML = /* html */`
		<bind-dom data-class=test data-bind=^a:.a><a></a></bind-dom>
		`;
		$sqBind = $(document, '#test > bind-dom');
		await $sqBind.when('bound');
		$sqBind.query('a').length.should.equal(1);
	});

	it('updates deep bindings', async() => {
		let tC = false;
		addClass(class testB {set testC(t) {tC = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom       data-class=testA>
				<bind-dom    data-class=testA data-bind=^testA:.testA;testB:.testA>
					<bind-dom data-class=testB data-bind=^testB:.testB;testC:.testB>
					</bind-dom>
				</bind-dom>
			</bind-dom>
		`;
		const $sqBindA = $(document, '#test > bind-dom');
		const $sqBindB = $(document, '#test > bind-dom > bind-dom');
		const $sqBindC = $(document, '#test > bind-dom > bind-dom > bind-dom');
		await Promise.all([
			$sqBindA.when('bound'),
			$sqBindB.when('bound'),
			$sqBindC.when('bound'),
		]);
		proxy = $sqBindA.prop('proxy');
		proxy.testA = 'TestTest';
		tC.should.equal('TestTest');
	});

	it('updates deep bindings through loop', async() => {
		let tC = false;
		addClass(class testC {set testC(t) {tC = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom       data-class=testA>
				<template is=loop-dom data-bind=^test:.array><div>
					<bind-dom data-class=testC data-bind=^testB:.test;testC:.test>
					</bind-dom>
				</div></template>
			</bind-dom>
		`;
		const $sqBindA = $(document, '#test > bind-dom');
		await $sqBindA.when('bound');
		proxy = $sqBindA.prop('proxy');
		proxy.test = [{testB: '[test]'}];
		await $(document, '#test > bind-dom > template').when('inserted');
		await (new Promise(resolve => setTimeout(resolve)));
		tC.should.equal('[test]');
		proxy.test = [{testB: '[test2]'}];
		await $(document, '#test > bind-dom > template').when('inserted');
		await (new Promise(resolve => setTimeout(resolve)));
		tC.should.equal('[test2]');
	});

	it('updates nested binding in loop', async() => {
		let tC = false;
		addClass(class testD {set testC(t) {tC = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<template is=loop-dom data-bind=^test:.array>
				<bind-dom data-class=testD data-bind=^testB:.test;testC:.test>
				</bind-dom>
			</template>
		`;
		const $tmpl = $(document, '#test > template');
		$tmpl.prop('array', [{testB: '[test]'}]);
		await $tmpl.when('inserted');
		await (new Promise(resolve => setTimeout(resolve)));
		tC.should.equal('[test]');
	});

	it('updates nested binding in if', async() => {
		let tG = false;
		addClass(class testG {set testG(t) {tG = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<div><template is=if-dom data-bind=render:.if>
				<bind-dom data-class=testG data-bind=^test:.test;testG:.test>
				</bind-dom>
			</template></div>
		`;
		$(document, '#test > div').bind({render: true, test: '[test]'});
		await (new Promise(resolve => setTimeout(resolve)));
		tG.should.equal('[test]');
	});

	it('updates nested loop in if', async() => {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testA>
				<template is=if-dom data-bind=render:.if>
					<template is=loop-dom data-bind=^array:.array>
						<span data-bind=text:§> </span>
					</template>
				</template>
			</bind-dom>
		`;
		const $bindom = $(document, '#test > bind-dom');
		await $bindom.when('bound');
		$bindom.prop('proxy', {render: true, array: [{text: 'test'}]});
		const $if = $(document, '#test > bind-dom > template[is="if-dom"]');
		await $if.when('inserted');
		const $loop = $(document, '#test > bind-dom > template[is="loop-dom"]');
		await $loop.when('inserted');
		$bindom.prop('innerText').should.equal('test');
	});

	it('updates host attribute binding', async() => {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testA data-test=test data-bind=test:@data-test>
				<span data-bind=test:§> </span>
			</bind-dom>
		`;
		const $bindom = $(document, '#test > bind-dom');
		await $bindom.when('bound');
		await (new Promise(resolve => setTimeout(resolve)));
		$bindom.prop('innerText').should.equal('test');
	});

	it('updates host property binding', async() => {
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testA data-bind=test:.testProp>
				<span data-bind=test:§> </span>
			</bind-dom>
		`;
		const $bindom = $(document, '#test > bind-dom');
		$bindom.prop('testProp', 'test');
		await $bindom.when('bound');
		await (new Promise(resolve => setTimeout(resolve)));
		$bindom.prop('innerText').should.equal('test');
	});

	it('updates host attribute setter', async() => {
		let set = 'not set';
		addClass(class testE {set test(t) {set = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testE data-test=test data-bind=test:@data-test>
			</bind-dom>
		`;
		const $bindom = $(document, '#test > bind-dom');
		await $bindom.when('bound');
		await (new Promise(resolve => setTimeout(resolve)));
		set.should.equal('test');
	});

	it('updates host property setter', async() => {
		let set = 'not set';
		addClass(class testF {set test(t) {set = t;}});
		document.getElementById('test').innerHTML = /* html */`
			<bind-dom data-class=testF data-bind=test:.testProp>
			</bind-dom>
		`;
		const $bindom = $(document, '#test > bind-dom');
		$bindom.prop('testProp', 'test');
		await $bindom.when('bound');
		await (new Promise(resolve => setTimeout(resolve)));
		set.should.equal('test');
	});
});
