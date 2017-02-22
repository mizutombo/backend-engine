const errorHandler = require('../lib/error-handler')();
const assert = require('chai').assert;

describe('test error handler', () => {
	it('returns 500 when no code is provided', () => {
	    const err = new Error('some server error');
	    const res = {
	    status(code) { this.code = code; return this; },
	    send(error) { this.error = error; }
	};
	    errorHandler(err, null, res, null);
	    assert.equal(res.code, 500);
	    assert.deepEqual(res.error.error, 'internal server error');
	});
});
