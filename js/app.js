
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

function saveCart(items) {
  try {
    write("ss_cart", items);
    return true;
  } catch {
    alert("Your cart could not be saved. Please allow browser storage or free up space, then try again.");
    return false;
  }
}

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

function productImage(p, detail = false, eager = detail) {
  return `<img data-product-image class="${detail ? 'img-fluid rounded' : 'product-image'}" src="${p.image}" alt="${p.name}" width="800" height="520" decoding="async" loading="${eager ? 'eager' : 'lazy'}">`;
}

function initImageFallback() {
  document.addEventListener("error", event => {
    const image = event.target;
    if (!image.matches?.("img[data-product-image]") || image.dataset.fallback) return;
    image.dataset.fallback = "true";
    image.alt += " — image unavailable";
    image.src = "img/product-unavailable.svg";
  }, true);
}

function card(p, index) {
  return `<div class="col-sm-6 col-lg-4"><div class="product-card">${productImage(p, false, index < 3)}<div class="card-body"><span class="badge badge-orange">${p.category}</span><h5 class="mt-2">${p.name}</h5><p class="text-muted">${p.description}</p><div class="d-flex justify-content-between align-items-center"><span class="price">${euro(p.price)}</span><a class="btn btn-outline-primary btn-sm" href="product-detail.html?id=${p.id}">View Details</a></div></div></div></div>`;
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

  if (!saveCart(c)) return;
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
  const sort = document.getElementById("priceSort");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");
  const sizeFilter = document.getElementById("sizeFilter");
  const message = document.getElementById("catalogMessage");

  const sizes = [...new Set(PRODUCTS.flatMap(p => p.sizes))].sort((a, b) => a - b);
  sizes.forEach(size => sizeFilter.add(new Option(String(size), String(size))));

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
    const minimum = minPrice.value === "" ? null : Math.round(Number(minPrice.value) * 100);
    const maximum = maxPrice.value === "" ? null : Math.round(Number(maxPrice.value) * 100);
    const reversed = minimum !== null && maximum !== null && minimum > maximum;
    const invalid = !minPrice.validity.valid || !maxPrice.validity.valid;

    minPrice.setAttribute("aria-invalid", String(!minPrice.validity.valid || reversed));
    maxPrice.setAttribute("aria-invalid", String(!maxPrice.validity.valid || reversed));
    if (invalid || reversed) {
      grid.innerHTML = "";
      message.innerHTML = '<div class="alert alert-warning">' + (invalid
        ? "Enter non-negative prices with up to two decimal places."
        : "Minimum price must not exceed maximum price.") + '</div>';
      return;
    }

    const list = PRODUCTS.filter(p =>
      (cat === "All" || p.category === cat) &&
      (minimum === null || Math.round(p.price * 100) >= minimum) &&
      (maximum === null || Math.round(p.price * 100) <= maximum) &&
      (sizeFilter.value === "" || p.sizes.includes(Number(sizeFilter.value))) &&
      (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    );

    if (sort.value === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort.value === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    grid.innerHTML = list.map(card).join("");

    message.innerHTML = list.length
      ? ""
      : '<div class="alert alert-warning">No shoes match your search and filters.</div>';
  };

  search.addEventListener("input", run);
  filter.addEventListener("change", run);
  sort.addEventListener("change", run);
  minPrice.addEventListener("input", run);
  maxPrice.addEventListener("input", run);
  sizeFilter.addEventListener("change", run);
  document.getElementById("resetFilters").addEventListener("click", () => {
    search.value = "";
    filter.value = "All";
    sort.value = "default";
    minPrice.value = "";
    maxPrice.value = "";
    sizeFilter.value = "";

    // Remove initial catalogue restrictions so reloading keeps the reset state.
    const url = new URL(location.href);
    url.searchParams.delete("search");
    url.searchParams.delete("category");
    history.replaceState(history.state, "", url);

    run();
    message.textContent = `Filters reset. Showing all ${PRODUCTS.length} shoes.`;
  });
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

  el.innerHTML = `<div class="row g-4"><div class="col-md-6">${productImage(p, true)}</div><div class="col-md-6"><span class="badge badge-orange">${p.category}</span><h2 class="mt-2">${p.name}</h2><p>${p.description}</p><p class="price">${euro(p.price)}</p><label class="form-label" for="shoeSize">Size</label><select id="shoeSize" class="form-select mb-3">${p.sizes.map(s => `<option>${s}</option>`).join("")}</select><button id="addBtn" class="btn btn-primary">Add to Cart</button></div></div>`;

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
    document.getElementById("logoutBtn").focus();
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
    document.getElementById("logoutBtn").focus();
  };

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("ss_user");
    msg.innerHTML = '<div class="alert alert-success">You have logged out.</div>';
    updateNav();
    refresh();
    const loginTab = document.getElementById("loginTab");
    if (!loginTab.classList.contains("active")) {
      loginTab.addEventListener("shown.bs.tab", () => document.getElementById("loginEmail").focus(), { once: true });
      bootstrap.Tab.getOrCreateInstance(loginTab).show();
    } else {
      document.getElementById("loginEmail").focus();
    }
  };

  refresh();
}

