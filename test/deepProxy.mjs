import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=bar.foo.foo:§> </span>
	<span data-bind=bar.foo.bar:§> </span>
</span>`;

describe('deep proxy', () => {
	let proxy, bound, $barFooFoo, $barFooBar;
	beforeEach(() => {
		document.getElementById('test').innerHTML = dom;
		proxy = $(document, '#test > span').bind(bound = {});
		$barFooFoo = $(document, '#test > span > span:nth-child(1)');
		$barFooBar = $(document, '#test > span > span:nth-child(2)');
	});


	it('deeply binds initial text', () => proxy.bar.foo.foo.should.equal(' '));

	it('deeply binds changed text', () => {
		$barFooFoo.text('test');
		proxy.bar.foo.foo.should.equal('test');
	});

	it('changes deeply bound text', () => {
		proxy.bar.foo.foo = 'test';
		$barFooFoo.text().should.equal('test');
	});

	it('changes multiple deeply bound texts', () => {
		proxy.bar = {foo: {foo: 'foo', bar: 'bar'}};
		$barFooFoo.text().should.equal('foo');
		$barFooBar.text().should.equal('bar');
	});

	it('falls back to get from deep bound object', () => {
		bound.foo = {bar: 'baz'};
		proxy.foo.bar.should.equal('baz');
	});

	it('falls back to set to deep bound object', () => {
		bound.foo = {};
		proxy.foo.bar = 'baz';
		bound.foo.bar.should.equal('baz');
	});
});
