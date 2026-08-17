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
const phoneInput = document.getElementById('phone');
if (clearCart) clearCart.textContent = 'ژێبرنا تمام';

let PRODUCTS = [];
let cart = [];
let currentClient = null;

const cfg = window.MINIGROUP_CONFIG || {};
const supabaseClient = cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const UNIT_LABELS = { kg:'کیلۆ', g:'گرام', box:'سندوق', sack:'کیس', ginik:'گینیك', piece:'پارچە' };
function unitLabel(unit){ return UNIT_LABELS[unit] || unit || ''; }
function unitOptions(selected='kg'){ return Object.entries(UNIT_LABELS).map(([value,label])=>`<option value="${value}" ${selected===value?'selected':''}>${label}</option>`).join(''); }
function notifyTelegram(order){ if(!supabaseClient)return; supabaseClient.functions.invoke('send-order-telegram',{body:{order}}).catch(error=>console.warn('Telegram notification failed:',error)); }
function openLogin(){ loginError.textContent=''; if(typeof loginDialog.showModal==='function')loginDialog.showModal(); else loginDialog.setAttribute('open',''); }
function closeLogin(){ loginDialog.close?.(); loginDialog.removeAttribute('open'); }

function mergeClient(user, profile){
  const metadata = user?.user_metadata || {};
  return {
    ...user,
    ...(profile || {}),
    name: profile?.name || user?.name || metadata.name || user?.email || 'کریار',
    phone: String(profile?.phone || user?.phone || metadata.phone || '').trim(),
    address: profile?.address || user?.address || metadata.address || '',
    business_type: profile?.business_type || user?.business_type || metadata.business_type || ''
  };
}

async function loadClientProfile(user){
  if(!supabaseClient || !user?.id) return mergeClient(user, null);

  // 1) Preferred path: secure RPC if it exists in Supabase.
  try {
    const rpc = await supabaseClient.rpc('get_my_client_profile');
    if(!rpc.error && rpc.data){
      const profile = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if(profile) return mergeClient(user, profile);
    }
  } catch(error){
    console.warn('Profile RPC unavailable:', error);
  }

  // 2) Normal RLS-protected read by the logged-in Auth user ID.
  try {
    const {data: profile,error} = await supabaseClient
      .from('client_profiles')
      .select('id,name,phone,address,business_type,is_active')
      .eq('id',user.id)
      .maybeSingle();
    if(!error && profile) return mergeClient(user, profile);
    if(error) console.warn('Could not load client profile:', error);
  } catch(error){
    console.warn('Could not load client profile:', error);
  }

  // 3) Fallback for older accounts: reuse the phone from the client's latest own order.
  try {
    const {data: lastOrder,error} = await supabaseClient
      .from('orders')
      .select('phone,address,client_name,place_type')
      .eq('user_id',user.id)
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
    if(!error && lastOrder){
      return mergeClient(user, {
        name:lastOrder.client_name,
        phone:lastOrder.phone,
        address:lastOrder.address,
        business_type:lastOrder.place_type
      });
    }
  } catch(error){
    console.warn('Could not load phone from last order:', error);
  }

  // 4) Final fallback: Auth metadata supplied when the account was created.
  return mergeClient(user, null);
}

function fillClientDetails(){
  clientName.textContent = currentClient?.name || currentClient?.email || 'کریار';
  if(phoneInput){
    phoneInput.value = currentClient?.phone || '';
    phoneInput.readOnly = true;
    phoneInput.setAttribute('aria-readonly','true');
  }
}

async function showDashboard(user){
  currentClient = await loadClientProfile(user);
  fillClientDetails();
  dashboard.hidden=false;
  document.body.style.overflow='hidden';
  if(clearCart)clearCart.textContent='ژێبرنا تمام';
  await loadProducts();
  renderCart();
  await renderOrders();
}
function hideDashboard(){ dashboard.hidden=true; document.body.style.overflow=''; }

