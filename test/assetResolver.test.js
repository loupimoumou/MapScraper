const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getAddonRoots, createResolver } = require('../lib/assetResolver');

function makeTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-'));
  fs.mkdirSync(path.join(root, 'materials'), { recursive: true });
  fs.mkdirSync(path.join(root, 'addons', 'b_addon', 'materials'), { recursive: true });
  fs.mkdirSync(path.join(root, 'addons', 'a_addon', 'materials'), { recursive: true });
  return root;
}

test('getAddonRoots: base first then addons sorted alpha', () => {
  const root = makeTree();
  const roots = getAddonRoots(root);
  assert.deepStrictEqual(roots, [
    root,
    path.join(root, 'addons', 'a_addon'),
    path.join(root, 'addons', 'b_addon'),
  ]);
});

test('getAddonRoots: base-only when no addons dir', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-'));
  assert.deepStrictEqual(getAddonRoots(root), [root]);
});

test('resolveAsset: base wins over addon (first found)', () => {
  const root = makeTree();
  fs.writeFileSync(path.join(root, 'materials', 'foo.vmt'), 'base');
  fs.writeFileSync(path.join(root, 'addons', 'a_addon', 'materials', 'foo.vmt'), 'addon');
  const resolve = createResolver(getAddonRoots(root));
  assert.strictEqual(resolve(path.join('materials', 'foo.vmt')), path.join(root, 'materials', 'foo.vmt'));
});

test('resolveAsset: found only in addon', () => {
  const root = makeTree();
  fs.writeFileSync(path.join(root, 'addons', 'b_addon', 'materials', 'bar.vmt'), 'addon');
  const resolve = createResolver(getAddonRoots(root));
  assert.strictEqual(resolve(path.join('materials', 'bar.vmt')), path.join(root, 'addons', 'b_addon', 'materials', 'bar.vmt'));
});

test('resolveAsset: returns null when nowhere', () => {
  const root = makeTree();
  const resolve = createResolver(getAddonRoots(root));
  assert.strictEqual(resolve(path.join('materials', 'missing.vmt')), null);
});
