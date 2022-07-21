import $ from '../bindom.mjs';

import {addClass} from '../src/classRegistry.mjs';
import {insertTemplate, insertAndBindTemplate}  from '../src/insertTemplate.mjs';

const style = /* css */`[data-class="TestInsertTemplate"] {display: block;}`;

addClass(
	class TestInsertTemplate {set value(v) {this._value = v;}},
	{style},
);

describe('insertTemplate', function() {
	after(() => {
		document.getElementById('test').innerHTML = '';
		$(document.head).query('style').call('remove');
	});

	function test(opt) {
		const $test = $(document.getElementById('test'));
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
});
