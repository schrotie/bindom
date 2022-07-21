import $ from '../bindom.mjs';

import {addClass} from '../src/classRegistry.mjs';

const dom = /* html */`
<template is=if-dom><span class=test></span></template>
<div class=insertHere><div></div></div>
`;

const template = /* html */`
	<span data-bind=foo:§> </span>
	<span data-bind=bar:§> </span>
`;

addClass(class TestIf {constructor() {this.foo = 'foo';}}, {template});

describe('if-dom', function() {
	let $if, $test;
	before(function() {$test = $(document.getElementById('test'));});
	beforeEach(function() {
		$test.append(dom);
		$if = $(document, '#test > template[is="if-dom"]');
	});
	afterEach(() => $test.prop('innerHTML', ''));
	function instantiate() {
		$if.prop('if', true);
		return $if.when('inserted');
	}

	it('should instantiate template', async function() {
		await instantiate();
		$test.query('.test').length.should.equal(1);
	});

	it('should append the template', async function() {
		$if.attr('data-parent', '.insertHere');
		await instantiate();
		$test.query('.insertHere > .test:nth-child(2)').length.should.equal(1);
	});

	it('should append the template from deep', async function() {
		$test.append('<span></span>');
		$test.query('span').append($if);
		$if.attr('data-parent', '.insertHere');
		await instantiate();
		$test.query('.insertHere > .test:nth-child(2)').length.should.equal(1);
	});

	it('should insert the template', async function() {
		$if.attr('data-insert', 'prepend');
		$if.attr('data-parent', '.insertHere');
		await instantiate();
		$test.query('.insertHere > .test:nth-child(1)').length.should.equal(1);
	});

	it('should prepend the template', async function() {
		$if.attr('data-insert', 'prepend');
		await instantiate();
		$test.query('.test + template + div').length.should.equal(1);
	});

	it('should instantiate class and apply defaults', async function() {
		$if.attr('data-class', 'TestIf');
		await instantiate();
		const $foo = $test.query('[data-bind="foo:§"]');
		const $bar = $test.query('[data-bind="bar:§"]');
		$foo.length.should.equal(1);
		$bar.length.should.equal(1);
		$foo.text().should.equal('foo');
		$bar.text().should.equal(' ');
	});
});
