const assert = require('assert');
const testUtil = require('./test-util');

module.exports = eva => {
    assert.strictEqual(eva.eval(['+', 1, 5]), 6);
    assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
    assert.strictEqual(eva.eval(['+', ['+', 3, ['+', ['+', 3, 2], 2]], 5]), 15);
    assert.strictEqual(eva.eval(['+', ['+', 3, 2], ['+', 10, 20]]), 35);
    assert.strictEqual(eva.eval(['*', ['*', 3, 2], 5]), 30);
    assert.strictEqual(eva.eval(['-', ['-', 10, 2], 5]), 3);
    assert.strictEqual(eva.eval(['/', ['/', 50, 10], 5]), 1);
};
