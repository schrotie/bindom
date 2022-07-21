import $ from '../bindom.mjs';

import {addClass, deleteClassForTest} from '../src/classRegistry.mjs';

const dom = /* html */`
<template is=loop-dom><span class=test data-bind=baz:§> </span></template>
`;

const template = /* html */`
	<span class=test data-bind=foo:§> </span>
	<span class=test data-bind=bar:§> </span>
`;

class TestLoop {constructor(n = 0) {this.foo = `foo-${n}`; this.baz = n;}}
addClass(TestLoop, {template});

describe('loop-dom', function() {
	let $loop, $test;
	before(function() {
		deleteClassForTest(Object);
		$test = $(document.getElementById('test'));
	});
	beforeEach(function() {
		$test.append(dom);
		$loop = $(document, '#test > template[is="loop-dom"]');
	});
	afterEach(() => $test.prop('innerHTML', ''));
	async function instantiate(array) {
		$loop.prop('array', array);
		await $loop.when('inserted');
		return $test
			.query('.test')
			.map(el => el.innerHTML);
	}

	it('should instantiate template', async function() {
		(await instantiate([{baz: 1}, {baz: 2}]))
			.should.deep.equal(['1', '2']);
	});

	it('should instantiate class and apply defaults', async function() {
		$loop.attr('data-class', 'TestLoop');
		(await instantiate([new TestLoop(1), new TestLoop(2)]))
			.should.deep.equal(['1', 'foo-1', ' ', '2', 'foo-2', ' ']);
	});

	it('should instantiate class and convert defaults', async function() {
		$loop.attr('data-class', 'TestLoop');
		(await instantiate([{foo: 'f1', bar: 'b1'}, {foo: 'f2', bar: 'b2'}]))
			.should.deep.equal(['0', 'f1', 'b1', '0', 'f2', 'b2']);
	});
});
