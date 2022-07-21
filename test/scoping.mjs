import $ from '../bindom.mjs';

import {addClass} from '../src/classRegistry.mjs';

const dom = /* html */`\
<bind-dom       data-class=Object data-bind=attr:@data-a>
	<bind-dom    data-class=Object data-bind=attr:@data-a;^prxy:.proxy>
		<bind-dom data-class=Object data-bind=^prxy:.proxy;attr:@data-a>
		</bind-dom>
	</bind-dom>
</bind-dom>`;

addClass(Object);

describe('bind-dom scoping', () => {
	let proxy;
	let $sqBind1, $sqBind2, $sqBind3;
	beforeEach(async() => {
		document.getElementById('test').innerHTML = dom;
		$sqBind1 = $(document, '#test > bind-dom');
		$sqBind2 = $(document, '#test > bind-dom > bind-dom');
		$sqBind3 = $(document, '#test > bind-dom > bind-dom > bind-dom');
		const binds = [$sqBind1, $sqBind2, $sqBind3];
		await Promise.all(binds.map(sqBind => sqBind.when('bound')));
		proxy = $sqBind1.prop('proxy');
	});

	it('sets only top-level attribute', () => {
		proxy.attr = 'test';
		$sqBind1.attr('data-a').should.equal('test');
		($sqBind2.attr('data-a') === null).should.be.true;
		($sqBind3.attr('data-a') === null).should.be.true;
	});

	it('sets only first nested attribute', () => {
		proxy.prxy.attr = 'test';
		($sqBind1.attr('data-a') === null).should.be.true;
		$sqBind2.attr('data-a').should.equal('test');
		($sqBind3.attr('data-a') === null).should.be.true;
	});

	it('sets only second nested attribute', () => {
		proxy.prxy.prxy.attr = 'test';
		($sqBind1.attr('data-a') === null).should.be.true;
		($sqBind2.attr('data-a') === null).should.be.true;
		$sqBind3.attr('data-a').should.equal('test');
	});

	it('only removes bindings to second level nodes', () => {
		$sqBind3.call('remove');
		proxy.attr = '1';
		proxy.prxy.attr = '2';
		$sqBind1.attr('data-a').should.equal('1');
		$sqBind2.attr('data-a').should.equal('2');
	});

	it('scopes bindings to added nodes', async() => {
		$sqBind1.append(`<bind-dom
			data-class=Object
			data-bind=^foo:@data-foo;foo:@data-bar
			data-bind-id=${$sqBind1.attr('data-bound-id')}
		></bind-dom>`);
		const $sqBind4 = $sqBind1.query('bind-dom + bind-dom');
		await Promise.all([$sqBind1.when('addedBound'), $sqBind4.when('bound')]);
		proxy.foo = 'foo';
		$sqBind4.attr('data-foo').should.equal('foo');
		($sqBind4.attr('data-bar') === null).should.be.true;

		$sqBind4.prop('proxy').foo = 'bar';
		$sqBind4.attr('data-foo').should.equal('foo');
		$sqBind4.attr('data-bar').should.equal('bar');
	});
});
