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

function getProductNameFromCard(card) {
  const title = card.querySelector('strong')?.textContent || '';
  return title.replace(/[🍅🥒🥬🥔🧅🫑🥕🍋🍎🍌🍊🍇🍉🍓🍆🌽🧄🌶️]/g, '').trim();
}

function patchProductRemoveButtons() {
  const box = document.getElementById('adminProducts');
  if (!box || !window.MINIGROUP_CONFIG || !window.supabase) return;

  box.querySelectorAll('.order-card').forEach(card => {
    if (card.querySelector('[data-soft-remove]')) return;
    const name = getProductNameFromCard(card);
    if (!name || name.includes('هێشتا') || name.includes('permission') || name.includes('policy')) return;

    const header = card.querySelector('header') || card;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-soft';
    btn.dataset.softRemove = name;
    btn.textContent = 'لابردن';
    header.appendChild(btn);
  });
}

async function softRemoveProductByName(name) {
  const cfg = window.MINIGROUP_CONFIG || {};
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const ok = confirm('دڵنیای دڤێت ئەم بەرهەمە ل پەڕێ کڕیاران لابەریت؟');
  if (!ok) return;
  const { error } = await db.from('products').update({ is_active: false }).eq('name', name);
  const msg = document.getElementById('productMessage');
  if (msg) msg.textContent = error ? error.message : 'بەرهەم ژ پەڕێ کڕیاران هاتە لابردن.';
  if (!error && typeof loadProducts === 'function') loadProducts();
}

document.addEventListener('click', event => {
  const btn = event.target.closest('[data-soft-remove]');
  if (!btn) return;
  softRemoveProductByName(btn.dataset.softRemove);
});

patchAdminForm();
patchProductRemoveButtons();
setInterval(() => {
  patchAdminForm();
  patchProductRemoveButtons();
}, 1000);
