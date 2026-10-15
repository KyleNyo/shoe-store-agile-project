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
