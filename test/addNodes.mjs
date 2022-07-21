import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=foo:§> </span>
	<span data-bind=bar.foo.foo:§> </span>
	<template>
	<span data-bind=foo:§> </span>
	<span data-bind=bar.foo.bar:§> </span>
	<span data-bind=baz:§> </span>
	</template>
</span>`;

describe('add nodes', () => {
	let $test;
	let bound, $barFooFoo;
	before(() => $test = $(document.getElementById('test')));
	beforeEach(() => {
		$test.prop('innerHTML', dom);
		$(document, '#test > span').bind(bound = {});
		$barFooFoo = $(document, '#test > span > span:nth-child(2)');
	});
	function instantiate() {
		$test.append($test.query('template').prop('content').cloneNode(true));
		return $test.when('addedBound');
	}


	it('adds binding to shallowly bound texts', async() => {
		bound.baz = 'baz';
		delete bound.baz;
		await instantiate();
		bound.baz.should.equal(' ');
		bound.baz = 'baz';
		$test.query('[data-bind^="baz"]').text().should.equal('baz');
	});

	it('adds binding to deeply bound texts', async() => {
		bound.bar.foo.foo = 'foo';
		$barFooFoo.text().should.equal('foo');
		bound.bar = {foo: {}};
		bound.bar.foo.bar = 'bar';
		bound.bar.foo.bar.should.equal('bar');
		await instantiate();
		bound.bar.foo.bar.should.equal('bar');
		bound.bar.foo.bar = 'baz';
		$test.query('[data-bind^="bar.foo.bar"]').text().should.equal('baz');
	});

	it('converts simple to array binding', async() => {
		bound.foo = 'foo';
		bound.foo.should.equal('foo');
		console.log('simple to array');
		await instantiate();
		bound.foo.should.deep.equal(['foo', ' ']);
		$test.query('[data-bind^="foo"]')[0].innerHTML.should.equal('foo');
		$test.query('[data-bind^="foo"]')[1].innerHTML.should.equal(' ');
		bound.foo = 'foo';
		$test.query('[data-bind^="foo"]')
			.forEach(el => el.innerHTML.should.equal('foo'));
	});
});
