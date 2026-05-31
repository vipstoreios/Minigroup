(() => {
  const cfg = window.MINIGROUP_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const box = document.getElementById('adminProducts');
  const msg = document.getElementById('productMessage');

  const safe = value => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  async function renderAdminProducts() {
    if (!box || document.getElementById('adminDashboard')?.hidden) return;
    const { data, error } = await db
      .from('products')
      .select('id,name,emoji,category,is_active,created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      box.innerHTML = `<div class="order-card"><p>${safe(error.message)}</p></div>`;
      return;
    }

    if (!data || !data.length) {
      box.innerHTML = '<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن.</p></div>';
      return;
    }

    box.innerHTML = data.map(item => `
      <article class="order-card">
        <header>
          <strong>${safe(item.emoji)} ${safe(item.name)}</strong>
          <button class="btn btn-soft" type="button" data-admin-remove-id="${safe(item.id)}">لابردن</button>
        </header>
        <div class="order-meta"><span>${safe(item.category)}</span><span>چالاک</span></div>
      </article>
    `).join('');
  }

  document.addEventListener('click', async event => {
    const btn = event.target.closest('[data-admin-remove-id]');
    if (!btn) return;
    if (!confirm('دڵنیای دڤێت ئەم بەرهەمە لابەریت؟')) return;

    const { error } = await db
      .from('products')
      .update({ is_active: false })
      .eq('id', btn.dataset.adminRemoveId);

    if (msg) msg.textContent = error ? error.message : 'بەرهەم هاتە لابردن.';
    if (!error) {
      btn.closest('.order-card')?.remove();
      setTimeout(renderAdminProducts, 300);
    }
  });

  setTimeout(renderAdminProducts, 1000);
  setInterval(renderAdminProducts, 5000);
})();
