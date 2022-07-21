import parse from '../src/parse.mjs';

describe('parse', function() {
	afterEach(function() {document.getElementById('test').innerHTML = '';});
	function test(...binding) {return function() {
		const div = binding.map(binding => {
			const div = document.createElement('div');
			div.setAttribute('data-bind', binding);
			return div;
		});
		return parse([], div, {});
	};}

	it('should reject bindings without exactly one colon', function() {
		test('a').should
			.throw('Invalid binding "a"; expecting "key:domBindExpression"');
		test('a:b:c').should
			.throw('Invalid binding "a:b:c"; expecting "key:domBindExpression"');
	});

	it('should reject bindings without supported target prefix', function() {
		test('a:b').should
			.throw(`Invalid DOM-bind-expression "b"; \
expecting ".property" or "!event" or "@attribute" or "§" (for text)`);
	});

	it('should reject inconsistent bindings', function() {
		test('a:§', 'a.b:§').should.throw(
			'Inconsistent binding for a.b; EITHER nested object OR binding',
		);
		test('a.b:§', 'a:§').should.throw(
			'Inconsistent binding for a; EITHER nested object OR binding',
		);
	});
});
