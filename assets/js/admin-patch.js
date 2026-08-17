(function(){
function cfg(){return window.MINIGROUP_CONFIG||{};}
function db(){var c=cfg();if(!window.supabase||!c.supabaseUrl||!c.supabaseAnonKey)return null;return window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);}
function esc(v){return String(v||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function isUrl(v){return /^https?:\/\//i.test(String(v||'').trim());}
function msg(id,t){var x=document.getElementById(id);if(x)x.textContent=t||'';}
function style(){if(document.getElementById('adminPatchCleanCss'))return;var s=document.createElement('style');s.id='adminPatchCleanCss';s.textContent='.admin-product-photo{width:100%;height:145px;object-fit:contain;background:#fff;border-radius:20px;margin:12px 0;padding:8px;box-sizing:border-box}.admin-photo-empty{height:120px;border-radius:20px;margin:12px 0;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,.2);color:rgba(255,255,255,.65);font-weight:900}.admin-image-editor{display:grid;grid-template-columns:1fr auto;gap:10px;margin:12px 0}.admin-image-editor input{width:100%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:16px;padding:13px;color:#fff;font-weight:800}.admin-image-editor button{border:0;border-radius:16px;padding:0 14px;font-weight:900;background:#83df3f;color:#071506}.admin-image-note{font-size:12px;opacity:.72;margin-bottom:10px}';document.head.appendChild(s);}
function patchForms(){style();var sort=document.getElementById('productSort');if(sort&&sort.closest('label'))sort.closest('label').style.display='none';var pe=document.getElementById('productEmoji');if(pe){var l=pe.closest('label');if(l)l.innerHTML='لینکی وێنەی بەرهەم<input id="productEmoji" type="url" placeholder="https://.../image.jpg">';}
var uid=document.getElementById('clientUserId');if(uid&&!document.getElementById('clientEmailInput')){var lab=uid.closest('label');if(lab)lab.outerHTML='<label>ئیمەیڵی کریاری<input id="clientEmailInput" type="email" required placeholder="client@email.com"></label><label>پاسوۆردی کریاری<input id="clientPasswordInput" type="password" required minlength="6" placeholder="پاسوۆرد"></label><input id="clientUserId" type="hidden">';}
var note=document.querySelector('#clientForm')?.previousElementSibling;if(note)note.textContent='ئیمەیڵ، پاسوۆرد، ژمارە، جۆری کار و شوێن بنووسە. User ID خۆکار دروست دەبێت.';}
async function renderProducts(){style();var box=document.getElementById('adminProducts'),dash=document.getElementById('adminDashboard'),client=db();if(!box||!client||dash&&dash.hidden)return;var r=await client.from('products').select('id,name,emoji,category,is_active,created_at').eq('is_active',true).order('created_at',{ascending:false});if(r.error){box.innerHTML='<div class="order-card"><p>'+esc(r.error.message)+'</p></div>';return;}var data=r.data||[];if(!data.length){box.innerHTML='<div class="order-card"><p>هێشتا بەرهەم نەهاتییە زیادکرن.</p></div>';return;}box.innerHTML=data.map(function(p){var img=isUrl(p.emoji)?String(p.emoji).trim():'';return '<article class="order-card"><header><strong>'+esc(p.name)+'</strong><button class="btn btn-soft" type="button" data-remove-prod="'+esc(p.id)+'">لابردن</button></header>'+(img?'<img class="admin-product-photo" src="'+esc(img)+'" alt="'+esc(p.name)+'">':'<div class="admin-photo-empty">وێنە دانەنراوە</div>')+'<div class="admin-image-editor"><input type="url" value="'+esc(img)+'" placeholder="لینکی وێنەی بەرهەم" data-img-input="'+esc(p.id)+'"><button type="button" data-save-img="'+esc(p.id)+'">پاشەکەوتی وێنە</button></div><div class="admin-image-note">لینکی ڕاستەوخۆی وێنە دابنێ، وەک https://...jpg یان https://...png</div><div class="order-meta"><span>'+esc(p.category)+'</span><span>چالاک</span></div></article>';}).join('');}
async function saveImage(id){var client=db(),input=document.querySelector('[data-img-input="'+CSS.escape(id)+'"]');if(!client||!input)return;var url=input.value.trim();if(url&&!isUrl(url)){msg('productMessage','لینکی وێنە پێویستە بە https:// دەست پێ بکات.');return;}var r=await client.from('products').update({emoji:url}).eq('id',id);msg('productMessage',r.error?r.error.message:'وێنە هاتە پاشەکەوتکرن.');if(!r.error)renderProducts();}
async function removeProduct(id){var client=db();if(!client)return;if(!confirm('دڵنیای دڤێت ئەم بەرهەمە لابەریت؟'))return;var r=await client.from('products').update({is_active:false}).eq('id',id);msg('productMessage',r.error?r.error.message:'بەرهەم هاتە لابردن.');if(!r.error)renderProducts();}
function createdUserId(data){return data?.user_id||data?.id||data?.user?.id||data?.data?.user_id||data?.data?.id||data?.data?.user?.id||null;}
async function createClient(event){
  var form=document.getElementById('clientForm');
  if(event.target!==form)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  var client=db();if(!client){msg('clientMessage','Supabase گرێنەدایە.');return;}
  var payload={
    email:document.getElementById('clientEmailInput')?.value.trim()||'',
    password:document.getElementById('clientPasswordInput')?.value.trim()||'',
    name:document.getElementById('clientNameInput')?.value.trim()||'',
    business_type:document.getElementById('clientBusiness')?.value.trim()||'',
    phone:document.getElementById('clientPhone')?.value.trim()||'',
    address:document.getElementById('clientAddress')?.value.trim()||''
  };
  if(!payload.email||!payload.password||!payload.name){msg('clientMessage','ئیمەیڵ، پاسوۆرد و ناڤ پێویستن.');return;}
  msg('clientMessage','خەریکە کریار دروست دەبێت...');
  var r=await client.functions.invoke('create-client',{body:payload});
  if(r.error){msg('clientMessage',r.error.message||'Edge Function کار ناکات.');return;}
  if(r.data&&r.data.error){msg('clientMessage',r.data.error);return;}

  // The profile must use the exact Auth user ID returned by the server.
  var uid=createdUserId(r.data);
  if(uid){
    var sync=await client.from('client_profiles').upsert({
      id:uid,
      name:payload.name,
      business_type:payload.business_type,
      phone:payload.phone,
      address:payload.address,
      is_active:true
    });
    if(sync.error){
      msg('clientMessage','هەژمار دروست بوو، بەڵام profile sync نەبوو: '+sync.error.message);
      return;
    }
  }

  form.reset();
  msg('clientMessage',uid?'کریار بە سەرکەوتوویی دروست بوو و ژمارە ب هەژمارێ گرێدرا.':'کریار دروست بوو.');
  if(typeof loadClients==='function')loadClients();
}
document.addEventListener('click',function(e){var s=e.target.closest('[data-save-img]');if(s){saveImage(s.dataset.saveImg);return;}var d=e.target.closest('[data-remove-prod]');if(d)removeProduct(d.dataset.removeProd);});
document.addEventListener('submit',createClient,true);
document.addEventListener('DOMContentLoaded',function(){patchForms();setTimeout(renderProducts,900);});setInterval(patchForms,1200);setInterval(renderProducts,5000);
})();
