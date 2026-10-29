const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function checkout() {
  const originalCart = [{ id: 'street', size: 42, qty: 1 }];
  const account = { name: 'Checkout Test', email: 'checkout@example.test' };
  const savedOrder = { order: 'previous', total: 12 };
  const data = new Map(Object.entries({ ss_cart: originalCart, ss_user: account, ss_last_order: savedOrder })
    .map(([key, value]) => [key, JSON.stringify(value)]));
  const elements = Object.fromEntries(['checkoutForm', 'checkoutGuard', 'checkoutContent', 'fullName',
    'checkoutEmail', 'checkoutSummary', 'cardNumber', 'address', 'city', 'postal',
    'checkoutErrors', 'checkoutErrorList', 'checkoutErrorsTitle'].map(id => [id, {
      id, style: {}, value: id === 'cardNumber' ? '1111222233334444' : 'Test', innerHTML: '',
      validity: { typeMismatch: false }, classList: { toggle() {} },
      setAttribute() {}, getAttribute() { return ''; }, removeAttribute() {},
      after() {}, addEventListener() {}, replaceChildren() {}, focus() {}
    }]));
  const location = { href: 'checkout.html' };
  const context = vm.createContext({ Intl, URLSearchParams, location, alert() {},
    localStorage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) },
    document: { addEventListener() {}, createElement: () => ({}), getElementById: id => elements[id], querySelectorAll: () => [], querySelector: () => null }
  });
  vm.runInContext(fs.readFileSync('js/app.js', 'utf8'), context);
  vm.runInContext('initCheckout()', context);
  return { data, elements, location, savedOrder,
    run: expression => vm.runInContext(expression, context),
    set: (key, value) => data.set(key, JSON.stringify(value)),
    get: key => JSON.parse(data.get(key)),
    submit: () => elements.checkoutForm.onsubmit({ preventDefault() {} }) };
}

for (const key of ['ss_last_order','ss_cart']) {
  test(`checkout preserves the cart and previous order if saving ${key} fails`, () => {
    const app = checkout();
    app.run(`const originalWrite = localStorage.setItem; let failOnce = true;
      localStorage.setItem = (key,value) => {
        if (key === '${key}' && failOnce) { failOnce = false; throw new Error('Full'); }
        originalWrite(key,value);
      };`);
    app.submit();
    assert.equal(app.location.href,'checkout.html');
    assert.equal(app.get('ss_cart')[0].qty,1);
    assert.deepEqual(app.get('ss_last_order'),app.savedOrder);
    assert.match(app.elements.checkoutGuard.textContent,/could not be saved/);
    app.submit();
    assert.equal(app.location.href,'confirmation.html');
    assert.deepEqual(app.get('ss_cart'),[]);
  });
}

test('failed checkout rollback blocks retry and reports the incomplete state', () => {
  const app=checkout();
  app.run(`const originalWrite = localStorage.setItem; let wroteOrder = false;
    localStorage.setItem = (key,value) => {
      if (wroteOrder) throw new Error('Unavailable');
      originalWrite(key,value); wroteOrder = true;
    };`);
  app.submit();
  assert.equal(app.location.href,'checkout.html');
  assert.equal(app.get('ss_cart')[0].qty,1);
  assert.match(app.elements.checkoutGuard.innerHTML,/previous order record could not be restored/);
  const saved=app.get('ss_last_order');
  app.submit();
  assert.deepEqual(app.get('ss_last_order'),saved);
  assert.equal(app.location.href,'checkout.html');
});

for (const [name, changedCart] of [
  ['quantity changed', [{ id: 'street', size: 42, qty: 2 }]],
  ['size changed', [{ id: 'street', size: 43, qty: 1 }]],
  ['product added', [{ id: 'street', size: 42, qty: 1 }, { id: 'runner', size: 42, qty: 1 }]],
  ['cart emptied', []],
  ['cart corrupted', { invalid: true }]
]) {
  test(`checkout refuses a stale order when ${name}`, () => {
    const app = checkout();
    app.set('ss_cart', changedCart);
    app.submit();
    assert.equal(app.location.href, 'checkout.html');
    assert.deepEqual(app.get('ss_cart'), changedCart);
    assert.deepEqual(app.get('ss_last_order'), app.savedOrder);
    assert.match(app.elements.checkoutGuard.innerHTML, /cart.*changed/i);
  });
}

for (const account of [null, { name: 'Other', email: 'other@example.test' }]) {
  test(`checkout refuses an order after ${account ? 'account switch' : 'logout'}`, () => {
    const app = checkout();
    app.set('ss_user', account);
    app.submit();
    assert.equal(app.location.href, 'checkout.html');
    assert.equal(app.get('ss_cart').length, 1);
    assert.deepEqual(app.get('ss_last_order'), app.savedOrder);
    assert.match(app.elements.checkoutGuard.innerHTML, /account.*changed/i);
  });
}

test('unchanged checkout stores the displayed total and clears the cart once', () => {
  const app = checkout();
  app.submit();
  assert.equal(app.location.href, 'confirmation.html');
  assert.equal(app.get('ss_last_order').total, 64.99);
  assert.deepEqual(app.get('ss_cart'), []);
  const firstOrder = app.get('ss_last_order');
  app.location.href = 'checkout.html';
  app.submit();
  assert.equal(app.location.href, 'checkout.html');
  assert.deepEqual(app.get('ss_last_order'), firstOrder);
});
