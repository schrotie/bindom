import {addClass, getClass, deleteClassForTest} from '../src/classRegistry.mjs';

class A {}

describe('classRegistry', function() {
	afterEach(function() {deleteClassForTest(A);});

	it('should reject unregistered class request', function(done) {
		getClass('Foo', 0).catch(function(err) {
			err.message.should
				.equal('Failed to register required class "Foo" after 0ms');
			done();
		});
	});

	it('should reject registered class', function() {
		addClass(A);
		(() => addClass(A)).should
			.throw('Cannot register class "A", because it already exists');
	});

	it('should return class when it\'s registered', function(done) {
		getClass('A').then(({Class}) => {
			Class.should.equal(A);
			done();
		});
		addClass(A);
	});

	it('should delete waiting class', function() {getClass('A');});
});
