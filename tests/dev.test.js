const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolvePublicPath } = require('../scripts/dev.js');

test('local preview resolves static files and rejects encoded traversal', () => {
  assert.equal(resolvePublicPath('/'), path.resolve(__dirname, '../public/index.html'));
  assert.equal(resolvePublicPath('/style.css?fresh=1'), path.resolve(__dirname, '../public/style.css'));
  assert.throws(() => resolvePublicPath('/..%2f..%2fprivate.txt'));
  assert.throws(() => resolvePublicPath('/%xx'));
});
