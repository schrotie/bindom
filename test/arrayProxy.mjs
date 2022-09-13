import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=foo:§> </span>
	<span data-bind=foo:§> </span>
</span>`;

describe('array proxy', () => {
	let proxy;
	let $one;
	let $two;
	beforeEach(() => {
		document.getElementById('test').innerHTML = dom;
		proxy = $(document, '#test > span').bind();
		$one = $(document, '#test > span > span:nth-child(1)');
		$two = $(document, '#test > span > span:nth-child(2)');
	});


	it('binds initial text', () => {
		proxy.foo.should.equal(' ');
	});


	it('binds changed text', () => {
		$one.text('one');
		$two.text('two');
		proxy.foo.should.equal('one');
	});

	it('changes bound text', () => {
		proxy.foo = '12';
		$one.text().should.equal('12');
		$two.text().should.equal('12');
	});
});
