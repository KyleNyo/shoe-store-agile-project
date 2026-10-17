
"use strict";

const PRODUCTS = [
  { id: "runner", name: "Velocity Runner", category: "Running", price: 79.99, image: "img/runner.svg", description: "Lightweight running shoe with cushioned support.", sizes: [40, 41, 42, 43, 44, 45] },
  { id: "street", name: "Street Classic", category: "Sneakers", price: 64.99, image: "img/street.svg", description: "Clean everyday sneaker with a comfortable fit.", sizes: [39, 40, 41, 42, 43, 44] },
  { id: "formal", name: "Oxford Essential", category: "Formal", price: 89.99, image: "img/formal.svg", description: "Smart lace-up shoe for work and formal occasions.", sizes: [40, 41, 42, 43, 44, 45] },
  { id: "sand", name: "Summer Slide", category: "Sandals", price: 39.99, image: "img/sand.svg", description: "Easy, lightweight sandal for warm days.", sizes: [38, 39, 40, 41, 42, 43] },
  { id: "court", name: "Court Low", category: "Sneakers", price: 69.99, image: "img/court.svg", description: "Low-profile sneaker inspired by classic court style.", sizes: [39, 40, 41, 42, 43, 44, 45] },
  { id: "trail", name: "Trail Motion", category: "Running", price: 94.99, image: "img/trail.svg", description: "Grippy outdoor trainer built for mixed terrain.", sizes: [40, 41, 42, 43, 44, 45, 46] }
];

const euro = n => new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(n);

const read = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const user = () => read("ss_user", null);
const MAX_QUANTITY = 99;

function cart() {
  const stored = read("ss_cart", []);
  if (!Array.isArray(stored)) return [];

  const valid = [];

  for (const item of stored) {
    if (!item || typeof item !== "object") continue;

    const product = PRODUCTS.find(p => p.id === item.id);
    const size = Number(item.size);

    if (!product || !product.sizes.includes(size) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > MAX_QUANTITY) continue;

    const existing = valid.find(row => row.id === item.id && row.size === size);

    if (existing) {
      existing.qty = Math.min(MAX_QUANTITY, existing.qty + item.qty);
    } else {
      valid.push({ id: product.id, size, qty: item.qty });
    }
  }

  return valid;
}

const subtotalCents = row => Math.round(row.p.price * 100) * row.qty;
const totalPrice = rows => rows.reduce((sum, row) => sum + subtotalCents(row), 0) / 100;

function updateNav() {
  const c = cart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(e => e.textContent = c);

  const a = document.querySelector("[data-auth-link]");
  if (a) a.textContent = user() ? "Account" : "Login";
}

function card(p) {
  return `<div class="col-sm-6 col-lg-4"><div class="product-card"><img class="product-image" src="${p.image}" alt="${p.name}"><div class="card-body"><span class="badge badge-orange">${p.category}</span><h5 class="mt-2">${p.name}</h5><p class="text-muted">${p.description}</p><div class="d-flex justify-content-between align-items-center"><span class="price">${euro(p.price)}</span><a class="btn btn-outline-primary btn-sm" href="product-detail.html?id=${p.id}">View Details</a></div></div></div></div>`;
}

function addToCart(id, size) {
  const product = PRODUCTS.find(p => p.id === id);
  size = Number(size);

  if (!product || !product.sizes.includes(size)) return;

  const c = cart();
  const existing = c.find(item => item.id === id && item.size === size);

  if (existing && existing.qty >= MAX_QUANTITY) {
    alert(`You can add up to ${MAX_QUANTITY} pairs of each size.`);
    return;
  }

  if (existing) existing.qty++;
  else c.push({ id, size, qty: 1 });

  write("ss_cart", c);
  updateNav();
  alert("Added to cart.");
}

function initHomeSearch() {
  const form = document.getElementById("homeSearchForm");
  const input = document.getElementById("homeSearch");

  if (!form || !input) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const searchTerm = input.value.trim();

    if (searchTerm) {
      window.location.href = "catalog.html?search=" + encodeURIComponent(searchTerm);
    }
  });
}

function renderHome() {
  const el = document.getElementById("featuredProducts");
  if (el) el.innerHTML = PRODUCTS.slice(0, 3).map(card).join("");
}

function renderCatalog() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const search = document.getElementById("productSearch");
  const filter = document.getElementById("categoryFilter");

  const q = new URLSearchParams(location.search).get("category");

  if (q && [...filter.options].some(option => option.value === q)) {
    filter.value = q;
  }

  const searchQuery = new URLSearchParams(location.search).get("search");

  if (searchQuery) {
    search.value = searchQuery;
  }

  const run = () => {
    const term = search.value.trim().toLowerCase();
    const cat = filter.value;

    const list = PRODUCTS.filter(p =>
      (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    );

    grid.innerHTML = list.map(card).join("");

    document.getElementById("catalogMessage").innerHTML = list.length
      ? ""
      : '<div class="alert alert-warning">No shoes match your search.</div>';
  };

  search.addEventListener("input", run);
  filter.addEventListener("change", run);
  run();
}

