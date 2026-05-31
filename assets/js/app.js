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

const AUTHORIZED_USERS = [];

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
  if (typeof loginDialog.showModal === 'function') {
    loginDialog.showModal();
  } else {
    loginDialog.setAttribute('open', '');
  }
}

function closeLogin() {
  loginDialog.close?.();
  loginDialog.removeAttribute('open');
}

function showDashboard(user) {
  clientName.textContent = user.name || user.username;
  dashboard.hidden = false;
  document.body.style.overflow = 'hidden';
  renderOrders();
}

function hideDashboard() {
  dashboard.hidden = true;
  document.body.style.overflow = '';
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
          <strong>${escapeHTML(order.placeType)}</strong>
          <span class="status-pill">نێردراوە</span>
        </header>
        <div class="order-meta">
          <span>کات: ${escapeHTML(order.neededAt || 'دیاری نەکراو')}</span>
          <span>مۆبایل: ${escapeHTML(order.phone)}</span>
          <span>${escapeHTML(order.address)}</span>
        </div>
        <p><b>کاڵاکان:</b>\n${escapeHTML(order.items)}</p>
        ${order.notes ? `<p><b>تێبینی:</b>\n${escapeHTML(order.notes)}</p>` : ''}
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

document.querySelectorAll('[data-open-login]').forEach(button => {
  button.addEventListener('click', openLogin);
});

document.querySelectorAll('[data-close-login]').forEach(button => {
  button.addEventListener('click', closeLogin);
});

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
    loginError.textContent = 'هەژمارەکەت ڕێپێدراو نییە یان هێشتا لە سیستەمی ڕاستەقینە چالاک نەکراوە.';
    return;
  }

  store.session = { username: user.username, name: user.name, loggedInAt: new Date().toISOString() };
  closeLogin();
  showDashboard(user);
});

orderForm.addEventListener('submit', event => {
  event.preventDefault();
  const session = store.session;
  if (!session) {
    openLogin();
    return;
  }

  const order = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    username: session.username,
    placeType: document.getElementById('placeType').value,
    neededAt: document.getElementById('neededAt').value,
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    items: document.getElementById('items').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    createdAt: new Date().toISOString()
  };

  store.orders = [...store.orders, order];
  orderForm.reset();
  orderSuccess.textContent = 'داواکارییەکەت نێردرا و لە تۆماردا دانرا. نرخ لە پەیوەندی دیاری دەکرێت.';
  setTimeout(() => { orderSuccess.textContent = ''; }, 6000);
  renderOrders();
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
  hideDashboard();
});

const session = store.session;
if (session) {
  showDashboard(session);
}
