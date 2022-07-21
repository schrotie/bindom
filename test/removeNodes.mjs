import $ from '../bindom.mjs';

import removeNodes from '../src/monitor/removeNodes.mjs';

const dom = `<span>
	<span data-bind=foo:§>foo1</span>
	<span data-bind=bar.foo.foo:§>barFooFoo</span>
	<span data-bind=foo:§>foo2</span>
	<span data-bind=bar.foo.bar:§>barFooBar</span>
	<span data-bind=baz:§>baz</span>
</span>`;

describe('remove nodes', () => {
	let $test;
	let bound, proxy, $foo1, $foo2, $barFooFoo, $barFooBar, $baz;
	before(() => $test = $(document.getElementById('test')));
	beforeEach(() => {
		$test.prop('innerHTML', dom);
		proxy      = $(document, '#test > span').bind(bound = {});
		$foo1      = $(document, '#test > span > span:nth-child(1)');
		$foo2      = $(document, '#test > span > span:nth-child(3)');
		$barFooFoo = $(document, '#test > span > span:nth-child(2)');
		$barFooBar = $(document, '#test > span > span:nth-child(4)');
		$baz       = $(document, '#test > span > span:nth-child(5)');
	});
	const removed = $remove => {
		$remove.call('remove');
		return $test.when('removedBound');
	};


	it('removes shallow binding', async() => {
		proxy.baz.should.equal('baz');
		bound.baz = 'BAZ';
		await removed($baz);
		proxy.baz = '';
		bound.baz.should.equal('');
	});

	it('converts array to simple binding', async() => {
		proxy.foo.should.deep.equal(['foo1', 'foo2']);
		await removed($foo1);
		proxy.foo.should.equal('foo1');
		proxy.foo = 'foo';
		proxy.foo.should.equal('foo');
		$foo1.text().should.equal('foo');
		$foo2.text().should.equal('foo2');
	});

	it('removes deep binding', async() => {
		proxy.bar.foo.foo.should.equal('barFooFoo');
		bound.baz = 'BAZ';
		bound.bar = {foo: {foo: 'removed'}};
		await removed($barFooFoo);
		proxy.bar.foo.foo.should.equal('removed');
		proxy.bar.foo.foo = 'yeah, gone';
		bound.bar.foo.foo.should.equal('yeah, gone');
	});

	it('cleans up deep binding', async() => {
		await removed($barFooFoo);
		await removed($barFooBar);
		(proxy.bar === undefined).should.be.true;
	});

	it.skip('catches unmappable nodes', function() {
		const div = document.createElement('div');
		div.setAttribute('data-bind', 'foo:.bar');
		(() => removeNodes({object: {}, rootNodes: [], map: {}, mutated: $(div)}))
			.should.throw('Could not remove binding to "foo", not found');
	});

	it('catches mismatching nodes', function() {
		const div = document.createElement('div');
		div.setAttribute('data-bind', 'foo.bar:.bar');
		(() => removeNodes({
			object: {}, rootNodes: [], map: {foo: {def: []}}, mutated: $(div)}))
			.should.throw('Cannot add/remove [object Object] to/from ');
	});
});
