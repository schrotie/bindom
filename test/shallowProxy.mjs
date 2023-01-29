import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=text:§                > </span>
	<span data-bind=attr:@data-test        ></span>
	<span data-bind=prop:.innerHTML        ><p>html</p></span>
	<span data-bind=evnt:!click            ></span>
	<span data-bind=func:addEventListener()></span>
	<span data-bind=node:*                 ></span>
</span>`;

describe('shallow proxy', () => {
	let proxy;
	let $text;
	let $attr;
	let $prop;
	let $evnt;
	let $func;
	let $node;
	beforeEach(() => {
		document.getElementById('test').innerHTML = dom;
		proxy = $(document, '#test > span').bind();
		$text = $(document, '#test > span > span:nth-child(1)');
		$attr = $(document, '#test > span > span:nth-child(2)');
		$prop = $(document, '#test > span > span:nth-child(3)');
		$evnt = $(document, '#test > span > span:nth-child(4)');
		$func = $(document, '#test > span > span:nth-child(5)');
		$node = $(document, '#test > span > span:nth-child(6)');
	});

	it('binds initial text', () => proxy.text.should.equal(' '));

	it('binds changed text', () => {
		$text.text('test');
		proxy.text.should.equal('test');
	});

	it('changes bound text', () => {
		proxy.text = 'test';
		$text.text().should.equal('test');
	});


	it('binds initial attr', () => (proxy.attr === null).should.be.true);

	it('binds changed attr', () => {
		$attr.attr('data-test', 'test');
		proxy.attr.should.equal('test');
	});

	it('changes bound attr', () => {
		proxy.attr = 'test';
		$attr.attr('data-test').should.equal('test');
	});


	it('binds initial prop', () => proxy.prop.should.equal('<p>html</p>'));

	it('binds changed prop', () => {
		$prop.prop('innerHTML', 'test');
		proxy.prop.should.equal('test');
	});

	it('changes bound prop', () => {
		proxy.prop = 'test';
		$prop.prop('innerHTML').should.equal('test');
	});


	it('propagates event to dom', done => {
		$evnt.once('click', ({detail}) => {
			detail.should.equal('test');
			done();
		});
		proxy.evnt = {detail: 'test'};
	});

	it('cannot read event', () => {
		(() => proxy.evnt).should
			.throw('Cannot get event "click" with key "evnt"');
	});


	it('calls function', done => {
		proxy.func('test', ({detail}) => {
			detail.should.equal('test');
			done();
		});
		$func.emit('test', {detail: 'test'});
	});

	it('cannot assign to function', () => {
		(() => proxy.func = 0).should.throw(
			'Cannot assign to bound function "addEventListener" with key "func"',
		);
	});


	it('gets node', () => proxy.node[0].should.equal($node[0]));

	it('cannot assign to node', () => {
		(() => proxy.node = 0).should.throw(
			'Cannot assign to bound node with key "node"',
		);
	});
});