function renderDetail() {
  const el = document.getElementById("productDetail");
  if (!el) return;

  const p = PRODUCTS.find(x => x.id === new URLSearchParams(location.search).get("id"));

  if (!p) {
    el.innerHTML = '<div class="alert alert-warning">Product not found.</div>';
    return;
  }

  el.innerHTML = `<div class="row g-4"><div class="col-md-6"><img src="${p.image}" class="img-fluid rounded" alt="${p.name}"></div><div class="col-md-6"><span class="badge badge-orange">${p.category}</span><h2 class="mt-2">${p.name}</h2><p>${p.description}</p><p class="price">${euro(p.price)}</p><label class="form-label" for="shoeSize">Size</label><select id="shoeSize" class="form-select mb-3">${p.sizes.map(s => `<option>${s}</option>`).join("")}</select><button id="addBtn" class="btn btn-primary">Add to Cart</button></div></div>`;

  document.getElementById("addBtn").onclick = () => addToCart(p.id, document.getElementById("shoeSize").value);
}

function initAuth() {
  const lf = document.getElementById("loginForm");
  if (!lf) return;

  const forms = document.getElementById("authForms");
  const area = document.getElementById("loggedInArea");
  const msg = document.getElementById("authMessage");

  const refresh = () => {
    const u = user();
    forms.style.display = u ? "none" : "block";
    area.style.display = u ? "block" : "none";

    if (u) {
      document.getElementById("loggedInUser").textContent = u.name;
      document.getElementById("loggedInEmail").textContent = u.email;
    }
  };

  document.getElementById("registerForm").onsubmit = e => {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    if (read("ss_users", []).some(x => x.email === email)) {
      msg.innerHTML = '<div class="alert alert-danger">An account with that email already exists.</div>';
      return;
    }

    const users = read("ss_users", []);
    users.push({ name, email, password });

    write("ss_users", users);
    write("ss_user", { name, email });

    msg.innerHTML = '<div class="alert alert-success">Account created.</div>';
    updateNav();
    refresh();
  };

  lf.onsubmit = e => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const found = read("ss_users", []).find(x => x.email === email && x.password === password);

    if (!found) {
      msg.innerHTML = '<div class="alert alert-danger">Invalid email or password.</div>';
      return;
    }

    write("ss_user", { name: found.name, email: found.email });

    msg.innerHTML = '<div class="alert alert-success">Signed in successfully.</div>';
    updateNav();
    refresh();
  };

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("ss_user");
    msg.innerHTML = '<div class="alert alert-success">You have logged out.</div>';
    updateNav();
    refresh();
  };

  refresh();
}

function cartRows() {
  return cart().map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return { ...i, p };
  }).filter(x => x.p);
}

function renderCart() {
  const el = document.getElementById("cartArea");
  if (!el) return;

  const rows = cartRows();

  if (!rows.length) {
    el.innerHTML = '<div class="empty-state"><h4>Your cart is empty</h4><p>Add a pair of shoes to get started.</p><a href="catalog.html" class="btn btn-primary">Shop Shoes</a></div>';
    return;
  }

  el.innerHTML = `<p id="cartMessage" role="status" aria-live="polite"></p><div class="table-responsive"><table class="table align-middle"><thead><tr><th scope="col">Product</th><th scope="col">Size</th><th scope="col">Price</th><th scope="col">Quantity</th><th scope="col">Subtotal</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>${rows.map((row, index) => `<tr><td><a href="product-detail.html?id=${row.id}">${row.p.name}</a></td><td>${row.size}</td><td>${euro(row.p.price)}</td><td><input class="form-control cart-quantity" aria-label="Quantity for ${row.p.name}, size ${row.size}" type="number" min="1" max="${MAX_QUANTITY}" step="1" value="${row.qty}" data-qty="${index}"></td><td>${euro(subtotalCents(row) / 100)}</td><td><button class="btn btn-sm btn-outline-danger" aria-label="Remove ${row.p.name}, size ${row.size}" data-remove="${index}">Remove</button></td></tr>`).join("")}</tbody></table></div><div class="d-flex justify-content-end"><div class="order-summary cart-summary"><h5>Total: ${euro(totalPrice(rows))}</h5><a href="checkout.html" class="btn btn-primary w-100 mt-2">Proceed to Checkout</a></div></div>`;

  el.querySelectorAll("[data-qty]").forEach(input => input.onchange = () => {
    const quantity = Number(input.value);
    const selected = rows[Number(input.dataset.qty)];

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      input.value = selected.qty;
      document.getElementById("cartMessage").textContent = `Enter a whole number from 1 to ${MAX_QUANTITY}.`;
      return;
    }

    const current = cart();
    const item = current.find(row => row.id === selected.id && row.size === selected.size);

    if (item) item.qty = quantity;

    write("ss_cart", current);
    renderCart();
    updateNav();
  });

  el.querySelectorAll("[data-remove]").forEach(button => button.onclick = () => {
    const selected = rows[Number(button.dataset.remove)];

    write("ss_cart", cart().filter(row => row.id !== selected.id || row.size !== selected.size));

    renderCart();
    updateNav();
  });
}

