const cfg = window.MINIGROUP_CONFIG || {};
const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
const loginBox = document.getElementById('loginBox');
const dashBox = document.getElementById('dashBox');
const loginForm = document.getElementById('loginForm');
const productForm = document.getElementById('productForm');
const productsBox = document.getElementById('productsBox');
const msg = document.getElementById('msg');
const productMsg = document.getElementById('productMsg');

function safe(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function isAdmin() {
  const { data } = await db.auth.getUser();
  const user = data.user;
  if (!user) return false;
  const { data: row } = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  return !!row;
}

async function openDashboard() {
  loginBox.hidden = true;
  dashBox.hidden = false;
  await loadProducts();
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  msg.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    msg.textContent = error.message;
    return;
  }
  if (!(await isAdmin())) {
    msg.textContent = 'ئەم هەژمارە ئەدمین نییە.';
    return;
  }
  openDashboard();
});

productForm.addEventListener('submit', async event => {
  event.preventDefault();
  productMsg.textContent = '';
  const product = {
    name: document.getElementById('productName').value.trim(),
    emoji: document.getElementById('productEmoji').value,
    category: document.getElementById('productCategory').value,
    is_active: true
  };
  const { error } = await db.from('products').insert(product);
  if (error) {
    productMsg.textContent = error.message;
    return;
  }
  productForm.reset();
  productMsg.textContent = 'بەرهەم هاتە زیادکرن.';
  await loadProducts();
});

productsBox.addEventListener('click', async event => {
  const btn = event.target.closest('[data-remove-id]');
  if (!btn) return;
  if (!confirm('دڵنیای دڤێت ئەم بەرهەمە لابەریت؟')) return;
  productMsg.textContent = '';
  const { error } = await db.from('products').update({ is_active: false }).eq('id', btn.dataset.removeId);
  if (error) {
    productMsg.textContent = error.message;
    return;
  }
  productMsg.textContent = 'بەرهەم هاتە لابردن.';
  await loadProducts();
});

async function loadProducts() {
  const { data, error } = await db.from('products').select('id,name,emoji,category,is_active,created_at').eq('is_active', true).order('created_at', { ascending: false });
  if (error) {
    productsBox.innerHTML = '<div class="order-card"><p>' + safe(error.message) + '</p></div>';
    return;
  }
  if (!data || !data.length) {
    productsBox.innerHTML = '<div class="order-card"><p>هیچ بەرهەمێکی چالاک نەما.</p></div>';
    return;
  }
  productsBox.innerHTML = data.map(item => `
    <article class="order-card">
      <header>
        <strong>${safe(item.emoji)} ${safe(item.name)}</strong>
        <button class="btn btn-soft" type="button" data-remove-id="${safe(item.id)}">لابردن</button>
      </header>
      <div class="order-meta"><span>${safe(item.category)}</span><span>چالاک</span></div>
    </article>
  `).join('');
}

(async () => {
  if (await isAdmin()) openDashboard();
})();
