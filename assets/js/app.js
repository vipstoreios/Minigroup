const loginDialog = document.getElementById('loginDialog');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const clientName = document.getElementById('clientName');
const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
const ordersContainer = document.getElementById('ordersContainer');
const clearOrders = document.getElementById('clearOrders');
const logoutBtn = document.getElementById('logoutBtn');
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const clearCart = document.getElementById('clearCart');

let PRODUCTS = [];
let cart = [];
let currentClient = null;

const cfg = window.MINIGROUP_CONFIG || {};
const supabaseClient = cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

function openLogin() {
  loginError.textContent = '';
  if (typeof loginDialog.showModal === 'function') loginDialog.showModal();
  else loginDialog.setAttribute('open', '');
}

function closeLogin() {
  loginDialog.close?.();
  loginDialog.removeAttribute('open');
}

async function showDashboard(user) {
  currentClient = user;
  clientName.textContent = user.name || user.email || 'کریار';
  dashboard.hidden = false;
  document.body.style.overflow = 'hidden';
  await loadProducts();
  renderCart();
  await renderOrders();
}

function hideDashboard() {
  dashboard.hidden = true;
  document.body.style.overflow = '';
}

async function loadProducts() {
  if (!supabaseClient) {
    productsGrid.innerHTML = `<div class="order-card"><p>Supabase گرێنەدایە.</p></div>`;
    return;
  }

  productsGrid.innerHTML = `<div class="order-card"><p>بەرهەم دهێنە وەرگرتن...</p></div>`;
  const { data, error } = await supabaseClient
    .from('products')
    .select('id,name,emoji,category,is_active,created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    productsGrid.innerHTML = `<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }

  PRODUCTS = data || [];
  renderProducts();
}

function renderProducts() {
  if (!PRODUCTS.length) {
    productsGrid.innerHTML = `<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن. ل ئەدمین داشبۆردێ بەرهەم زیاد بکە.</p></div>`;
    return;
  }

  productsGrid.innerHTML = PRODUCTS.map(product => `
    <article class="product-order-card">
      <div class="product-emoji">${escapeHTML(product.emoji)}</div>
      <h3>${escapeHTML(product.name)}</h3>
      <button class="plus-btn" type="button" data-add-product="${product.id}">+</button>
    </article>
  `).join('');
}

function addProduct(productId) {
  const product = PRODUCTS.find(item => item.id === productId);
  if (!product) return;
  if (cart.some(item => item.id === product.id)) {
    document.getElementById('selectedBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  cart.push({ id: product.id, name: product.name, emoji: product.emoji, amount: '', unit: 'kg' });
  renderCart();
  document.getElementById('selectedBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart">هێشتا چ داخوازی نەهاتینە هەڵبژارتن. هێڤیە بۆ هەڵبژارتنا هەر کەلوپەلەکی کلیك لسەر + بکە</div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-row" data-cart-row="${item.id}">
      <div class="cart-name"><span>${escapeHTML(item.emoji)}</span><strong>${escapeHTML(item.name)}</strong></div>
      <input type="number" min="0" step="0.1" value="${escapeHTML(item.amount)}" placeholder="بڕ" data-amount="${item.id}" required>
      <select data-unit="${item.id}">
        <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>کیلۆ</option>
        <option value="g" ${item.unit === 'g' ? 'selected' : ''}>گرام</option>
      </select>
      <button type="button" class="remove-btn" data-remove-product="${item.id}">×</button>
    </div>
  `).join('');
}

async function renderOrders() {
  if (!currentClient || !supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('user_id', currentClient.id)
    .order('created_at', { ascending: false });

  if (error) {
    ordersContainer.innerHTML = `<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }

  if (!data?.length) {
    ordersContainer.innerHTML = `<div class="order-card"><p>هێشتا هیچ داخوازیەک نەهاتە ناردن.</p></div>`;
    return;
  }

  ordersContainer.innerHTML = data.map(order => `
      <article class="order-card">
        <header>
          <strong>${escapeHTML(order.client_name)}</strong>
          <span class="status-pill">${escapeHTML(order.status || 'new')}</span>
        </header>
        <div class="order-meta">
          <span>جۆرێ جهی: ${escapeHTML(order.place_type)}</span>
          <span>دەم: ${escapeHTML(order.needed_at || 'نەهاتە دیارکرن')}</span>
          <span>مۆبایل: ${escapeHTML(order.phone)}</span>
          <span>${escapeHTML(order.address)}</span>
        </div>
        <div class="ordered-products">
          ${(order.items || []).map(item => `<span>${escapeHTML(item.name)}: ${escapeHTML(item.amount)} ${item.unit === 'kg' ? 'کیلۆ' : 'گرام'}</span>`).join('')}
        </div>
        ${order.notes ? `<p><b>تێبینی:</b><br>${escapeHTML(order.notes)}</p>` : ''}
        <small>${new Date(order.created_at).toLocaleString('ku-IQ')}</small>
      </article>
    `).join('');
}

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.querySelectorAll('[data-open-login]').forEach(button => button.addEventListener('click', openLogin));
document.querySelectorAll('[data-close-login]').forEach(button => button.addEventListener('click', closeLogin));

loginDialog.addEventListener('click', event => {
  const rect = loginDialog.querySelector('.dialog-card').getBoundingClientRect();
  const clickedOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (clickedOutside) closeLogin();
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginError.textContent = '';

  if (!supabaseClient) {
    loginError.textContent = 'Supabase هێشتا نەهاتە گرێدان.';
    return;
  }

  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    loginError.textContent = error?.message || 'ئەم هەژمارە ڕێپێدراو نییە یان پاسوۆرد هەلەیە.';
    return;
  }

  const name = data.user.user_metadata?.name || data.user.email;
  closeLogin();
  await showDashboard({ id: data.user.id, email: data.user.email, name });
});

productsGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-add-product]');
  if (!button) return;
  addProduct(button.dataset.addProduct);
});

