const cfg = window.MINIGROUP_CONFIG || {};
const adminSupabase = cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const adminLoginBox = document.getElementById('adminLoginBox');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');
const adminLogout = document.getElementById('adminLogout');
const productForm = document.getElementById('productForm');
const productMessage = document.getElementById('productMessage');
const adminProducts = document.getElementById('adminProducts');
const clientForm = document.getElementById('clientForm');
const clientMessage = document.getElementById('clientMessage');
const adminClients = document.getElementById('adminClients');
const adminOrders = document.getElementById('adminOrders');
const refreshOrders = document.getElementById('refreshOrders');

function showAdmin() {
  adminLoginBox.hidden = true;
  adminDashboard.hidden = false;
  loadProducts();
  loadClients();
  loadOrders();
}

function showLogin() {
  adminLoginBox.hidden = false;
  adminDashboard.hidden = true;
}

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function requireAdmin() {
  if (!adminSupabase) {
    adminLoginError.textContent = 'Supabase هێشتا گرێنەدایە.';
    return false;
  }
  const { data } = await adminSupabase.auth.getUser();
  const user = data.user;
  if (!user) return false;

  const { data: adminRow, error } = await adminSupabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !adminRow) {
    await adminSupabase.auth.signOut();
    adminLoginError.textContent = 'ئەم هەژمارە مافی ئەدمینی نییە.';
    return false;
  }

  return true;
}

adminLoginForm.addEventListener('submit', async event => {
  event.preventDefault();
  adminLoginError.textContent = '';
  if (!adminSupabase) {
    adminLoginError.textContent = 'Supabase گرێنەدایە.';
    return;
  }

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const { error } = await adminSupabase.auth.signInWithPassword({ email, password });
  if (error) {
    adminLoginError.textContent = error.message;
    return;
  }

  if (await requireAdmin()) showAdmin();
});

adminLogout.addEventListener('click', async () => {
  await adminSupabase.auth.signOut();
  showLogin();
});

productForm.addEventListener('submit', async event => {
  event.preventDefault();
  productMessage.textContent = '';
  const product = {
    name: document.getElementById('productName').value.trim(),
    emoji: document.getElementById('productEmoji').value.trim(),
    category: document.getElementById('productCategory').value,
    sort_order: Number(document.getElementById('productSort').value || 100),
    is_active: true
  };

  const { error } = await adminSupabase.from('products').insert(product);
  if (error) {
    productMessage.textContent = error.message;
    return;
  }
  productForm.reset();
  document.getElementById('productSort').value = 100;
  productMessage.textContent = 'بەرهەم هاتە زیادکرن.';
  loadProducts();
});

clientForm.addEventListener('submit', async event => {
  event.preventDefault();
  clientMessage.textContent = '';
  const profile = {
    id: document.getElementById('clientUserId').value.trim(),
    name: document.getElementById('clientNameInput').value.trim(),
    business_type: document.getElementById('clientBusiness').value.trim(),
    phone: document.getElementById('clientPhone').value.trim(),
    address: document.getElementById('clientAddress').value.trim(),
    is_active: true
  };

  const { error } = await adminSupabase.from('client_profiles').upsert(profile);
  if (error) {
    clientMessage.textContent = error.message;
    return;
  }
  clientForm.reset();
  clientMessage.textContent = 'کریار هاتە تۆمارکرن.';
  loadClients();
});

refreshOrders.addEventListener('click', loadOrders);

async function loadProducts() {
  const { data, error } = await adminSupabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    adminProducts.innerHTML = `<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }

  if (!data?.length) {
    adminProducts.innerHTML = `<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن.</p></div>`;
    return;
  }

  adminProducts.innerHTML = data.map(product => `
    <article class="order-card">
      <header><strong>${escapeHTML(product.emoji)} ${escapeHTML(product.name)}</strong><span class="status-pill">${escapeHTML(product.category)}</span></header>
      <p>ڕێز: ${escapeHTML(product.sort_order)} | Active: ${product.is_active ? 'بەڵێ' : 'نەخێر'}</p>
    </article>
  `).join('');
}

async function loadClients() {
  const { data, error } = await adminSupabase
    .from('client_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    adminClients.innerHTML = `<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }

  if (!data?.length) {
    adminClients.innerHTML = `<div class="order-card"><p>هێشتا کریار نەهاتییە تۆمارکرن.</p></div>`;
    return;
  }

  adminClients.innerHTML = data.map(client => `
    <article class="order-card">
      <header><strong>${escapeHTML(client.name)}</strong><span class="status-pill">${client.is_active ? 'چالاک' : 'ناچالاک'}</span></header>
      <div class="order-meta"><span>${escapeHTML(client.business_type)}</span><span>${escapeHTML(client.phone)}</span><span>${escapeHTML(client.address)}</span></div>
      <p>User ID: ${escapeHTML(client.id)}</p>
    </article>
  `).join('');
}

async function loadOrders() {
  const { data, error } = await adminSupabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    adminOrders.innerHTML = `<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }

  if (!data?.length) {
    adminOrders.innerHTML = `<div class="order-card"><p>هێشتا داخواز نەهاتییە.</p></div>`;
    return;
  }

  adminOrders.innerHTML = data.map(order => `
    <article class="order-card">
      <header><strong>${escapeHTML(order.client_name)}</strong><span class="status-pill">${escapeHTML(order.status)}</span></header>
      <div class="order-meta"><span>${escapeHTML(order.client_email)}</span><span>${escapeHTML(order.place_type)}</span><span>${escapeHTML(order.phone)}</span><span>${escapeHTML(order.address)}</span></div>
      <div class="ordered-products">
        ${(order.items || []).map(item => `<span>${escapeHTML(item.name)}: ${escapeHTML(item.amount)} ${item.unit === 'kg' ? 'کیلۆ' : 'گرام'}</span>`).join('')}
      </div>
      ${order.notes ? `<p><b>تێبینی:</b><br>${escapeHTML(order.notes)}</p>` : ''}
      <small>${new Date(order.created_at).toLocaleString('ku-IQ')}</small>
    </article>
  `).join('');
}

(async function initAdmin() {
  if (!adminSupabase) return;
  if (await requireAdmin()) showAdmin();
})();
