(function(){
  function cfg(){return window.MINIGROUP_CONFIG||{};}
  function client(){var c=cfg();if(!window.supabase||!c.supabaseUrl||!c.supabaseAnonKey)return null;return window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);}
  function fixWords(){
    document.querySelectorAll('.btn-delivered,[data-order-delivered]').forEach(function(x){x.textContent='گەهاندیە';});
    document.querySelectorAll('.btn-pending,[data-order-pending]').forEach(function(x){x.textContent='چاڤەرێیە';});
    document.querySelectorAll('.btn-delete-order,[data-order-delete]').forEach(function(x){x.textContent='ژێبرن';});
    document.querySelectorAll('.status-pill').forEach(function(x){
      var t=(x.textContent||'').trim();
      if(t==='گەیاندراوە') x.textContent='گەهاندیە';
      if(t==='چاوەڕوانە') x.textContent='چاڤەرێیە';
      if(t==='new'||t==='pending') x.textContent='چاڤەرێیە';
      if(t==='delivered') x.textContent='گەهاندیە';
      if(t==='removed') {
        var item=x.closest('.client-order-item');
        if(item) item.style.display='none';
      }
    });
  }
  async function setStatus(id,status){
    var c=client(); if(!c||!id)return;
    var r=await c.from('orders').update({status:status}).eq('id',id);
    if(r.error){alert('هەڵە ل گۆڕینا ستاتەسێ: '+r.error.message);return;}
    if(typeof window.renderOrdersByClient==='function') window.renderOrdersByClient();
    setTimeout(fixWords,500);
  }
  async function softRemoveOrder(id,button){
    var c=client(); if(!c||!id)return;
    if(!confirm('دڵنیایت دەتەوێت ئەم داخوازێ ژێ ببەیت؟'))return;
    var r=await c.from('orders').update({status:'removed'}).eq('id',id);
    if(r.error){alert('ژێبرن کارنەکرد: '+r.error.message+'\n\nپێویستە مافی UPDATE بۆ orders لە Supabase بدەیت.');return;}
    var item=button&&button.closest('.client-order-item');
    if(item) item.remove();
    if(typeof window.renderOrdersByClient==='function') window.renderOrdersByClient();
    setTimeout(fixWords,500);
  }
  document.addEventListener('click',function(e){
    var delivered=e.target.closest('[data-order-delivered]');
    if(delivered){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setStatus(delivered.getAttribute('data-order-delivered'),'delivered');return;}
    var pending=e.target.closest('[data-order-pending]');
    if(pending){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setStatus(pending.getAttribute('data-order-pending'),'pending');return;}
    var rem=e.target.closest('[data-order-delete]');
    if(rem){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();softRemoveOrder(rem.getAttribute('data-order-delete'),rem);return;}
  },true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(fixWords,1000);});
  setInterval(fixWords,1000);
})();
