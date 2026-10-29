const {chromium, firefox} = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const results = [];
const channel = process.env.BROWSER_CHANNEL || 'msedge';
const evidence = path.join(root, 'test-results', channel);
fs.mkdirSync(evidence,{recursive:true});
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  fs.readFile(file, (error, data) => {
    if(error) {res.writeHead(404).end(); return;}
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await (channel === 'firefox' ? firefox : chromium).launch({...(['chromium','firefox'].includes(channel) ? {} : {channel}), headless:true});
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  const check = async(name, fn) => {await fn(); results.push(name); console.log('PASS ' + name);};
  const goto = file => page.goto(base + '/' + file);
  try {
    await check('Keyboard skip links, visible focus, labelled controls and mobile menu', async () => {
      for (const file of ['index.html','catalog.html','product-detail.html?id=street','cart.html','login.html','checkout.html']) {
        await goto(file);
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true,file);
        assert.equal(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('main').evaluate(el=>el===document.activeElement),true,file);
        assert.equal(await page.locator('input:not([type=hidden]),select').evaluateAll(els=>els.every(el=>el.labels?.length || el.getAttribute('aria-label'))),true,file);
      }
      await page.setViewportSize({width:375,height:900});
      await goto('index.html');
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
      assert.equal(await page.getByRole('button',{name:'Toggle navigation'}).evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Enter');
      await page.locator('#navMenu.show').waitFor();
      assert.equal(await page.getByRole('button',{name:'Toggle navigation'}).getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('#navMenu a').first().evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Space');
      await page.locator('#navMenu.show').waitFor({state:'hidden'});
      await page.setViewportSize({width:1280,height:900});
    });
    await check('Keyboard cart quantity keeps forward focus; removal has a useful destination', async () => {
      await goto('cart.html');
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'street',size:42,qty:1},{id:'runner',size:42,qty:1}])));
      await page.reload();
      await page.locator('[data-qty="0"]').focus();
      await page.keyboard.press('ArrowUp'); await page.keyboard.press('Tab');
      assert.equal(await page.locator('[data-remove="0"]').evaluate(el=>el===document.activeElement),true);
      assert.match(await page.locator('.cart-summary').innerText(),/209[.,]97/);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-remove="0"]').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Enter');
      assert.equal(await page.getByRole('link',{name:'Shop Shoes',exact:true}).evaluate(el=>el===document.activeElement),true);
    });
    await check('Keyboard account tabs, labelled registration and login/logout focus recovery', async () => {
      await goto('login.html');
      await page.getByRole('tab',{name:'Login',exact:true}).focus();
      await page.keyboard.press('ArrowRight');
      await page.locator('#registerPane.active').waitFor();
      await page.locator('#regName').fill('Keyboard Test');
      await page.locator('#regEmail').fill('keyboard@example.test');
      await page.locator('#regPassword').fill('demo-pass-123');
      await page.locator('#registerForm button').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#logoutBtn').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Enter');
      await page.getByRole('tab',{name:'Login',exact:true}).focus(); await page.keyboard.press('Enter');
      await page.locator('#loginPane.active').waitFor();
      await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('keyboard@example.test');
      await page.locator('#loginPassword').fill('demo-pass-123');
      await page.locator('#loginPassword').press('Enter');
      assert.equal(await page.locator('#logoutBtn').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#loginEmail').evaluate(el=>el===document.activeElement),true);
      await page.evaluate(()=>localStorage.clear());
    });
    await check('Product images reserve space; missing assets retain usable cards without retry loops', async () => {
      let fallbackRequests=0;
      await page.route('**/img/street.svg',route=>route.abort());
      page.on('request',req=>{if(req.url().endsWith('/img/product-unavailable.svg')) fallbackRequests++;});
      await goto('catalog.html');
      const image=page.locator('img[alt^="Street Classic"]');
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('img[alt^="Street Classic"]').naturalWidth>0 && document.querySelector('img[alt^="Street Classic"]').dataset.fallback==='true');
      assert.match(await image.getAttribute('src'),/product-unavailable/);
      assert.equal(await image.getAttribute('width'),'800');
      assert.equal(await image.getAttribute('height'),'520');
      assert.match(await image.getAttribute('alt'),/Street Classic.*unavailable/);
      const card=image.locator('..');
      assert.match(await card.innerText(),/Street Classic/);
      assert.equal(await card.getByRole('link',{name:'View Details'}).getAttribute('href'),'product-detail.html?id=street');
      await page.route('**/img/product-unavailable.svg',route=>route.abort());
      await goto('product-detail.html?id=street');
      await page.waitForFunction(()=>document.querySelector('[data-product-image]').dataset.fallback==='true');
      assert.equal(await page.getByRole('button',{name:'Add to Cart'}).isVisible(),true);
      assert.ok(fallbackRequests<=2,'fallback retried recursively');
      await page.unroute('**/img/street.svg'); await page.unroute('**/img/product-unavailable.svg');
    });
    await check('Homepage and all local navigation destinations load', async () => {
      await goto('index.html');
      assert.equal(await page.locator('#featuredProducts .product-card').count(), 3);
      const links = await page.locator('a[href]').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
      for(const link of new Set(links)) assert.equal((await context.request.get(base+'/'+link)).status(),200);
    });
    await check('Six catalogue products, loaded images, categories and combined search', async () => {
      await goto('catalog.html');
      assert.equal(await page.locator('.product-card').count(),6);
      for (const image of await page.locator('.product-image').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(image=>image.decode()); }
      assert.equal(await page.locator('.product-image').evaluateAll(images => images.every(i=>i.complete && i.naturalWidth>0)),true);
      for(const [category,count] of [['Sneakers',2],['Running',2],['Formal',1],['Sandals',1]]) {
        await page.selectOption('#categoryFilter',category); assert.equal(await page.locator('.product-card').count(),count);
      }
      await page.selectOption('#categoryFilter','Sneakers'); await page.fill('#productSearch',' STREE ');
      assert.equal(await page.locator('.product-card').count(),1);
      await page.fill('#productSearch','zzzz'); assert.match(await page.locator('#catalogMessage').innerText(),/No shoes match/);
      await goto('catalog.html?category=invalid'); assert.equal(await page.locator('.product-card').count(),6);
    });
    await check('Price sorting preserves search/categories, default order and shared product order', async () => {
      await goto('catalog.html');
      const names = () => page.locator('#productGrid h5').allTextContents();
      const original = ['Velocity Runner','Street Classic','Oxford Essential','Summer Slide','Court Low','Trail Motion'];
      const ascending = ['Summer Slide','Street Classic','Court Low','Velocity Runner','Oxford Essential','Trail Motion'];
      const sort = page.getByRole('combobox',{name:'Sort by price'});
      assert.deepEqual(await names(),original);
      await sort.selectOption('price-asc'); assert.deepEqual(await names(),ascending);
      await sort.selectOption('price-desc'); assert.deepEqual(await names(),[...ascending].reverse());
      await page.selectOption('#categoryFilter','Sneakers');
      assert.deepEqual(await names(),['Court Low','Street Classic']);
      assert.equal(await sort.inputValue(),'price-desc');
      await page.fill('#productSearch',' street '); assert.deepEqual(await names(),['Street Classic']);
      await page.fill('#productSearch','zzzz'); assert.deepEqual(await names(),[]);
      assert.match(await page.locator('#catalogMessage').innerText(),/No shoes match/);
      await page.fill('#productSearch',''); await page.selectOption('#categoryFilter','All');
      assert.deepEqual(await names(),[...ascending].reverse());
      await sort.selectOption('default'); assert.deepEqual(await names(),original);
      await goto('catalog.html?search=shoe'); await sort.selectOption('price-asc');
      assert.deepEqual(await names(),['Velocity Runner','Oxford Essential']);
      assert.match(await page.locator('#productGrid a').first().getAttribute('href'),/product-detail.html\?id=runner/);
      assert.deepEqual(await page.evaluate(() => PRODUCTS.map(p=>p.id)),['runner','street','formal','sand','court','trail']);
      await goto('index.html');
      assert.deepEqual(await page.locator('#featuredProducts h5').allTextContents(),original.slice(0,3));
    });
    await check('Inclusive price bounds and available sizes combine with search/category/sort', async () => {
      await goto('catalog.html');
      const names = () => page.locator('#productGrid h5').allTextContents();
      assert.deepEqual(await page.locator('#sizeFilter option').evaluateAll(items=>items.map(i=>i.value)),['','38','39','40','41','42','43','44','45','46']);
      await page.getByRole('spinbutton',{name:'Minimum price (EUR)'}).fill('64.99');
      await page.getByRole('spinbutton',{name:'Maximum price (EUR)'}).fill('64.99');
      assert.deepEqual(await names(),['Street Classic']);
      await page.fill('#maxPrice','79.99'); await page.selectOption('#priceSort','price-asc');
      assert.deepEqual(await names(),['Street Classic','Court Low','Velocity Runner']);
      await page.getByRole('combobox',{name:'Shoe size (EU)'}).selectOption('39');
      assert.deepEqual(await names(),['Street Classic','Court Low']);
      await page.selectOption('#categoryFilter','Sneakers'); await page.fill('#productSearch','street');
      assert.deepEqual(await names(),['Street Classic']);
      assert.equal(await page.locator('#priceSort').inputValue(),'price-asc');
      assert.equal(await page.locator('#sizeFilter').inputValue(),'39');
      await page.fill('#productSearch',''); await page.selectOption('#categoryFilter','All');
      await page.fill('#minPrice',''); await page.fill('#maxPrice','');
      await page.selectOption('#sizeFilter','46'); assert.deepEqual(await names(),['Trail Motion']);
      await page.fill('#maxPrice','90'); assert.deepEqual(await names(),[]);
      assert.match(await page.locator('#catalogMessage').innerText(),/No shoes match/);
      await page.fill('#maxPrice',''); await page.selectOption('#sizeFilter','38');
      assert.deepEqual(await names(),['Summer Slide']);
      await page.selectOption('#sizeFilter',''); await page.fill('#maxPrice','0'); assert.deepEqual(await names(),[]);
      await page.fill('#maxPrice',''); assert.equal((await names()).length,6);
    });
    await check('Invalid prices and reversed ranges show accessible errors and recover', async () => {
      await goto('catalog.html');
      for (const [selector,value] of [['#minPrice','-1'],['#minPrice','1.001'],['#maxPrice','-0.01']]) {
        await page.fill(selector,value);
        assert.equal(await page.locator(selector).getAttribute('aria-invalid'),'true');
        assert.match(await page.locator('#catalogMessage').innerText(),/non-negative prices/);
        assert.equal(await page.locator('.product-card').count(),0);
        await page.fill(selector,'');
        assert.equal(await page.locator(selector).getAttribute('aria-invalid'),'false');
        assert.equal(await page.locator('.product-card').count(),6);
      }
      await page.fill('#minPrice','80'); await page.fill('#maxPrice','60');
      assert.match(await page.locator('#catalogMessage').innerText(),/must not exceed/);
      assert.equal(await page.locator('#minPrice').getAttribute('aria-invalid'),'true');
      assert.equal(await page.locator('#maxPrice').getAttribute('aria-invalid'),'true');
      await page.fill('#maxPrice','100');
      assert.equal(await page.locator('.product-card').count(),2);
      assert.equal(await page.locator('#minPrice').getAttribute('aria-invalid'),'false');
      await page.fill('#minPrice',''); await page.locator('#minPrice').press('e');
      assert.equal(await page.locator('#minPrice').getAttribute('aria-invalid'),'true');
      assert.match(await page.locator('#catalogMessage').innerText(),/non-negative prices/);
      await page.fill('#minPrice',''); await page.fill('#maxPrice','');
      assert.equal(await page.locator('.product-card').count(),6);
    });
    await check('Reset clears combined controls and stale URL filters without changing cart or product data', async () => {
      await goto('catalog.html?search=street&search=trail&category=Sneakers&campaign=demo#productGrid');
      const original = ['Velocity Runner','Street Classic','Oxford Essential','Summer Slide','Court Low','Trail Motion'];
      const savedCart = await page.evaluate(() => {
        const value = JSON.stringify([{id:'street',size:42,qty:2}]);
        localStorage.setItem('ss_cart',value);
        history.replaceState({demo:true},'',location.href);
        return value;
      });
      await page.selectOption('#priceSort','price-desc');
      await page.fill('#minPrice','64.99'); await page.fill('#maxPrice','79.99');
      await page.selectOption('#sizeFilter','39');
      assert.equal(await page.locator('.product-card').count(),1);
      await page.getByRole('button',{name:'Reset filters',exact:true}).click();
      for (const [id,value] of [['productSearch',''],['categoryFilter','All'],['priceSort','default'],['minPrice',''],['maxPrice',''],['sizeFilter','']]) {
        assert.equal(await page.locator('#'+id).inputValue(),value);
      }
      assert.deepEqual(await page.locator('#productGrid h5').allTextContents(),original);
      const url = new URL(page.url());
      assert.equal(url.searchParams.has('search'),false);
      assert.equal(url.searchParams.has('category'),false);
      assert.equal(url.searchParams.get('campaign'),'demo');
      assert.equal(url.hash,'#productGrid');
      assert.deepEqual(await page.evaluate(() => history.state),{demo:true});
      assert.equal(await page.evaluate(() => localStorage.getItem('ss_cart')),savedCart);
      assert.deepEqual(await page.evaluate(() => PRODUCTS.map(p=>p.name)),original);
      assert.equal(await page.locator('#catalogMessage').innerText(),'Filters reset. Showing all 6 shoes.');
      await page.reload();
      assert.deepEqual(await page.locator('#productGrid h5').allTextContents(),original);
      await page.evaluate(() => localStorage.removeItem('ss_cart'));
    });
    await check('Keyboard reset recovers from invalid ranges and no-match results at mobile width', async () => {
      await page.setViewportSize({width:375,height:900});
      await goto('catalog.html');
      const reset = page.getByRole('button',{name:'Reset filters',exact:true});
      for (const mode of ['reversed','negative','bad-input','no-match']) {
        if(mode==='reversed') {await page.fill('#minPrice','80');await page.fill('#maxPrice','60');}
        if(mode==='negative') await page.fill('#minPrice','-1');
        if(mode==='bad-input') {await page.locator('#minPrice').focus();await page.locator('#minPrice').press('e');}
        if(mode==='no-match') await page.fill('#productSearch','does-not-exist');
        assert.equal(await page.locator('.product-card').count(),0);
        await reset.focus(); await reset.press(mode==='no-match'?'Space':'Enter');
        assert.equal(await reset.evaluate(el=>el===document.activeElement),true);
        assert.equal(await page.locator('.product-card').count(),6);
        assert.equal(await page.locator('#minPrice').getAttribute('aria-invalid'),'false');
        assert.equal(await page.locator('#maxPrice').getAttribute('aria-invalid'),'false');
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.setViewportSize({width:1280,height:900});
    });
    await check('Homepage search can be reset and refined again without stale results', async () => {
      await goto('index.html');
      await page.fill('#homeSearch',' street ');
      await page.locator('#homeSearchForm').evaluate(form=>form.requestSubmit());
      await page.waitForURL('**/catalog.html?search=street');
      assert.equal(await page.locator('.product-card').count(),1);
      await page.getByRole('button',{name:'Reset filters',exact:true}).click();
      await page.reload();
      assert.equal(await page.locator('.product-card').count(),6);
      await page.selectOption('#categoryFilter','Running');
      await page.selectOption('#priceSort','price-desc');
      assert.deepEqual(await page.locator('#productGrid h5').allTextContents(),['Trail Motion','Velocity Runner']);
    });
    await check('Every product detail has correct sizes and invalid IDs are handled', async () => {
      for(const [id,count] of [['runner',6],['street',6],['formal',6],['sand',6],['court',7],['trail',7]]) {
        await goto('product-detail.html?id='+id);
        assert.equal(await page.locator('#shoeSize option').count(),count);
        assert.equal(await page.locator('#productDetail img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
      }
      for(const suffix of ['', '?id=missing']) {await goto('product-detail.html'+suffix);assert.match(await page.locator('#productDetail').innerText(),/Product not found/);}
    });
    await check('Add/merge sizes, reload persistence, quantity update, removal and exact totals', async () => {
      await goto('product-detail.html?id=street'); await page.selectOption('#shoeSize','42');
      await page.click('#addBtn'); await page.click('#addBtn');
      await page.selectOption('#shoeSize','43'); await page.click('#addBtn');
      await goto('cart.html'); await page.reload();
      assert.equal(await page.locator('tbody tr').count(),2);
      assert.match(await page.locator('.order-summary').innerText(),/194[.,]97/);
      await page.locator('[data-qty="0"]').fill('3'); await page.locator('[data-qty="0"]').press('Tab');
      assert.match(await page.locator('.order-summary').innerText(),/259[.,]96/);
      for(const value of ['1.5','0','-1','100','']) {
        await page.locator('[data-qty="0"]').fill(value); await page.locator('[data-qty="0"]').press('Tab');
        assert.equal(await page.locator('[data-qty="0"]').inputValue(),'3');
      }
      await page.locator('[data-remove="1"]').click();
      assert.equal(await page.locator('tbody tr').count(),1);
      assert.match(await page.locator('.order-summary').innerText(),/194[.,]97/);
    });
    await check('Guest checkout guard; registration, logout, invalid and valid login', async () => {
      await goto('checkout.html');assert.match(await page.locator('#checkoutGuard').innerText(),/login or register/);
      await goto('login.html');await page.locator('[data-bs-target="#registerPane"]').click();
      await page.fill('#regName','Sprint Test');await page.fill('#regEmail','sprint@example.test');await page.fill('#regPassword','demo-pass-123');
      await page.locator('#registerForm button').click();assert.equal(await page.locator('#loggedInUser').innerText(),'Sprint Test');
      await page.click('#logoutBtn');await page.locator('[data-bs-target="#loginPane"]').click();
      await page.fill('#loginEmail','sprint@example.test');await page.fill('#loginPassword','wrong');await page.locator('#loginForm button').click();
      assert.match(await page.locator('#authMessage').innerText(),/Invalid email or password/);
      await page.fill('#loginPassword','demo-pass-123');await page.locator('#loginForm button').click();
      assert.equal(await page.locator('#loggedInUser').innerText(),'Sprint Test');
    });
    await check('Checkout errors are linked, keyboard-focusable and preserve valid input and stored cart', async () => {
      await goto('checkout.html');
      const cartBefore = await page.evaluate(()=>localStorage.getItem('ss_cart'));
      const orderBefore = await page.evaluate(()=>localStorage.getItem('ss_last_order'));
      for (const id of ['fullName','checkoutEmail','address','postal','cardNumber']) await page.fill('#'+id,'');
      await page.getByLabel('City',{exact:true}).fill('Test City');
      await page.getByRole('button',{name:'Place Order',exact:true}).click();
      assert.equal(await page.locator('#checkoutErrors').evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.locator('#checkoutErrorList a').count(),5);
      assert.equal(await page.locator('#checkoutErrorsTitle').innerText(),'There are 5 problems');
      assert.equal(await page.getByLabel('City',{exact:true}).inputValue(),'Test City');
      for (const id of ['fullName','checkoutEmail','address','postal','cardNumber']) {
        assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),'true');
        assert.ok((await page.locator('#'+id).getAttribute('aria-describedby')).split(' ').includes(id+'Error'));
        assert.equal(await page.locator('#'+id+'Error').isVisible(),true);
      }
      const addressLink = page.locator('#checkoutErrorList a[href="#address"]');
      await addressLink.focus(); await addressLink.press('Enter');
      assert.equal(await page.getByLabel('Address',{exact:true}).evaluate(el=>el===document.activeElement),true);
      await page.getByLabel('Address',{exact:true}).fill('Test Street 1');
      assert.equal(await page.locator('#address').getAttribute('aria-invalid'),'false');
      assert.equal(await page.locator('#addressError').isVisible(),false);
      assert.equal(await page.locator('#checkoutErrorList a').count(),4);
      assert.equal(await page.locator('#address').evaluate(el=>el===document.activeElement),true);
      await page.getByLabel('Full name',{exact:true}).fill('Sprint Test');
      await page.getByLabel('Email',{exact:true}).fill('invalid');
      assert.match(await page.locator('#checkoutEmailError').innerText(),/name@example.com/);
      await page.getByLabel('Email',{exact:true}).fill('sprint@example.test');
      await page.getByLabel('Postal code',{exact:true}).fill('12345');
      await page.getByLabel('Card number',{exact:true}).fill('1111 2222 3333 4444');
      assert.equal(await page.locator('#checkoutErrors').isVisible(),false);
      assert.equal(await page.locator('#cardNumber').getAttribute('aria-describedby'),'simulatedPaymentHelp');
      assert.equal(await page.evaluate(()=>localStorage.getItem('ss_cart')),cartBefore);
      assert.equal(await page.evaluate(()=>localStorage.getItem('ss_last_order')),orderBefore);
    });
    await check('Checkout rejects whitespace-only fields and invalid simulated cards with mobile error recovery', async () => {
      await page.setViewportSize({width:375,height:900});
      for (const id of ['fullName','address','city','postal']) {
        const input = page.locator('#'+id);
        const original = await input.inputValue();
        await input.fill('   ');
        assert.equal(await input.getAttribute('aria-invalid'),'true');
        await input.fill(original);
        assert.equal(await input.getAttribute('aria-invalid'),'false');
      }
      for (const value of ['11112222333','11112222333344445555','1111-2222-3333','11112222333a','            ']) {
        await page.getByLabel('Card number',{exact:true}).fill(value);
        assert.equal(await page.locator('#cardNumber').getAttribute('aria-invalid'),'true');
        assert.match(await page.locator('#cardNumberError').innerText(),/12 to 19 digits/);
      }
      for (const value of ['111122223333','1111 2222 3333 4444','1111 2222 3333 4444 555']) {
        await page.getByLabel('Card number',{exact:true}).fill(value);
        assert.equal(await page.locator('#cardNumber').getAttribute('aria-invalid'),'false');
        assert.equal(await page.locator('#checkoutErrors').isVisible(),false);
      }
      await page.getByLabel('Email',{exact:true}).fill('invalid');
      await page.getByRole('button',{name:'Place Order',exact:true}).click();
      assert.equal(await page.locator('#checkoutErrorsTitle').innerText(),'There is 1 problem');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
      await page.screenshot({path:path.join(evidence,'checkout-validation-mobile.png'),fullPage:true});
      await page.locator('#checkoutErrorList a').focus();
      await page.locator('#checkoutErrorList a').press('Enter');
      assert.equal(await page.getByLabel('Email',{exact:true}).evaluate(el=>el===document.activeElement),true);
      await page.getByLabel('Email',{exact:true}).fill('sprint@example.test');
      assert.equal(await page.locator('#checkoutErrors').isVisible(),false);
      await page.getByLabel('Card number',{exact:true}).fill('1111222233334444');
      await page.getByLabel('Card number',{exact:true}).press('Enter');
      await page.waitForURL('**/confirmation.html');
      assert.match(await page.locator('#orderNumber').innerText(),/194[.,]97/);
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('ss_cart'))),[]);
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'street',size:42,qty:3}])));
      await page.setViewportSize({width:1280,height:900});
    });
    await check('Integrated simulated checkout preserves total and empties cart', async () => {
      await goto('checkout.html');assert.match(await page.locator('#checkoutSummary').innerText(),/194[.,]97/);
      await page.fill('#address','Test Street 1');await page.fill('#city','Test City');await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
      await page.locator('#checkoutForm button').click();await page.waitForURL('**/confirmation.html');
      assert.match(await page.locator('#orderNumber').innerText(),/194[.,]97/);
      await goto('cart.html');assert.match(await page.locator('#cartArea').innerText(),/Your cart is empty/);
    });
    await check('New orders retain item snapshots and printing preserves order and cart state', async () => {
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'street',size:42,qty:2},{id:'street',size:43,qty:1}])));
      await goto('checkout.html');
      await page.fill('#address','Test Street 1');await page.fill('#city','Test City');await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
      await page.locator('#checkoutForm button').click();await page.waitForURL('**/confirmation.html');
      assert.equal(await page.locator('#confirmedItems tbody tr').count(),2);
      assert.deepEqual(await page.locator('#confirmedItems tbody tr').first().locator('td').allTextContents(),['Street Classic','42','2','€64.99','€129.98']);
      assert.deepEqual(await page.locator('#confirmedItems tbody tr').nth(1).locator('td').allTextContents(),['Street Classic','43','1','€64.99','€64.99']);
      const before = await page.evaluate(()=>({order:localStorage.getItem('ss_last_order'),cart:localStorage.getItem('ss_cart')}));
      const order = JSON.parse(before.order);
      assert.deepEqual(Object.keys(order).sort(),['items','order','total']);
      assert.deepEqual(Object.keys(order.items[0]).sort(),['name','qty','size','unitPriceCents']);
      await page.evaluate(()=>{window.printCalls=0;window.print=()=>window.printCalls++;});
      const print = page.getByRole('button',{name:'Print order summary',exact:true});
      await print.focus(); await print.press('Enter');
      assert.equal(await page.evaluate(()=>window.printCalls),1);
      assert.deepEqual(await page.evaluate(()=>({order:localStorage.getItem('ss_last_order'),cart:localStorage.getItem('ss_cart')})),before);
      await page.reload();
      assert.equal(await page.locator('#confirmedItems tbody tr').count(),2);
      fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('nav').isVisible(),false);
      assert.equal(await page.locator('footer').isVisible(),false);
      assert.equal(await page.locator('.confirmation-actions').isVisible(),false);
      assert.equal(await page.locator('#confirmedItems table').isVisible(),true);
      if (channel !== 'firefox') await page.pdf({path:path.join(evidence,'order-print-preview.pdf'),format:'A4',preferCSSPageSize:true});
      await page.screenshot({path:path.join(evidence,'order-print-preview.png'),fullPage:true});
      await page.emulateMedia({media:'screen'});
    });
    await check('Legacy, absent and malformed orders never invent item details or execute saved markup', async () => {
      await page.evaluate(()=>localStorage.setItem('ss_last_order',JSON.stringify({order:'SS12345678',total:194.97})));
      await goto('confirmation.html');
      assert.match(await page.locator('#orderNumber').innerText(),/194[.,]97/);
      assert.match(await page.locator('#confirmedItems').innerText(),/Item details are unavailable/);
      assert.equal(await page.getByRole('button',{name:'Print order summary'}).isVisible(),true);
      for (const value of ['{broken','null','{}','[]',JSON.stringify({order:'SS123',total:-1})]) {
        await page.evaluate(value=>localStorage.setItem('ss_last_order',value),value);await page.reload();
        assert.equal(await page.locator('#confirmationTitle').innerText(),'No saved order');
        assert.equal(await page.locator('#printOrder').isVisible(),false);
        assert.equal(await page.locator('#confirmedItems tbody tr').count(),0);
      }
      await page.evaluate(()=>localStorage.setItem('ss_last_order',JSON.stringify({order:'SS123',total:1,items:[{name:'<img src=x onerror=alert(1)>',size:42,qty:1,unitPriceCents:100}]})));
      await page.reload();
      assert.equal(await page.locator('#confirmedItems img').count(),0);
      assert.match(await page.locator('#confirmedItems td').first().innerText(),/<img/);
      await page.evaluate(()=>localStorage.setItem('ss_last_order',JSON.stringify({order:'SS123',total:5,items:[{name:'Example',size:42,qty:1,unitPriceCents:100}]})));
      await page.reload();
      assert.equal(await page.locator('#confirmedItems table').count(),0);
      assert.match(await page.locator('#confirmedItems').innerText(),/Item details are unavailable/);
    });
    await check('Long order print layout repeats table headers and mobile confirmation does not overflow', async () => {
      await page.evaluate(()=>localStorage.setItem('ss_last_order',JSON.stringify({order:'SS12345678',total:6499,items:Array.from({length:100},(_,i)=>({name:`Test shoe ${i+1}`,size:42,qty:1,unitPriceCents:6499}))})));
      await page.reload();
      await page.setViewportSize({width:375,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.order-items thead').evaluate(el=>getComputedStyle(el).display),'table-header-group');
      assert.equal(await page.locator('.order-items tbody tr').first().evaluate(el=>getComputedStyle(el).breakInside),'avoid');
      if (channel !== 'firefox') await page.pdf({path:path.join(evidence,'order-print-long-preview.pdf'),format:'A4',preferCSSPageSize:true});
      await page.emulateMedia({media:'screen'});
      await page.setViewportSize({width:1280,height:900});
      await goto('cart.html');
    });
    await check('Malformed saved cart cannot break navigation or target the wrong row', async () => {
      for(const value of ['{broken', '{}', 'null']) {
        await page.evaluate(value=>localStorage.setItem('ss_cart',value),value);await page.reload();
        assert.match(await page.locator('#cartArea').innerText(),/Your cart is empty/);
      }
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'missing',size:42,qty:1},{id:'street',size:42,qty:1}])));
      await page.reload();await page.locator('[data-qty="0"]').fill('2');await page.locator('[data-qty="0"]').press('Tab');
      assert.match(await page.locator('.order-summary').innerText(),/129[.,]98/);
      await page.locator('[data-remove="0"]').click();assert.match(await page.locator('#cartArea').innerText(),/Your cart is empty/);
    });
    fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
    await check('Two-tab checkout rejects changed carts and permits reviewed retry', async () => {
      await goto('cart.html');
      await page.evaluate(() => {
        localStorage.setItem('ss_user', JSON.stringify({name:'Checkout Test',email:'checkout@example.test'}));
        localStorage.setItem('ss_cart', JSON.stringify([{id:'street',size:42,qty:1}]));
      });
      await goto('checkout.html');
      await page.fill('#address','Test Street 1');await page.fill('#city','Test City');
      await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
      const previousOrder = await page.evaluate(() => localStorage.getItem('ss_last_order'));
      const other = await context.newPage();
      try {
        await other.goto(base+'/cart.html');
        await other.locator('[data-qty="0"]').fill('2');await other.locator('[data-qty="0"]').press('Tab');
        await page.locator('#checkoutForm button').click();
        assert.match(page.url(),/checkout.html$/);
        assert.match(await page.locator('#checkoutGuard').innerText(),/cart has changed/);
        assert.equal(await page.locator('#checkoutGuard').evaluate(el => el === document.activeElement),true);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ss_cart'))[0].qty),2);
        assert.equal(await page.evaluate(() => localStorage.getItem('ss_last_order')),previousOrder);
        await page.setViewportSize({width:375,height:900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth),true);
        await page.screenshot({path:path.join(root,'test-results','checkout-stale-cart.png'),fullPage:true});
        await page.locator('#checkoutGuard a').click();
        await page.locator('a[href="checkout.html"]').click();
        assert.match(await page.locator('#checkoutSummary').innerText(),/129[.,]98/);
        await page.fill('#address','Test Street 1');await page.fill('#city','Test City');
        await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
        await page.locator('#checkoutForm button').click();await page.waitForURL('**/confirmation.html');
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ss_last_order')).total),129.98);
      } finally { await other.close(); }
    });
    await check('Two-tab logout blocks checkout without changing cart or previous order', async () => {
      await page.evaluate(() => localStorage.setItem('ss_cart', JSON.stringify([{id:'street',size:42,qty:1}])));
      await goto('checkout.html');
      await page.fill('#address','Test Street 1');await page.fill('#city','Test City');
      await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
      const previousOrder = await page.evaluate(() => localStorage.getItem('ss_last_order'));
      const other = await context.newPage();
      try {
        await other.goto(base+'/login.html');await other.click('#logoutBtn');
        await page.locator('#checkoutForm button').click();
        assert.match(page.url(),/checkout.html$/);
        assert.match(await page.locator('#checkoutGuard').innerText(),/account has changed/);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ss_cart'))[0].qty),1);
        assert.equal(await page.evaluate(() => localStorage.getItem('ss_last_order')),previousOrder);
        assert.equal(await page.locator('#checkoutGuard a').getAttribute('href'),'login.html');
      } finally { await other.close(); }
      await page.evaluate(() => localStorage.setItem('ss_user', JSON.stringify({name:'Checkout Test',email:'checkout@example.test'})));
    });
    for(const width of [375,768,1440]) await check(`Layout and navigation at ${width}px`, async () => {
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'street',size:42,qty:2}])));
      for(const file of ['index.html','catalog.html','product-detail.html?id=street','cart.html','login.html','checkout.html']) {
        await goto(file);
        const fits = await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
        if (!fits) {
          console.log(await page.locator('body *').evaluateAll(elements=>elements.filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>({tag:el.tagName,cls:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right})).slice(0,20)));
          await page.screenshot({path:path.join(evidence,'overflow.png'),fullPage:true});
        }
        assert.equal(fits,true, file+' overflows');
        if(width<992) {
          await page.getByRole('button',{name:'Toggle navigation'}).click();
          await page.locator('#navMenu.show').waitFor();
          assert.equal(await page.locator('#navMenu a[href="catalog.html"]').isVisible(),true);
        }
        await page.screenshot({path:path.join(evidence,`${width}-${file.split('?')[0]}.png`),fullPage:true});
      }
    });
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify({browser:await browser.version(),passed:results,pageErrors:errors},null,2));
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
