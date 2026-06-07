(function(){
function style(){
  if(document.getElementById('imageFitStable360')) return;
  var s=document.createElement('style');
  s.id='imageFitStable360';
  s.textContent='.product-order-card{min-height:260px!important}.product-order-card img,.product-order-card .item-photo{width:100%!important;height:140px!important;max-height:140px!important;min-height:140px!important;object-fit:contain!important;object-position:center center!important;background:#fff!important;border-radius:18px!important;padding:8px!important;box-sizing:border-box!important;display:block!important;margin:0 0 12px 0!important;transition:none!important;animation:none!important;transform:none!important}.product-order-card .item-photo-empty{height:140px!important;min-height:140px!important;max-height:140px!important;transition:none!important;animation:none!important}';
  document.head.appendChild(s);
}
function forceOnce(){
  document.querySelectorAll('.product-order-card img, .item-photo').forEach(function(img){
    img.style.width='100%';
    img.style.height='140px';
    img.style.minHeight='140px';
    img.style.maxHeight='140px';
    img.style.objectFit='contain';
    img.style.objectPosition='center center';
    img.style.background='#ffffff';
    img.style.borderRadius='18px';
    img.style.padding='8px';
    img.style.boxSizing='border-box';
    img.style.display='block';
    img.style.margin='0 0 12px 0';
    img.style.transition='none';
    img.style.animation='none';
    img.style.transform='none';
  });
}
function run(){style();forceOnce();}
document.addEventListener('DOMContentLoaded',function(){run();setTimeout(run,300);setTimeout(run,1200);});
document.addEventListener('click',function(){setTimeout(run,180);});
var observer=new MutationObserver(function(){run();});
document.addEventListener('DOMContentLoaded',function(){observer.observe(document.body,{childList:true,subtree:true});});
})();
