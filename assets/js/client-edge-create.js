(function(){
function showMsg(text){var m=document.getElementById('clientMessage');if(m)m.textContent=text||'';}
function patchClientForm(){
  var uid=document.getElementById('clientUserId');
  if(!uid||document.getElementById('clientEmailInput'))return;
  var label=uid.closest('label');
  if(label){
    label.outerHTML='<label>ئیمەیڵی کریاری<input id="clientEmailInput" type="email" required placeholder="client@email.com"></label><label>پاسوۆردی کریاری<input id="clientPasswordInput" type="password" required minlength="6" placeholder="پاسوۆرد"></label><input id="clientUserId" type="hidden">';
  }
  var note=document.querySelector('#clientForm')?.previousElementSibling;
  if(note)note.textContent='ئیمەیڵ، پاسوۆرد، ژمارە، جۆری کار و شوێن بنووسە. User ID خۆکار دروست دەبێت.';
}
async function submitClient(event){
  var form=document.getElementById('clientForm');
  if(event.target!==form)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  var cfg=window.MINIGROUP_CONFIG||{};
  if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey){showMsg('Supabase گرێنەدایە.');return;}
  var db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  var payload={
    email:document.getElementById('clientEmailInput').value.trim(),
    password:document.getElementById('clientPasswordInput').value.trim(),
    name:document.getElementById('clientNameInput').value.trim(),
    business_type:document.getElementById('clientBusiness').value.trim(),
    phone:document.getElementById('clientPhone').value.trim(),
    address:document.getElementById('clientAddress').value.trim()
  };
  if(!payload.email||!payload.password||!payload.name){showMsg('ئیمەیڵ، پاسوۆرد و ناڤ پێویستن.');return;}
  showMsg('خەریکە کریار دروست دەبێت...');
  var result=await db.functions.invoke('create-client',{body:payload});
  if(result.error){showMsg(result.error.message||'هەڵە لە دروستکردنی کریار.');return;}
  if(result.data&&result.data.error){showMsg(result.data.error);return;}
  form.reset();
  showMsg('کریار بە سەرکەوتوویی دروست بوو.');
  if(typeof loadClients==='function')loadClients();
}
document.addEventListener('DOMContentLoaded',patchClientForm);
setInterval(patchClientForm,1200);
document.addEventListener('submit',submitClient,true);
})();
