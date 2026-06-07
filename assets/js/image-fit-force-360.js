(function(){
function forceFit(){
  document.querySelectorAll('.product-order-card img, .item-photo').forEach(function(img){
    img.style.setProperty('width','100%','important');
    img.style.setProperty('height','140px','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center center','important');
    img.style.setProperty('background','#ffffff','important');
    img.style.setProperty('border-radius','18px','important');
    img.style.setProperty('padding','8px','important');
    img.style.setProperty('box-sizing','border-box','important');
    img.style.setProperty('display','block','important');
    img.style.setProperty('margin-bottom','12px','important');
  });
}
function style(){
  if(document.getElementById('imageFitForce360')) return;
  var s=document.createElement('style');
  s.id='imageFitForce360';
  s.textContent='.product-order-card img,.product-order-card .item-photo{width:100%!important;height:140px!important;object-fit:contain!important;object-position:center center!important;background:#fff!important;border-radius:18px!important;padding:8px!important;box-sizing:border-box!important;display:block!important;margin-bottom:12px!important;}';
  document.head.appendChild(s);
}
document.addEventListener('DOMContentLoaded',function(){style();forceFit();});
document.addEventListener('click',function(){setTimeout(forceFit,120);});
setInterval(function(){style();forceFit();},300);
})();
