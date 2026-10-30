const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function app(initial) {
  const data = new Map([['ss_cart', JSON.stringify(initial)]]);
  const context = vm.createContext({Intl, URLSearchParams, alert() {}, localStorage: {
    getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value)
  }, document: {addEventListener() {}, querySelectorAll: () => [], querySelector: () => null}});
  vm.runInContext(fs.readFileSync('js/app.js', 'utf8'), context);
  return expression => { const result = vm.runInContext(expression, context); return result === undefined ? undefined : JSON.parse(JSON.stringify(result)); };
}
test('valid persisted cart survives and counts separate sizes', () => {
  const run = app([{id:'street',size:42,qty:2}]);
  run("addToCart('street', '42')");
  run("addToCart('street', '43')");
  assert.deepEqual(run('cart()'), [{id:'street',size:42,qty:3},{id:'street',size:43,qty:1}]);
});
test('quantity edit refuses a removed row without changing the remaining cart', () => {
  const run=app([{id:'runner',size:40,qty:2}]);
  assert.equal(run("updateCartQuantity('street',42,1,3)"),'changed');
  assert.deepEqual(run('cart()'),[{id:'runner',size:40,qty:2}]);
});
test('quantity edit refuses a newer saved quantity and permits reviewed retry', () => {
  const run=app([{id:'street',size:42,qty:4},{id:'runner',size:40,qty:2}]);
  assert.equal(run("updateCartQuantity('street',42,1,3)"),'changed');
  assert.equal(run('cart()[0].qty'),4);
  assert.equal(run("updateCartQuantity('street',42,4,3)"),'updated');
  assert.deepEqual(run('cart()'),[{id:'street',size:42,qty:3},{id:'runner',size:40,qty:2}]);
});
test('failed quantity save preserves the stored quantity', () => {
  const run=app([{id:'street',size:42,qty:1}]);
  run("localStorage.setItem=()=>{throw new Error('Full')}; undefined");
  assert.equal(run("updateCartQuantity('street',42,1,3)"),'save-failed');
  assert.equal(run('cart()[0].qty'),1);
});
test('invalid quantity edits cannot change stored data', () => {
  const run=app([{id:'street',size:42,qty:1}]);
  for(const qty of [0,-1,1.5,100]) assert.equal(run(`updateCartQuantity('street',42,1,${qty})`),'invalid');
  assert.equal(run('cart()[0].qty'),1);
});
test('non-array saved data recovers to an empty cart', () => assert.deepEqual(app({bad:true})('cart()'), []));
test('unknown products, invalid sizes and quantities are rejected', () => {
  const run = app([{id:'missing',size:42,qty:1},{id:'street',size:'<img>',qty:1},{id:'street',size:42,qty:1.5},{id:'street',size:43,qty:-1},{id:'runner',size:42,qty:2}]);
  assert.deepEqual(run('cart()'), [{id:'runner',size:42,qty:2}]);
});
test('adding an unavailable product or size cannot corrupt the cart', () => {
  const run = app([]);
  run("addToCart('missing',42)"); run("addToCart('street',100)");
  assert.deepEqual(run('cart()'), []);
});

test('undo restores the exact size, quantity, position and total once', () => {
  const initial = [{id:'runner',size:40,qty:1},{id:'street',size:42,qty:2},{id:'street',size:43,qty:1}];
  const run = app(initial);
  const total = run('totalPrice(cartRows())');
  assert.equal(run("removeCartItem('street',42)"),true);
  assert.deepEqual(run('cart()'),[initial[0],initial[2]]);
  assert.equal(run('undoCartRemoval()'),'restored');
  assert.deepEqual(run('cart()'),initial);
  assert.equal(run('totalPrice(cartRows())'),total);
  assert.equal(run('undoCartRemoval()'),'unavailable');
  assert.deepEqual(run('cart()'),initial);
});

test('last-item removal is recoverable; only the latest removal is restored', () => {
  const run = app([{id:'street',size:42,qty:2},{id:'runner',size:40,qty:1}]);
  run("removeCartItem('street',42)");
  run("removeCartItem('runner',40)");
  assert.deepEqual(run('cart()'),[]);
  assert.equal(run('undoCartRemoval()'),'restored');
  assert.deepEqual(run('cart()'),[{id:'runner',size:40,qty:1}]);
});

for (const [name, change] of [
  ['another cart update', "write('ss_cart',[{id:'trail',size:46,qty:3}])"],
  ['malformed saved cart', "localStorage.setItem('ss_cart','{broken')"],
  ['account switch', "write('ss_user',{name:'Other',email:'other@example.test'})"],
  ['logout', "write('ss_user',null)"],
  ['a completed order in another tab', "write('ss_last_order',{order:'new',total:64.99})"]
]) {
  test(`undo refuses to overwrite ${name}`, () => {
    const run = app([{id:'street',size:42,qty:2}]);
    run("write('ss_user',{name:'Test',email:'test@example.test'})");
    run("removeCartItem('street',42)");
    run(change);
    const before = run("[localStorage.getItem('ss_cart'),localStorage.getItem('ss_user'),localStorage.getItem('ss_last_order')]");
    assert.equal(run('undoCartRemoval()'),'changed');
    assert.deepEqual(run("[localStorage.getItem('ss_cart'),localStorage.getItem('ss_user'),localStorage.getItem('ss_last_order')]"),before);
    assert.equal(run('undoCartRemoval()'),'unavailable');
  });
}

test('removing an absent row leaves current cart intact', () => {
  const initial = [{id:'street',size:42,qty:2}];
  const run = app(initial);
  assert.equal(run("removeCartItem('street',43)"),false);
  assert.deepEqual(run('cart()'),initial);
  assert.equal(run('undoCartRemoval()'),'unavailable');
});

test('failed cart writes preserve saved items and do not create Undo', () => {
  const initial = [{id:'street',size:42,qty:2}];
  const run = app(initial);
  run("localStorage.setItem = () => { throw new Error('Storage full'); }; void 0");
  run("addToCart('runner',42)");
  assert.equal(run("removeCartItem('street',42)"),false);
  assert.deepEqual(run('cart()'),initial);
  assert.equal(run('undoCartRemoval()'),'unavailable');
});

test('failed Undo can be retried without losing or duplicating the removed item', () => {
  const initial = [{id:'street',size:42,qty:2}];
  const run = app(initial);
  run("removeCartItem('street',42)");
  run("const originalSetItem = localStorage.setItem; localStorage.setItem = () => { throw new Error('Storage full'); }; void 0");
  assert.equal(run('undoCartRemoval()'),'save-failed');
  assert.deepEqual(run('cart()'),[]);
  run('localStorage.setItem = originalSetItem; void 0');
  assert.equal(run('undoCartRemoval()'),'restored');
  assert.deepEqual(run('cart()'),initial);
  assert.equal(run('undoCartRemoval()'),'unavailable');
});