function cartRows() {
  return cart().map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return { ...i, p };
  }).filter(x => x.p);
}

// One-step, page-session recovery. Never restore over a newer cart or order.
let pendingCartRemoval = null;

function removeCartItem(id, size) {
  const before = cart();
  const removed = before.find(row => row.id === id && row.size === size);
  if (!removed) return false;
  const after = before.filter(row => row !== removed);
  if (!saveCart(after)) return false;
  pendingCartRemoval = {
    before, removed,
    cart: localStorage.getItem("ss_cart"),
    account: JSON.stringify(user()),
    order: localStorage.getItem("ss_last_order")
  };
  return true;
}

function undoCartRemoval() {
  const pending = pendingCartRemoval;
  pendingCartRemoval = null;
  if (!pending) return "unavailable";
  if (localStorage.getItem("ss_cart") !== pending.cart ||
      JSON.stringify(user()) !== pending.account ||
      localStorage.getItem("ss_last_order") !== pending.order) return "changed";
  if (!saveCart(pending.before)) {
    pendingCartRemoval = pending;
    return "save-failed";
  }
  return "restored";
}

function showCartRecovery(message) {
  const notice = document.getElementById("cartRecovery");
  if (!notice) return;
  document.getElementById("cartRecoveryMessage").textContent = message;
  const undo = document.getElementById("undoCartRemoval");
  undo.hidden = !pendingCartRemoval;
  undo.onclick = () => {
    const result = undoCartRemoval();
    renderCart();
    updateNav();
    showCartRecovery(result === "restored" ? "Item restored to your cart." : result === "save-failed" ?
      "The item could not be restored. Your cart was not changed; you can try Undo again." :
      "Your cart or account has changed. Nothing was restored; please review your current cart.");
    notice.focus();
  };
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
    if (!saveCart(current)) {
      input.value = selected.qty;
      return;
    }
    selected.qty = quantity;
    input.closest("tr").cells[4].textContent = euro(subtotalCents({ ...selected, qty: quantity }) / 100);
    el.querySelector(".cart-summary h5").textContent = `Total: ${euro(totalPrice(cartRows()))}`;
    document.getElementById("cartMessage").textContent = "Quantity updated.";
    updateNav();
  });

  el.querySelectorAll("[data-remove]").forEach(button => button.onclick = () => {
    const selected = rows[Number(button.dataset.remove)];

    const removed = removeCartItem(selected.id, selected.size);
    if (!removed && cart().some(row => row.id === selected.id && row.size === selected.size)) return;

    const nextIndex = Number(button.dataset.remove);
    renderCart();
    updateNav();
    showCartRecovery(removed ? `${selected.p.name}, size ${selected.size}, removed. You can undo this removal while this page stays open.` :
      "This item is no longer in your cart. Your current cart is shown below.");

    const remaining = el.querySelectorAll("[data-remove]");
    (remaining[Math.min(nextIndex, remaining.length - 1)] || el.querySelector("a")).focus();
  });
}

