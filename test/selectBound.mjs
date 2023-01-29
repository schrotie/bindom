import $ from '../bindom.mjs';
import {addClass, deleteClassForTest}  from '../src/classRegistry.mjs';

import selectBound from '../src/selectBound.mjs';

describe('selectBound', function() {
	class A {}
	before(() => addClass(A));
	after(() => deleteClassForTest(A));
	afterEach(function() {document.getElementById('test').innerHTML = '';});

	function test(template, ...expectBound) {
		document.getElementById('test').innerHTML = template;
		const bound = selectBound($(document.getElementById('test').children));
		expectBound.length.should.equal(bound.length);
		for(const [idx, tag] of expectBound.entries()) {
			bound[idx].tagName.should.equal(tag);
		}
	}

	it('should select bound host nodes', function() {
		test(/* html */`<div data-class=A data-bind=a:.a></div>`, 'DIV');
	});

	it('should not select not-bound host nodes', function() {
		test(/* html */`<div data-class=A></div>`);
	});

	// Yes, it SHOULD select parent-bound host nodes! See test case bind-dom
	// "updates nested loop in if" for a valid case.
	// it('should not select parent-bound host nodes', function() {
	// 	test(/* html */`<div data-class=A data-bind=^a:.a></div>`);
	// });

	it('should not select non-parent-bound scoped nodes', function() {
		test(/* html */`<div><span data-class=A data-bind=a:.a></span></div>`);
	});

	it('should select parent-bound bound host nodes', function() {
		test(/* html */`<div data-class=A data-bind=^a:.a;a:.a></div>`, 'DIV');
	});

	it('should select parent-bound scoped nodes', function() {
		test(/* html */`<div>
			<span data-class=A data-bind=^a:.a;a:.a></span>
		</div>`, 'SPAN');	});

	it('should not select non-parent-bound scoped nodes', function() {
		test(/* html */`<div><span data-class=A data-bind=a:.a></span></div>`);
	});

	it('should not select nested scoped nodes', function() {
		test(/* html */`<div><span data-class=A>
			<a data-bind=^a:.a></a>
		</span></div>`);
	});

	it('should select unscoped children', function() {
		test(/* html */`<div><span data-bind=a:.a></span></div>`, 'SPAN');
	});
});
