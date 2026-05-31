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
  { username: 'client1', password: '123456', name: 'کریارێ ئێکێ' }
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
  { id: 'apple', name: 'سێڤ', emoji: '🍎' },
  { id: 'banana', name: 'مۆز', emoji: '🍌' },
  { id: 'orange', name: 'پرتەقاڵ', emoji: '🍊' },
  { id: 'grapes', name: 'تری', emoji: '🍇' }
];

let cart = [];

const store = {
  get session() { return JSON.parse(localStorage.getItem('minigroup_session') || 'null'); },
  set session(value) { localStorage.setItem('minigroup_session', JSON.stringify(value)); },
  clearSession() { localStorage.removeItem('minigroup_session'); },
  get orders() { return JSON.parse(localStorage.getItem('minigroup_orders') || '[]'); },
  set orders(value) { localStorage.setItem('minigroup_orders', JSON.stringify(value)); }
};

function translateStaticToBadini() {
  document.documentElement.lang = 'ku';
  document.title = 'Minigroup | داخوازیا کەسکاتی و فێقی';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = 'وێبسایتەکا تایبەت بۆ مەتعەم، مارکێت و جهێن گەشتیاری بۆ داخوازیا کەسکاتی و فێقی بێ نیشاندانا بها.';

  const replacements = new Map([
    ['داواکاری تایبەتی سەوزە و فێقی', 'داخوازیا تایبەت یا کەسکاتی و فێقی'],
    ['داواکاری سەوزە و فێقی بە شێوەیەکی تایبەت و پرۆفیشناڵ', 'داخوازیا کەسکاتی و فێقی ب شێوازەکێ تایبەت و پرۆفیشناڵ'],
    ['تەنها بۆ کڕیاری کاری', 'تەنێ بۆ کریارێن کاری'],
    ['کڕیار داخل دەبێت، لە گریدەکە سەوزە هەڵدەبژێرێت و بڕ دەنووسێت', 'کریار داخل دبیت، ژ گریدێ کەسکاتی هەلدبژێریت و بڕێ دنڤیسیت'],
    ['لاگین بکە بۆ داواکاری', 'لاگین بکە بۆ داخوازێ'],
    ['بینینی شێوازی کارکردن', 'بینینا شێوازێ کارکرنێ'],
    ['بە ناوی کڕیار', 'ب ناڤێ کریاری'],
    ['داواکاری لەسەر هەژمار تۆمار دەبێت', 'داخوازیا وی ل سەر هەژمارێ تۆمار دبیت'],
    ['هەڵبژاردنی خێرای سەوزە و فێقی', 'هەلبژارتنا بلەزا کەسکاتی و فێقی'],
    ['بێ نرخ', 'بێ بها'],
    ['نرخ لە پەیوەندی دیاری دەکرێت', 'بها د پەیوەندیێدا دیار دبیت'],
    ['هەژماری تایبەت', 'هەژمارا تایبەت'],
    ['تەنها کڕیاری ڕێپێدراو دەتوانێت داواکاری بنێرێت.', 'تەنێ کریارێ ڕێپێدراوی دشێت داخوازێ بنێریت.'],
    ['پڵەس + بڕ', 'پڵەس + بڕ'],
    ['لەسەر کاڵا + بکە، بڕ بنووسە، کیلۆ یان گرام هەڵبژێرە.', 'ل سەر مالێ + بکە، بڕێ بنڤیسە، کیلۆ یان گرام هەلبژێرە.'],
    ['ڕێگای کارکردن', 'ڕێکا کارکرنێ'],
    ['سیستەمی داواکاری بە گرید', 'سیستەمێ داخوازێ ب گریدێ'],
    ['تۆ یوزەر درووست دەکەیت', 'تۆ یوزەر دروست دکەی'],
    ['هەر کڕیار هەژماری خۆی هەیە، بۆیە ئێوە دەزانن داواکارییەکە لە کێوە هاتووە.', 'هەر کریارەک هەژمارا خۆ هەیە، بۆیە هۆن دزانن داخوازێ ژ کێ هاتییە.'],
    ['کڕیار داخل دەبێت', 'کریار داخل دبیت'],
    ['دوای لاگین، داشبۆردی تایبەتی داواکاری بۆی دەکرێتەوە.', 'پشتی لاگینێ، داشبۆردا تایبەتی یا داخوازێ بۆی ڤەدبیت.'],
    ['لە گرید + دەکات', 'ل گریدێ + دکەت'],
    ['سەوزە و فێقی بە کارت دەردەکەون، کڕیار بڕ بە کیلۆ یان گرام دەنووسێت.', 'کەسکاتی و فێقی ب کارت دێنە نیشاندان، کریار بڕ ب کیلۆ یان گرام دنڤیسیت.'],
    ['ئێوە داواکاری دەبینن', 'هۆن داخوازێ دبینن'],
    ['داواکاری بە ناوی کڕیار، ژمارە، ناونیشان و لیستی کاڵا دەگاتە لای ئێوە.', 'داخواز ب ناڤێ کریاری، ژمارە، ناڤ و نیشان و لیستا مالان دگەهیتە لای هەوە.'],
    ['بۆ کێیە؟', 'بۆ کێیە؟'],
    ['نەک بۆ تاکە کەس', 'نەک بۆ تاکە کەس'],
    ['مەتعەمەکان', 'مەتعەم'],
    ['داواکاری ڕۆژانەی سەوزە و فێقی.', 'داخوازیا ڕۆژانە یا کەسکاتی و فێقی.'],
    ['مارکێتەکان', 'مارکێت'],
    ['پڕکردنەوەی کاڵا بە بڕی زۆر.', 'پڕکرنا مالان ب بڕەکا زۆر.'],
    ['شوێنە گەشتیارییەکان', 'جهێن گەشتیاری'],
    ['هۆتێل، کافێ، گەشتخانە و شوێنی پشوو.', 'هۆتێل، کافێ، گەشتخانە و جهێن پشوو.'],
    ['چوونەژوورەوە', 'چوونە ژوور'],
    ['چوونەژوورەوە 🔐', 'چوونە ژوور 🔐'],
    ['یوزەرنەیم و پاسوۆردی کڕیار داخل بکە.', 'یوزەرنەیم و پاسوۆردا کریاری داخل بکە.'],
    ['یوزەرنەیمی کڕیار', 'یوزەرنەیمێ کریاری'],
    ['هەژمارەکان لەلایەن ئەدمینەوە درووست دەکرێن.', 'هەژمار تەنێ ژ لایێ ئەدمینی ڤە دهێنە دروستکرن.'],
    ['کڕیار', 'کریار'],
    ['داواکاری نوێ', 'داخوازیا نوی'],
    ['کاڵای هەڵبژێردراو', 'مالێن هەلبژارتی'],
    ['داواکارییەکانم', 'داخوازێن من'],
    ['چوونەدەرەوە', 'چوونە دەر'],
    ['داشبۆردی کڕیار', 'داشبۆردا کریاری'],
    ['سەوزە و فێقی هەڵبژێرە', 'کەسکاتی و فێقی هەلبژێرە'],
    ['لەسەر + دەست بنێ، بڕ بە کیلۆ یان گرام بنووسە، پاشان داواکاری بنێرە. نرخ لێرە نییە.', 'ل سەر + دەست بنێ، بڕ ب کیلۆ یان گرام بنڤیسە، پاشان داخوازێ بنێرە. بها ل ڤێرێ نییە.'],
    ['هەژماری ڕێپێدراو', 'هەژمارا ڕێپێدراو'],
    ['گریدی کاڵاکان', 'گریدێ مالان'],
    ['کاڵا هەڵبژێرە', 'مال هەلبژێرە'],
    ['بێ نرخ', 'بێ بها'],
    ['داواکاری', 'داخواز'],
    ['پاککردنەوە', 'پاککرنەوە'],
    ['جۆری شوێن', 'جۆرێ جهی'],
    ['هەڵبژێرە', 'هەلبژێرە'],
    ['شوێنی گەشتیاری', 'جهێ گەشتیاری'],
    ['کاتی پێویست', 'دەمێ پێدڤی'],
    ['ژمارەی پەیوەندی', 'ژمارا پەیوەندیێ'],
    ['شوێنی گەیاندن', 'ناڤ و نیشانا گەهاندنێ'],
    ['تێبینی', 'تێبینی'],
    ['ناردنی داواکاری', 'ناردنا داخوازێ'],
    ['تۆمار', 'تۆمار'],
    ['سڕینەوەی تۆمار', 'ژێبرنا تۆمارێ']
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue.trim();
    if (replacements.has(text)) node.nodeValue = node.nodeValue.replace(text, replacements.get(text));
  });

  document.querySelectorAll('[placeholder]').forEach(el => {
    const value = el.getAttribute('placeholder');
    if (replacements.has(value)) el.setAttribute('placeholder', replacements.get(value));
    if (value === 'ژمارەی پەیوەندی') el.setAttribute('placeholder', 'ژمارا پەیوەندیێ');
    if (value === 'ناونیشانی ورد') el.setAttribute('placeholder', 'ناڤ و نیشانا ورد');
    if (value === 'لیستی کاڵاکان و بڕی پێویست بنووسە') el.setAttribute('placeholder', 'لیستا مالان و بڕێ پێدڤی بنڤیسە');
    if (value === 'کات، جۆری تایبەت، کیفیت، یان هەر تێبینییەک') el.setAttribute('placeholder', 'دەم، جۆرێ تایبەت، کوالیتی، یان هەر تێبینیەک');
  });
}

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
  translateStaticToBadini();
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
    cartItems.innerHTML = `<div class="empty-cart">هێشتا چ مالەک نەهاتە هەلبژارتن. ل گریدێ + بکە.</div>`;
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
    ordersContainer.innerHTML = `<div class="order-card"><p>هێشتا هیچ داخوازەک نەهاتە ناردن.</p></div>`;
    return;
  }

  ordersContainer.innerHTML = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(order => `
      <article class="order-card">
        <header>
          <strong>${escapeHTML(order.clientName)}</strong>
          <span class="status-pill">هاتییە ناردن</span>
        </header>
        <div class="order-meta">
          <span>جۆرێ جهی: ${escapeHTML(order.placeType)}</span>
          <span>دەم: ${escapeHTML(order.neededAt || 'نەهاتە دیارکرن')}</span>
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
    loginError.textContent = 'یوزەر یان پاسوۆرد هەلەیە، یان هێشتا ئەدمین ئەڤ هەژمارە چالاک نەکرییە.';
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
    orderSuccess.textContent = 'هیڤیدارین کێمترین یەک مال هەلبژێرە و بڕێ بنڤیسە.';
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
  orderSuccess.textContent = 'داخواز هاتە ناردن. لای مە ب ناڤێ کریاری تۆمار دبیت.';
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

translateStaticToBadini();
const session = store.session;
if (session) showDashboard(session);
