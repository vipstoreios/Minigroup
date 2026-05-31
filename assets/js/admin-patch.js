function patchAdminForm() {
  const sortInput = document.getElementById('productSort');
  if (sortInput && sortInput.closest('label')) {
    sortInput.closest('label').style.display = 'none';
  }

  const oldEmoji = document.getElementById('productEmoji');
  if (oldEmoji && oldEmoji.tagName !== 'SELECT') {
    const select = document.createElement('select');
    select.id = 'productEmoji';
    select.required = true;
    select.innerHTML = [
      ['🍅','تەماتە'], ['🥒','خەیار'], ['🥬','کاهو'], ['🥔','پەتاتە'],
      ['🧅','پیاز'], ['🫑','بێبەر'], ['🥕','گێزەر'], ['🍋','لیمۆ'],
      ['🍎','سێڤ'], ['🍌','مۆز'], ['🍊','پرتەقاڵ'], ['🍇','تری'],
      ['🍉','شەمامی'], ['🍓','فرێز'], ['🍆','بادمجان'], ['🌽','گەنمەشامی'],
      ['🧄','سیری'], ['🌶️','فلفل']
    ].map(item => `<option value="${item[0]}">${item[0]} ${item[1]}</option>`).join('');
    oldEmoji.replaceWith(select);
  }

  const note = document.querySelector('#clientForm')?.previousElementSibling;
  if (note) {
    note.textContent = 'UID هەمان User ID ـە ل Supabase. بچۆ Authentication → Users، کلیک ل کریاری بکە، User ID کۆپی بکە و ل ڤێرێ دابنێ.';
  }
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

function getProductIdFromCard(card) {
  const btn = card.querySelector('[data-remove-product]');
  return btn?.dataset?.removeProduct || '';
}

function patchProductRemoveButtons() {
  const box = document.getElementById('adminProducts');
  if (!box || !window.MINIGROUP_CONFIG || !window.supabase) return;

  box.querySelectorAll('.order-card').forEach(card => {
    const old = card.querySelector('[data-soft-remove]');
    if (old) old.remove();
    const id = getProductIdFromCard(card);
    if (!id) return;
    const header = card.querySelector('header') || card;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-soft';
    btn.dataset.softRemoveId = id;
    btn.textContent = 'لابردن';
    header.appendChild(btn);
  });
}

async function softRemoveProductById(id) {
  const cfg = window.MINIGROUP_CONFIG || {};
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const ok = confirm('دڵنیای دڤێت ئەم بەرهەمە ل پەڕێ کڕیاران لابەریت؟');
  if (!ok) return;
  const { error } = await db.from('products').update({ is_active: false }).eq('id', id);
  const msg = document.getElementById('productMessage');
  if (msg) msg.textContent = error ? error.message : 'بەرهەم ژ پەڕێ کڕیاران هاتە لابردن.';
  if (!error) {
    const card = document.querySelector(`[data-soft-remove-id="${id}"]`)?.closest('.order-card');
    if (card) card.remove();
    if (typeof loadProducts === 'function') loadProducts();
  }
}

document.addEventListener('click', event => {
  const btn = event.target.closest('[data-soft-remove-id]');
  if (!btn) return;
  softRemoveProductById(btn.dataset.softRemoveId);
});

patchAdminForm();
patchWords();
patchProductRemoveButtons();
setInterval(() => {
  patchAdminForm();
  patchWords();
  patchProductRemoveButtons();
}, 1000);
