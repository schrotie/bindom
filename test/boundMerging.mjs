import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=bar.foo.foo:§> </span>
	<span data-bind=bar.foo.bar:§> </span>
</span>`;

describe('bound merging', () => {
	let bound;
	let proxy;
	beforeEach(() => {
		document.getElementById('test').innerHTML = dom;
		proxy = $(document, '#test > span').bind(bound = {});
	});


	it('should fallback to read bound object', () => {
		(proxy.baz === undefined).should.be.true;
		bound.baz = 'baz';
		proxy.baz.should.equal('baz');
	});

	it('should fallback to deep read bound object', () => {
		(proxy.baz === undefined).should.be.true;
		bound.baz = {baz: {baz: 'baz'}};
		proxy.baz.baz.baz.should.equal('baz');
	});

	it('should fallback deep to read bound object', () => {
		(proxy.bar.foo.baz === undefined).should.be.true;
		bound.bar = {foo: {baz: 'baz'}};
		proxy.bar.foo.baz.should.equal('baz');
	});


	it('should fallback to write bound object', () => {
		proxy.baz = 'baz';
		bound.baz.should.equal('baz');
	});

	it('should fallback to deep write bound object', () => {
		proxy.baz = {baz: {baz: 'baz'}};
		bound.baz.baz.baz.should.equal('baz');
	});

	it('should fallback deep to write bound object', () => {
		bound.bar = {foo: {}};
		proxy.bar.foo.baz =  'baz';
		bound.bar.foo.baz.should.equal('baz');
	});

	it.skip('should revert bound property', async() => {
		$(document, '#test')[0].innerHTML = /* html */`<a data-bind=a:.a></a>`;
		const $dom = $(document, '#test > a');
		const bound = {set a(s) {this._a = s;}};
		$dom.bind(bound);
		$(document, '#test > a').append(/* html */`<a data-bind=a:.a></a>`);
		await $dom.when('addedBound');
		bound.a = 42;
		bound._a.should.equal(42);
	});

	it('write event to object', async() => {
		$(document, '#test')[0].innerHTML = /* html */`<a data-bind=a:!a></a>`;
		const $dom = $(document, '#test > a');
		const bound = {};
		$dom.bind(bound);
		$dom.emit('a');
		await new Promise(resolve => setTimeout(resolve));
	});
});
