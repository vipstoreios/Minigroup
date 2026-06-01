(function(){
  function patch(){
    var hero=document.querySelector('.dash-hero');
    if(hero){
      var e=hero.querySelector('.eyebrow');
      var h=hero.querySelector('h1');
      var p=hero.querySelector('p:not(.eyebrow)');
      if(e)e.textContent='لیستا بکڕی';
      if(h)h.textContent='کەلووپەلان هەڵبژێرە';
      if(p)p.textContent='هەر کەلووپەلەکێ داخوازی لسەر + بکە و بڕێ وی دیار بکە بکیلۆ یان سندوق یان کیس یان گینیك پاشان داخوازیێ بهنێرە';
    }
    var clear=document.getElementById('clearCart');
    if(clear)clear.textContent='ژێبرنا تمام';
    document.querySelectorAll('select[data-unit]').forEach(function(s){
      var v=s.value||'kg';
      var html='<option value="kg">کیلۆ</option><option value="g">گرام</option><option value="box">سندوق</option><option value="sack">کیس</option><option value="ginik">گینیك</option>';
      if(s.innerHTML!==html)s.innerHTML=html;
      if(['kg','g','box','sack','ginik'].indexOf(v)>=0)s.value=v;
    });
    document.querySelectorAll('h1,h2,h3,p,span,a,button,small').forEach(function(el){
      if(el.children.length)return;
      var t=el.textContent||'';
      t=t.replaceAll('داشبۆردا کریاری','لیستا بکڕی');
      t=t.replaceAll('کەسکاتی و فێقی هەلبژێرە','کەلووپەلان هەڵبژێرە');
      t=t.replaceAll('ل سەر + دەست بنێ، بڕ ب کیلۆ یان گرام بنڤیسە، پاشان داخوازێ بنێرە. بها ل ڤێرێ نییە.','هەر کەلووپەلەکێ داخوازی لسەر + بکە و بڕێ وی دیار بکە بکیلۆ یان سندوق یان کیس یان گینیك پاشان داخوازیێ بهنێرە');
      el.textContent=t;
    });
  }
  document.addEventListener('DOMContentLoaded',patch);
  document.addEventListener('click',function(){setTimeout(patch,80)});
  document.addEventListener('change',function(){setTimeout(patch,80)});
  setInterval(patch,700);
})();
