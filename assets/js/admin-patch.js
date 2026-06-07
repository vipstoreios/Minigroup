function patchAdminForm() {
  const sortInput = document.getElementById('productSort');
  if (sortInput && sortInput.closest('label')) sortInput.closest('label').style.display = 'none';

  const oldEmoji = document.getElementById('productEmoji');
  if (oldEmoji) {
    const label = oldEmoji.closest('label');
    if (label) label.innerHTML = 'لینکی وێنەی بەرهەم<input id="productEmoji" type="url" placeholder="https://.../image.jpg">';
    else {
      oldEmoji.type = 'url';
      oldEmoji.placeholder = 'https://.../image.jpg';
    }
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

function addAdminImageStyle() {
  if (document.getElementById('adminImageStyle')) return;
  const style = document.createElement('style');
  style.id = 'adminImageStyle';
  style.textContent = '.admin-product-photo{width:100%;height:145px;object-fit:cover;border-radius:20px;margin:12px 0;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05)}.admin-image-editor{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:12px}.admin-image-editor input{width:100%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:16px;padding:13px;color:#fff;font-weight:700}.admin-image-editor button{border:0;border-radius:16px;padding:0 14px;font-weight:900;background:#83df3f;color:#071506}.admin-image-note{font-size:12px;opacity:.75;margin-top:6px}';
  document.head.appendChild(style);
}

function safeText(value) {
  return String(value || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function getDb() {
  const cfg = window.MINIGROUP_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return null;
  return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}

async function forceAdminProductList() {
  addAdminImageStyle();
  const box = document.getElementById('adminProducts');
  const dash = document.getElementById('adminDashboard');
  const db = getDb();
  if (!box || !db) return;
  if (dash && dash.hidden) return;

  const { data, error } = await db
    .from('products')
    .select('id,name,emoji,category,is_active,created_at')
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

  box.innerHTML = data.map(item => {
    const img = isUrl(item.emoji) ? item.emoji : '';
    return `
      <article class="order-card">
        <header>
          <strong>${safeText(item.name)}</strong>
          <button class="btn btn-soft" type="button" data-force-remove-id="${safeText(item.id)}">لابردن</button>
        </header>
        ${img ? `<img class="admin-product-photo" src="${safeText(img)}" alt="${safeText(item.name)}">` : `<div class="admin-product-photo" style="display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.55);font-weight:900;">وێنە دانەنراوە</div>`}
        <div class="admin-image-editor">
          <input type="url" value="${safeText(img)}" placeholder="لینکی وێنەی بەرهەم" data-image-input="${safeText(item.id)}">
          <button type="button" data-save-image-id="${safeText(item.id)}">پاشەکەوتی وێنە</button>
        </div>
        <div class="admin-image-note">لینکی ڕاستەوخۆی وێنە دابنێ، وەک https://...jpg یان https://...png</div>
        <div class="order-meta"><span>${safeText(item.category)}</span><span>چالاک</span></div>
      </article>
    `;
  }).join('');
}

async function saveProductImage(id) {
  const db = getDb();
  if (!db) return;
  const input = document.querySelector(`[data-image-input="${CSS.escape(id)}"]`);
  const msg = document.getElementById('productMessage');
  const imageUrl = input ? input.value.trim() : '';
  if (imageUrl && !isUrl(imageUrl)) {
    if (msg) msg.textContent = 'لینکی وێنە پێویستە بە https:// دەست پێ بکات.';
    return;
  }
  const { error } = await db.from('products').update({ emoji: imageUrl }).eq('id', id);
  if (msg) msg.textContent = error ? error.message : 'وێنە هاتە پاشەکەوتکرن.';
  if (!error) await forceAdminProductList();
}

async function removeProduct(id) {
  const db = getDb();
  if (!db) return;
  if (!confirm('دڵنیای دڤێت ئەم بەرهەمە لابەریت؟')) return;
  const { error } = await db.from('products').update({ is_active: false }).eq('id', id);
  const msg = document.getElementById('productMessage');
  if (msg) msg.textContent = error ? error.message : 'بەرهەم هاتە لابردن.';
  if (!error) await forceAdminProductList();
}

document.addEventListener('click', event => {
  const removeBtn = event.target.closest('[data-force-remove-id]');
  if (removeBtn) {
    removeProduct(removeBtn.dataset.forceRemoveId);
    return;
  }
  const saveImageBtn = event.target.closest('[data-save-image-id]');
  if (saveImageBtn) {
    saveProductImage(saveImageBtn.dataset.saveImageId);
  }
});

patchAdminForm();
patchWords();
setTimeout(forceAdminProductList, 900);
setInterval(() => {
  patchAdminForm();
  patchWords();
}, 4000);