async function loadProducts(){
  if(!supabaseClient){productsGrid.innerHTML='<div class="order-card"><p>Supabase گرێنەدایە.</p></div>';return;}
  productsGrid.innerHTML='<div class="order-card"><p>بەرهەم دهێنە وەرگرتن...</p></div>';
  const {data,error}=await supabaseClient.from('products').select('id,name,category,is_active,created_at').eq('is_active',true).order('created_at',{ascending:false});
  if(error){productsGrid.innerHTML=`<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;return;}
  PRODUCTS=data||[]; renderProducts();
}
function renderProducts(){ if(!PRODUCTS.length){productsGrid.innerHTML='<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن. ل ئەدمین داشبۆردێ بەرهەم زیاد بکە.</p></div>';return;} productsGrid.innerHTML=PRODUCTS.map(p=>`<article class="product-order-card"><h3>${escapeHTML(p.name)}</h3><button class="plus-btn" type="button" data-add-product="${p.id}">+</button></article>`).join(''); }
function addProduct(productId){ const product=PRODUCTS.find(item=>item.id===productId); if(!product||cart.some(item=>item.id===product.id))return; cart.push({id:product.id,name:product.name,amount:'',unit:'kg'}); renderCart(); }
function renderCart(){ if(!cart.length){cartItems.innerHTML='<div class="empty-cart">هێشتا چ داخوازی نەهاتینە هەڵبژارتن. هێڤیە بۆ هەڵبژارتنا هەر کەلوپەلەکی کلیك لسەر + بکە</div>';return;} cartItems.innerHTML=cart.map(item=>`<div class="cart-row" data-cart-row="${item.id}"><div class="cart-name"><strong>${escapeHTML(item.name)}</strong></div><input type="number" min="0" step="0.1" value="${escapeHTML(item.amount)}" placeholder="بڕ" data-amount="${item.id}" required><select data-unit="${item.id}">${unitOptions(item.unit)}</select><button type="button" class="remove-btn" data-remove-product="${item.id}">×</button></div>`).join(''); }
async function renderOrders(){ if(!currentClient||!supabaseClient)return; const {data,error}=await supabaseClient.from('orders').select('*').eq('user_id',currentClient.id).order('created_at',{ascending:false}); if(error){ordersContainer.innerHTML=`<div class="order-card"><p>${escapeHTML(error.message)}</p></div>`;return;} if(!data?.length){ordersContainer.innerHTML='<div class="order-card"><p>هێشتا هیچ داخوازیەک نەهاتە ناردن.</p></div>';return;} ordersContainer.innerHTML=data.map(order=>`<article class="order-card"><header><strong>${escapeHTML(order.client_name)}</strong><span class="status-pill">${escapeHTML(order.status||'new')}</span></header><div class="order-meta"><span>جۆرێ جهی: ${escapeHTML(order.place_type)}</span><span>دەم: ${escapeHTML(order.needed_at||'نەهاتە دیارکرن')}</span><span>مۆبایل: ${escapeHTML(order.phone)}</span><span>${escapeHTML(order.address)}</span></div><div class="ordered-products">${(order.items||[]).map(item=>`<span>${escapeHTML(item.name)}: ${escapeHTML(item.amount)} ${escapeHTML(unitLabel(item.unit))}</span>`).join('')}</div>${order.notes?`<p><b>تێبینی:</b><br>${escapeHTML(order.notes)}</p>`:''}<small>${new Date(order.created_at).toLocaleString('ku-IQ')}</small></article>`).join(''); }
function escapeHTML(value){ return String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }

document.querySelectorAll('[data-open-login]').forEach(b=>b.addEventListener('click',openLogin));
document.querySelectorAll('[data-close-login]').forEach(b=>b.addEventListener('click',closeLogin));
loginDialog.addEventListener('click',event=>{const rect=loginDialog.querySelector('.dialog-card').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeLogin();});
loginForm.addEventListener('submit',async event=>{
  event.preventDefault(); loginError.textContent='';
  if(!supabaseClient){loginError.textContent='Supabase هێشتا نەهاتە گرێدان.';return;}
  const email=document.getElementById('username').value.trim();
  const password=document.getElementById('password').value.trim();
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error||!data.user){loginError.textContent=error?.message||'ئەم هەژمارە ڕێپێدراو نییە یان پاسوۆرد هەلەیە.';return;}
  closeLogin();
  await showDashboard({
    id:data.user.id,
    email:data.user.email,
    phone:data.user.phone || '',
    user_metadata:data.user.user_metadata || {},
    name:data.user.user_metadata?.name || data.user.email
  });
});
productsGrid.addEventListener('click',event=>{const b=event.target.closest('[data-add-product]');if(b)addProduct(b.dataset.addProduct);});
cartItems.addEventListener('input',event=>{const input=event.target.closest('[data-amount]');if(!input)return;const item=cart.find(p=>p.id===input.dataset.amount);if(item)item.amount=input.value;});
cartItems.addEventListener('change',event=>{const s=event.target.closest('[data-unit]');if(!s)return;const item=cart.find(p=>p.id===s.dataset.unit);if(item)item.unit=s.value;});
cartItems.addEventListener('click',event=>{const b=event.target.closest('[data-remove-product]');if(!b)return;cart=cart.filter(i=>i.id!==b.dataset.removeProduct);renderCart();});
clearCart.addEventListener('click',()=>{cart=[];renderCart();});
orderForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!currentClient)return openLogin();
  currentClient=await loadClientProfile(currentClient);
  fillClientDetails();
  const selectedItems=cart.filter(item=>Number(item.amount)>0);
  if(!selectedItems.length){orderSuccess.textContent='هیڤیدارین کێمترین یەک داخوازی هەلبژێرە و بڕێ بنڤیسە.';return;}
  if(!currentClient.phone){orderSuccess.textContent='ژمارا پەیوەندیێ بۆ هەژمارا تە لە ئەدمین پانێڵ تۆمار نەکراوە یان profile ـەکە ب هەژمارێ نەگرێدراوە.';return;}
  const order={user_id:currentClient.id,client_name:currentClient.name||currentClient.email,client_email:currentClient.email,place_type:document.getElementById('placeType').value,needed_at:document.getElementById('neededAt').value||null,phone:currentClient.phone,address:document.getElementById('address').value.trim(),items:selectedItems.map(item=>({id:item.id,name:item.name,amount:item.amount,unit:item.unit})),notes:document.getElementById('notes').value.trim()};
  const {error}=await supabaseClient.from('orders').insert(order);
  if(error){orderSuccess.textContent=error.message;return;}
  notifyTelegram(order);
  cart=[];
  orderForm.reset();
  fillClientDetails();
  renderCart();
  await renderOrders();
  orderSuccess.textContent='داخوازی هاتە ناردن. لای مە ب ناڤێ کریاری تۆمار دبیت.';
  setTimeout(()=>{orderSuccess.textContent='';},6000);
});
clearOrders.addEventListener('click',()=>{cart=[];renderCart();});
logoutBtn.addEventListener('click',async()=>{if(supabaseClient)await supabaseClient.auth.signOut();currentClient=null;cart=[];if(phoneInput){phoneInput.value='';phoneInput.readOnly=true;}hideDashboard();});
(async function restoreSession(){
  if(!supabaseClient)return;
  const {data}=await supabaseClient.auth.getSession();
  if(data.session?.user){
    const user=data.session.user;
    await showDashboard({
      id:user.id,
      email:user.email,
      phone:user.phone || '',
      user_metadata:user.user_metadata || {},
      name:user.user_metadata?.name || user.email
    });
  }
})();
