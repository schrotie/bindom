import $ from '../bindom.mjs';

const dom = `<span>
	<span data-bind=text:§                > </span>
	<span data-bind=attr:@data-test        ></span>
	<span data-bind=prop:.innerHTML        ><p>html</p></span>
	<span data-bind=evnt:!click            ></span>
	<span data-bind=func:addEventListener()></span>
</span>`;

class Bound {
	assert(done, what, value) {
		this.done = done;
		this.what = what;
		this.value = value;
	}
	called(what, value) {
		what.should.equal(this.what);
		if(this.value) this.value(value);
		this.done();
	}
	set text(v) {this.called('text', v);}
	set attr(v) {this.called('attr', v);}
	set prop(v) {this.called('prop', v);}
	set evnt(v) {this.called('evnt', v);}
}

describe('event propagation', () => {
	let bound;
	let $text;
	let $attr;
	let $prop;
	let $evnt;
	beforeEach(() => {
		document.getElementById('test').innerHTML = dom;
		$(document, '#test > span').bind(bound = new Bound());
		$text = $(document, '#test > span > span:nth-child(1)');
		$attr = $(document, '#test > span > span:nth-child(2)');
		$prop = $(document, '#test > span > span:nth-child(3)');
		$evnt = $(document, '#test > span > span:nth-child(4)');
	});

	it('binds changed text', done => {
		bound.assert(done, 'text');
		$text.text('test');
	});

	it('binds changed attr', done => {
		bound.assert(done, 'attr');
		$attr.attr('data-test', 'test');
	});

	it('binds changed prop', done => {
		bound.assert(done, 'prop', v => v.should.equal('test'));
		$prop.prop('innerHTML', 'test');
	});

	it('binds event', done => {
		bound.assert(done, 'evnt', ({detail}) => detail.should.equal('test'));
		$evnt.emit('click', {detail: 'test'});
	});
});