function initCheckout() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const u = user();
  const c = cartRows();
  const guard = document.getElementById("checkoutGuard");
  const content = document.getElementById("checkoutContent");

  if (!u) {
    content.style.display = "none";
    guard.innerHTML = '<div class="alert alert-warning">You must <a href="login.html">login or register</a> before checkout.</div>';
    return;
  }

  if (!c.length) {
    content.style.display = "none";
    guard.innerHTML = '<div class="alert alert-warning">Your cart is empty. <a href="catalog.html">Shop shoes</a>.</div>';
    return;
  }

  document.getElementById("fullName").value = u.name;
  document.getElementById("checkoutEmail").value = u.email;

  const total = totalPrice(c);

  document.getElementById("checkoutSummary").innerHTML = `<h5>Order Summary</h5>${c.map(x => `<div class="d-flex justify-content-between"><span>${x.p.name} × ${x.qty}</span><span>${euro(subtotalCents(x) / 100)}</span></div>`).join("")}<hr><div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${euro(total)}</span></div>`;

  form.onsubmit = e => {
    e.preventDefault();

    const num = document.getElementById("cardNumber").value.replace(/\s/g, "");

    if (!/^\d{12,19}$/.test(num)) {
      alert("Please enter a valid simulated card number.");
      return;
    }

    const order = "SS" + Date.now().toString().slice(-8);

    const items = c.map(row => ({
      name: row.p.name,
      size: row.size,
      qty: row.qty,
      unitPriceCents: Math.round(row.p.price * 100)
    }));
    write("ss_last_order", { order, total, items });
    write("ss_cart", []);

    location.href = "confirmation.html";
  };
}

function renderConfirmation() {
  const el = document.getElementById("orderNumber");
  if (!el) return;

  const o = read("ss_last_order", null);
  const details = document.getElementById("confirmedItems");
  const printButton = document.getElementById("printOrder");
  const validOrder = o && typeof o === "object" && typeof o.order === "string" &&
    o.order.trim() && Number.isFinite(o.total) && o.total >= 0 &&
    Number.isSafeInteger(Math.round(o.total * 100));

  if (!validOrder) {
    document.getElementById("confirmationTitle").textContent = "No saved order";
    document.getElementById("confirmationMessage").textContent = "There is no saved order summary in this browser.";
    el.textContent = "";
    return;
  }

  el.textContent = `Order ${o.order} • Total ${euro(o.total)}`;
  const validItems = Array.isArray(o.items) && o.items.length > 0 && o.items.every(item =>
    item && typeof item.name === "string" && item.name.trim() &&
    Number.isInteger(item.size) && item.size > 0 &&
    Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= MAX_QUANTITY &&
    Number.isSafeInteger(item.unitPriceCents) && item.unitPriceCents >= 0 &&
    Number.isSafeInteger(item.unitPriceCents * item.qty)
  );
  const sum = validItems ? o.items.reduce((total, item) => total + item.unitPriceCents * item.qty, 0) : null;

  if (validItems && sum === Math.round(o.total * 100)) {
    const table = document.createElement("table");
    table.className = "table order-items text-start";
    const caption = table.createCaption();
    caption.textContent = "Items in this simulated order";
    const head = table.createTHead().insertRow();
    ["Product", "EU size", "Quantity", "Unit price", "Subtotal"].forEach(label => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = label;
      head.append(cell);
    });
    const body = table.createTBody();
    o.items.forEach(item => {
      const row = body.insertRow();
      [item.name, item.size, item.qty, euro(item.unitPriceCents / 100),
        euro(item.unitPriceCents * item.qty / 100)].forEach(value => {
        row.insertCell().textContent = value;
      });
    });
    details.append(table);
  } else {
    details.textContent = "Item details are unavailable for this saved order. The recorded total is shown above.";
  }

  printButton.hidden = false;
  printButton.addEventListener("click", () => window.print());
}

document.addEventListener("DOMContentLoaded", () => {
  updateNav();
  renderHome();
  initHomeSearch();
  renderCatalog();
  renderDetail();
  initAuth();
  renderCart();
  initCheckout();
  renderConfirmation();
});