cartItems.addEventListener('input', event => {
  const input = event.target.closest('[data-amount]');
  if (!input) return;
  const item = cart.find(product => product.id === input.dataset.amount);
  if (item) item.amount = input.value;
});

cartItems.addEventListener('change', event => {
  const select = event.target.closest('[data-unit]');
  if (!select) return;
  const item = cart.find(product => product.id === select.dataset.unit);
  if (item) item.unit = select.value;
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-product]');
  if (!button) return;
  cart = cart.filter(item => item.id !== button.dataset.removeProduct);
  renderCart();
});

clearCart.addEventListener('click', () => {
  cart = [];
  renderCart();
});

orderForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentClient) return openLogin();

  const selectedItems = cart.filter(item => Number(item.amount) > 0);
  if (!selectedItems.length) {
    orderSuccess.textContent = 'هیڤیدارین کێمترین یەک داخوازی هەلبژێرە و بڕێ بنڤیسە.';
    return;
  }

  const order = {
    user_id: currentClient.id,
    client_name: currentClient.name || currentClient.email,
    client_email: currentClient.email,
    place_type: document.getElementById('placeType').value,
    needed_at: document.getElementById('neededAt').value || null,
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    items: selectedItems.map(item => ({ id: item.id, name: item.name, amount: item.amount, unit: item.unit })),
    notes: document.getElementById('notes').value.trim()
  };

  const { error } = await supabaseClient.from('orders').insert(order);
  if (error) {
    orderSuccess.textContent = error.message;
    return;
  }

  cart = [];
  orderForm.reset();
  renderCart();
  await renderOrders();
  orderSuccess.textContent = 'داخوازی هاتە ناردن. لای مە ب ناڤێ کریاری تۆمار دبیت.';
  setTimeout(() => { orderSuccess.textContent = ''; }, 6000);
  document.getElementById('ordersList').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

clearOrders.addEventListener('click', () => {
  cart = [];
  renderCart();
});

logoutBtn.addEventListener('click', async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentClient = null;
  cart = [];
  hideDashboard();
});

(async function restoreSession() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    const user = data.session.user;
    await showDashboard({ id: user.id, email: user.email, name: user.user_metadata?.name || user.email });
  }
})();
