function patchAdminForm() {
  const sortInput = document.getElementById('productSort');
  if (sortInput && sortInput.closest('label')) {
    sortInput.closest('label').style.display = 'none';
  }

  const oldEmoji = document.getElementById('productEmoji');
  if (oldEmoji) {
    const label = oldEmoji.closest('label');
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'productEmoji';
    hidden.value = '';
    if (label) label.replaceWith(hidden);
    else oldEmoji.replaceWith(hidden);
  }

  const note = document.querySelector('#clientForm')?.previousElementSibling;
  if (note) note.textContent = 'UID هەمان User ID ـە ل Supabase. بچۆ Authentication → Users، کلیک ل کریاری بکە، User ID کۆپی بکە و ل ڤێرێ دابنێ.';
}

function patchWords() {
  const replacements = [
    ['گرید', 'لیست'],
    ['گریدێ', 'لیستا'],
    ['مالێن هەلبژارتی', 'داخوازیێن هەلبژارتی'],
    ['مال هەلبژێرە', 'داخوازی هەلبژێرە'],
    ['مالان', 'داخوازیان'],
    ['مالەک', 'داخوازی'],
    ['هێشتا چ مالەک نەهاتە هەلبژارتن. ل گریدێ + بکە.', 'هێشتا چ داخوازی نەهاتینە هەڵبژارتن. هێڤیە بۆ هەڵبژارتنا هەر کەلوپەلەکی کلیك لسەر + بکە']
  ];
  document.querySelectorAll('h1,h2,h3,p,a,span,button,div').forEach(el => {
    if (el.children.length) return;
    let txt = el.textContent;
    let changed = false;
    replacements.forEach(([a,b]) => {
      if (txt.includes(a)) {
        txt = txt.split(a).join(b);
        changed = true;
      }
    });
    if (changed) el.textContent = txt;
  });
}

function safeText(value) {
  return String(value || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

async function forceAdminProductList() {
  const box = document.getElementById('adminProducts');
  const dash = document.getElementById('adminDashboard');
  const cfg = window.MINIGROUP_CONFIG || {};
  if (!box || !cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
  if (dash && dash.hidden) return;

  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const { data, error } = await db
    .from('products')
    .select('id,name,category,is_active,created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    box.innerHTML = `<div class="order-card"><p>${safeText(error.message)}</p></div>`;
    return;
  }

  if (!data || !data.length) {
    box.innerHTML = '<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن.</p></div>';
    return;
  }

  box.innerHTML = data.map(item => `
    <article class="order-card">
      <header>
        <strong>${safeText(item.name)}</strong>
        <button class="btn btn-soft" type="button" data-force-remove-id="${safeText(item.id)}">لابردن</button>
      </header>
      <div class="order-meta"><span>${safeText(item.category)}</span><span>چالاک</span></div>
    </article>
  `).join('');
}

async function removeProduct(id) {
  const cfg = window.MINIGROUP_CONFIG || {};
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  if (!confirm('دڵنیای دڤێت ئەم بەرهەمە لابەریت؟')) return;
  const { error } = await db.from('products').update({ is_active: false }).eq('id', id);
  const msg = document.getElementById('productMessage');
  if (msg) msg.textContent = error ? error.message : 'بەرهەم هاتە لابردن.';
  if (!error) await forceAdminProductList();
}

document.addEventListener('click', event => {
  const btn = event.target.closest('[data-force-remove-id]');
  if (!btn) return;
  removeProduct(btn.dataset.forceRemoveId);
});

patchAdminForm();
patchWords();
setTimeout(forceAdminProductList, 1200);
setInterval(() => {
  patchAdminForm();
  patchWords();
  forceAdminProductList();
}, 4000);
