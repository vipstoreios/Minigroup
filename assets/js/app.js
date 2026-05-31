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

const AUTHORIZED_USERS = [
  { username: 'client1', password: '123456', name: 'کڕیاری یەکەم' }
];

const PRODUCTS = [
  { id: 'tomato', name: 'تەماتە', emoji: '🍅' },
  { id: 'cucumber', name: 'خەیار', emoji: '🥒' },
  { id: 'lettuce', name: 'کاهو', emoji: '🥬' },
  { id: 'potato', name: 'پەتاتە', emoji: '🥔' },
  { id: 'onion', name: 'پیاز', emoji: '🧅' },
  { id: 'pepper', name: 'بێبەر', emoji: '🫑' },
  { id: 'carrot', name: 'گێزەر', emoji: '🥕' },
  { id: 'lemon', name: 'لیمۆ', emoji: '🍋' },
  { id: 'apple', name: 'سێو', emoji: '🍎' },
  { id: 'banana', name: 'مۆز', emoji: '🍌' },
  { id: 'orange', name: 'پرتەقاڵ', emoji: '🍊' },
  { id: 'grapes', name: 'ترێ', emoji: '🍇' }
];

let cart = [];

const store = {
  get session() {
    return JSON.parse(localStorage.getItem('minigroup_session') || 'null');
  },
  set session(value) {
    localStorage.setItem('minigroup_session', JSON.stringify(value));
  },
  clearSession() {
    localStorage.removeItem('minigroup_session');
  },
  get orders() {
    return JSON.parse(localStorage.getItem('minigroup_orders') || '[]');
  },
  set orders(value) {
    localStorage.setItem('minigroup_orders', JSON.stringify(value));
  }
};

function openLogin() {
  loginError.textContent = '';
  if (typeof loginDialog.showModal === 'function') loginDialog.showModal();
  else loginDialog.setAttribute('open', '');
}

function closeLogin() {
  loginDialog.close?.();
  loginDialog.removeAttribute('open');
}

function showDashboard(user) {
  clientName.textContent = user.name || user.username;
  dashboard.hidden = false;
  document.body.style.overflow = 'hidden';
  renderProducts();
  renderCart();
  renderOrders();
}

function hideDashboard() {
  dashboard.hidden = true;
  document.body.style.overflow = '';
}

function renderProducts() {
  productsGrid.innerHTML = PRODUCTS.map(product => `
    <article class="product-order-card">
      <div class="product-emoji">${product.emoji}</div>
      <h3>${product.name}</h3>
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
  cart.push({ ...product, amount: '', unit: 'kg' });
  renderCart();
  document.getElementById('selectedBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart">هێشتا هیچ کاڵایەک هەڵنەبژێردراوە. لە گریدەکە + بکە.</div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-row" data-cart-row="${item.id}">
      <div class="cart-name"><span>${item.emoji}</span><strong>${item.name}</strong></div>
      <input type="number" min="0" step="0.1" value="${escapeHTML(item.amount)}" placeholder="بڕ" data-amount="${item.id}" required>
      <select data-unit="${item.id}">
        <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>کیلۆ</option>
        <option value="g" ${item.unit === 'g' ? 'selected' : ''}>گرام</option>
      </select>
      <button type="button" class="remove-btn" data-remove-product="${item.id}">×</button>
    </div>
  `).join('');
}

function renderOrders() {
  const session = store.session;
  const orders = store.orders.filter(order => !session || order.username === session.username);

  if (!orders.length) {
    ordersContainer.innerHTML = `<div class="order-card"><p>هێشتا هیچ داواکارییەک نەنێردراوە.</p></div>`;
    return;
  }

  ordersContainer.innerHTML = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(order => `
      <article class="order-card">
        <header>
          <strong>${escapeHTML(order.clientName)}</strong>
          <span class="status-pill">نێردراوە</span>
        </header>
        <div class="order-meta">
          <span>جۆری شوێن: ${escapeHTML(order.placeType)}</span>
          <span>کات: ${escapeHTML(order.neededAt || 'دیاری نەکراو')}</span>
          <span>مۆبایل: ${escapeHTML(order.phone)}</span>
          <span>${escapeHTML(order.address)}</span>
        </div>
        <div class="ordered-products">
          ${order.items.map(item => `<span>${escapeHTML(item.name)}: ${escapeHTML(item.amount)} ${item.unit === 'kg' ? 'کیلۆ' : 'گرام'}</span>`).join('')}
        </div>
        ${order.notes ? `<p><b>تێبینی:</b><br>${escapeHTML(order.notes)}</p>` : ''}
        <small>${new Date(order.createdAt).toLocaleString('ku-IQ')}</small>
      </article>
    `)
    .join('');
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

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = AUTHORIZED_USERS.find(item => item.username === username && item.password === password);

  if (!user) {
    loginError.textContent = 'یوزەر یان پاسوۆرد هەڵەیە، یان هێشتا ئەدمین ئەم هەژمارەی چالاک نەکردووە.';
    return;
  }

  store.session = { username: user.username, name: user.name, loggedInAt: new Date().toISOString() };
  closeLogin();
  showDashboard(user);
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

orderForm.addEventListener('submit', event => {
  event.preventDefault();
  const session = store.session;
  if (!session) return openLogin();

  const selectedItems = cart.filter(item => Number(item.amount) > 0);
  if (!selectedItems.length) {
    orderSuccess.textContent = 'تکایە لانیکەم یەک کاڵا هەڵبژێرە و بڕی بنووسە.';
    return;
  }

  const order = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    username: session.username,
    clientName: session.name,
    placeType: document.getElementById('placeType').value,
    neededAt: document.getElementById('neededAt').value,
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    items: selectedItems.map(item => ({ id: item.id, name: item.name, amount: item.amount, unit: item.unit })),
    notes: document.getElementById('notes').value.trim(),
    createdAt: new Date().toISOString()
  };

  store.orders = [...store.orders, order];
  cart = [];
  orderForm.reset();
  renderCart();
  renderOrders();
  orderSuccess.textContent = 'داواکاری نێردرا. لای ئێمە بە ناوی کڕیارەکە تۆمار دەبێت.';
  setTimeout(() => { orderSuccess.textContent = ''; }, 6000);
  document.getElementById('ordersList').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

clearOrders.addEventListener('click', () => {
  const session = store.session;
  if (!session) return;
  store.orders = store.orders.filter(order => order.username !== session.username);
  renderOrders();
});

logoutBtn.addEventListener('click', () => {
  store.clearSession();
  cart = [];
  hideDashboard();
});

const session = store.session;
if (session) showDashboard(session);