function initCartSync() {
  window.addEventListener("storage", event => {
    if (event.storageArea !== localStorage || ![null, "ss_cart", "ss_user", "ss_last_order"].includes(event.key)) return;
    updateNav();
    const area = document.getElementById("cartArea");
    if (!area) return;
    const active = document.activeElement;
    const label = area.contains(active) ? active.getAttribute("aria-label") : null;
    const hadUndo = Boolean(pendingCartRemoval);
    pendingCartRemoval = null;
    renderCart();
    showCartRecovery(hadUndo ? "Your cart or account changed in another tab. Undo is no longer available; the current cart is shown below." :
      "Updated from another tab. Your current cart is shown below.");
    if (label) {
      const target = [...area.querySelectorAll("[aria-label]")].find(el => el.getAttribute("aria-label") === label);
      (target || document.getElementById("cartRecovery")).focus();
    }
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

  document.getElementById("checkoutSummary").innerHTML = `<h5>Order Summary</h5>${c.map(x => `<div class="d-flex justify-content-between gap-2 mb-3 checkout-line"><div><strong>${x.p.name}</strong><div class="small text-muted">Size ${x.size} · Quantity ${x.qty}</div><div class="small text-muted">${euro(x.p.price)} each</div></div><span class="text-nowrap">${euro(subtotalCents(x) / 100)}</span></div>`).join("")}<hr><div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${euro(total)}</span></div><a href="cart.html" class="btn btn-outline-primary btn-sm mt-3">Edit cart</a>`;

  const errorSummary = document.getElementById("checkoutErrors");
  const errorList = document.getElementById("checkoutErrorList");
  const fields = [
    ["fullName", "Full name", "Enter your full name."],
    ["checkoutEmail", "Email", "Enter your email address."],
    ["address", "Address", "Enter your delivery address."],
    ["city", "City", "Enter your city."],
    ["postal", "Postal code", "Enter your postal code."],
    ["cardNumber", "Card number", "Enter an invented card number using 12 to 19 digits; spaces are allowed."]
  ].map(([id, label, requiredMessage]) => {
    const input = document.getElementById(id);
    const error = document.createElement("p");
    error.id = `${id}Error`;
    error.className = "text-danger small mt-1 mb-0";
    error.hidden = true;
    input.after(error);
    return { input, error, label, requiredMessage };
  });
  let submitted = false;

  const validate = () => {
    errorList.replaceChildren();
    let errorCount = 0;

    fields.forEach(({ input, error, label, requiredMessage }) => {
      let message = input.value.trim() ? "" : requiredMessage;
      if (!message && input.id === "checkoutEmail" && input.validity.typeMismatch) {
        message = "Enter an email address such as name@example.com.";
      }
      if (!message && input.id === "cardNumber" &&
          (!/^[0-9 ]+$/.test(input.value) || !/^\d{12,19}$/.test(input.value.replace(/ /g, "")))) {
        message = requiredMessage;
      }

      input.setAttribute("aria-invalid", String(Boolean(message)));
      input.classList.toggle("is-invalid", Boolean(message));
      error.textContent = message;
      error.hidden = !message;
      const descriptions = (input.getAttribute("aria-describedby") || "").split(/\s+/)
        .filter(id => id && id !== error.id);
      if (message) descriptions.push(error.id);
      if (descriptions.length) input.setAttribute("aria-describedby", descriptions.join(" "));
      else input.removeAttribute("aria-describedby");

      if (message) {
        errorCount++;
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${input.id}`;
        link.textContent = `${label}: ${message}`;
        link.addEventListener("click", event => {
          event.preventDefault();
          input.focus();
        });
        item.append(link);
        errorList.append(item);
      }
    });

    document.getElementById("checkoutErrorsTitle").textContent = errorCount === 1
      ? "There is 1 problem" : `There are ${errorCount} problems`;
    errorSummary.hidden = errorCount === 0;
    return errorCount === 0;
  };

  fields.forEach(({ input }) => input.addEventListener("input", () => {
    if (submitted) validate();
  }));

  // Compare the reviewed cart, not just its total: different sizes can cost the same.
  const cartSnapshot = JSON.stringify(c.map(({ id, size, qty }) => ({ id, size, qty })));
  let checkoutBlocked = false;

  const blockCheckout = message => {
    checkoutBlocked = true;
    content.style.display = "none";
    guard.innerHTML = `<div class="alert alert-warning">${message}</div>`;
    guard.setAttribute("role", "alert");
    guard.setAttribute("tabindex", "-1");
    guard.focus();
    updateNav();
  };

  form.onsubmit = e => {
    e.preventDefault();
    submitted = true;

    if (checkoutBlocked) return;

    // Another tab may have changed the account or cart since this page loaded.
    const currentUser = user();
    if (!currentUser || currentUser.email !== u.email) {
      blockCheckout('Your account has changed. <a href="login.html">Check your account</a>, then return to checkout. No order was placed.');
      return;
    }
    if (JSON.stringify(cart()) !== cartSnapshot) {
      blockCheckout('Your cart has changed. <a href="cart.html">Review your cart</a> before checking out again. No order was placed.');
      return;
    }

    if (!validate()) {
      errorSummary.focus();
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
    checkoutBlocked = true;

    location.href = "confirmation.html";
  };
  // Keep native constraints as a fallback until the custom validator is installed.
  form.noValidate = true;
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
  initImageFallback();
  updateNav();
  renderHome();
  initHomeSearch();
  renderCatalog();
  renderDetail();
  initAuth();
  renderCart();
  initCartSync();
  initCheckout();
  renderConfirmation();
});
