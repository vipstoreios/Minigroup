window.MINIGROUP_CONFIG = {
  supabaseUrl: 'https://cnnvphstzgghatzhkplg.supabase.co',
  supabaseAnonKey: 'sb_publishable_tan0GtRWce74GDthcnVUWA_3gamnPQf'
};

(function(){
  function fixBadiniWords(){
    document.querySelectorAll('button, span, b, strong, small').forEach(function(el){
      var text=(el.textContent||'').trim();
      if(text==='گەیاندراوە') el.textContent='گەهاندیە';
      if(text==='چاوەڕوانە') el.textContent='چاڤەرێیە';
      if(text==='سڕینەوە') el.textContent='ژێبرن';
      if(text==='delivered') el.textContent='گەهاندیە';
      if(text==='pending' || text==='new') el.textContent='چاڤەرێیە';
    });
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(fixBadiniWords,800);});
  setInterval(fixBadiniWords,700);
})();
