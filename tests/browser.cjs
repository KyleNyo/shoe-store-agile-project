const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const results = [];
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
  const browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge', headless:true});
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  const check = async(name, fn) => {await fn(); results.push(name); console.log('PASS ' + name);};
  const goto = file => page.goto(base + '/' + file);
  try {
    await check('Homepage and all local navigation destinations load', async () => {
      await goto('index.html');
      assert.equal(await page.locator('#featuredProducts .product-card').count(), 3);
      const links = await page.locator('a[href]').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
      for(const link of new Set(links)) assert.equal((await context.request.get(base+'/'+link)).status(),200);
    });
    await check('Six catalogue products, loaded images, categories and combined search', async () => {
      await goto('catalog.html');
      assert.equal(await page.locator('.product-card').count(),6);
      assert.equal(await page.locator('.product-image').evaluateAll(images => images.every(i=>i.complete && i.naturalWidth>0)),true);
      for(const [category,count] of [['Sneakers',2],['Running',2],['Formal',1],['Sandals',1]]) {
        await page.selectOption('#categoryFilter',category); assert.equal(await page.locator('.product-card').count(),count);
      }
      await page.selectOption('#categoryFilter','Sneakers'); await page.fill('#productSearch',' STREE ');
      assert.equal(await page.locator('.product-card').count(),1);
      await page.fill('#productSearch','zzzz'); assert.match(await page.locator('#catalogMessage').innerText(),/No shoes match/);
      await goto('catalog.html?category=invalid'); assert.equal(await page.locator('.product-card').count(),6);
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
    await check('Integrated simulated checkout preserves total and empties cart', async () => {
      await goto('checkout.html');assert.match(await page.locator('#checkoutSummary').innerText(),/194[.,]97/);
      await page.fill('#address','Test Street 1');await page.fill('#city','Test City');await page.fill('#postal','12345');await page.fill('#cardNumber','1111222233334444');
      await page.locator('#checkoutForm button').click();await page.waitForURL('**/confirmation.html');
      assert.match(await page.locator('#orderNumber').innerText(),/194[.,]97/);
      await goto('cart.html');assert.match(await page.locator('#cartArea').innerText(),/Your cart is empty/);
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
    for(const width of [375,768,1440]) await check(`Layout and navigation at ${width}px`, async () => {
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>localStorage.setItem('ss_cart',JSON.stringify([{id:'street',size:42,qty:2}])));
      for(const file of ['index.html','catalog.html','product-detail.html?id=street','cart.html','login.html','checkout.html']) {
        await goto(file);
        const fits = await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
        if (!fits) {
          console.log(await page.locator('body *').evaluateAll(elements=>elements.filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>({tag:el.tagName,cls:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right})).slice(0,20)));
          await page.screenshot({path:path.join(root,'test-results','overflow.png'),fullPage:true});
        }
        assert.equal(fits,true, file+' overflows');
        if(width<992) {
          await page.getByRole('button',{name:'Toggle navigation'}).click();
          await page.locator('#navMenu.show').waitFor();
          assert.equal(await page.locator('#navMenu a[href="catalog.html"]').isVisible(),true);
        }
        await page.screenshot({path:path.join(root,'test-results',`${width}-${file.split('?')[0]}.png`),fullPage:true});
      }
    });
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(root,'test-results','results.json'),JSON.stringify({browser:await browser.version(),passed:results,pageErrors:errors},null,2));
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
