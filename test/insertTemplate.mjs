import $ from '../bindom.mjs';

import {addClass, deleteClassForTest} from '../src/classRegistry.mjs';
import {insertTemplate, insertAndBindTemplate}  from '../src/insertTemplate.mjs';


describe('insertTemplate', function() {
	class TestInsertTemplate  {constructor(v) {this.value = v;}}
	class TestInsertTemplate2 {}
	const style = /* css */`[data-class="TestInsertTemplate"] {display: block;}`;
	let $test;

	before(function() {
		$test = $(document.getElementById('test'));
		addClass(TestInsertTemplate,  {template: /* html */`<br/>`, style});
		addClass(TestInsertTemplate2, {template: /* html */`<br/>`});
	});

	after(() => {
		deleteClassForTest(TestInsertTemplate);
		deleteClassForTest(TestInsertTemplate2);
		document.getElementById('test').innerHTML = '';
		$(document.head).query('style').call('remove');
	});

	function test(opt) {
		$test.prop('innerHTML', /* html */`<template
			data-class=TestInsertTemplate
		></template>`);
		return insertAndBindTemplate($test.query('template')[0], opt);
	}


	it('should skip misconfigured parent templates', async function() {
		const template = document.createElement('template');
		template.setAttribute('data-parent', 'foo');
		const result = await insertTemplate(template);
		(result === undefined).should.be.true;
	});

	it('should add style', async function() {
		await test({});
		$(document.head).query('style').prop('innerHTML').should.equal(style);
	});

	it('should call update', async function() {
		let updated = false;
		await test({array: [{}], update: () => updated = true});
		updated.should.be.true;
	});

	it('should call done', async function() {
		let done = false;
		await test({array: [{}], done: () => done = true});
		done.should.be.true;
	});

	it('should change the type', async function() {
		await test({});
		const $tmpl = $test.query('template');
		$tmpl.attr('data-class', 'TestInsertTemplate2');
		await insertAndBindTemplate($tmpl[0], {});
		$test.query('br').length.should.equal(1);
	});

	it('should update DOM', async function() {
		$test.prop('innerHTML', /* html */`<template
			data-class=TestInsertTemplate2
		></template>`);
		await insertAndBindTemplate(
			$test.query('template')[0], {updateStrategy: 'always'},
		);
		const $tmpl = $test.query('template');
		const newObject = new TestInsertTemplate2();
		newObject.prop = 'updated';
		let calledElement = false;
		await insertAndBindTemplate($tmpl[0], {
			array: [newObject],
			updateStrategy: 'always',
			update: ($dom, element) => calledElement = element,
		});
		calledElement.should.equal(newObject);
		$test.query('br').prop('proxy').prop.should.equal('updated');
	});

	it('should update unidentical', async function() {
		const obj = [0, 1, 2].map((d, i) => new TestInsertTemplate(i));
		const opt = {updateStrategy: 'unidentical', array: obj.slice(0, 2)};
		const proxy = idx => $test.query('br')[idx].proxy;
		await test(opt);
		opt.array[1] = obj[2];
		proxy(0).should.equal(obj[0]);
		proxy(1).should.equal(obj[1]);
		await insertAndBindTemplate($test.query('template')[0], opt);
		proxy(0).value.should.equal(0);
		proxy(1).value.should.equal(2);
	});
});
