(function(){
  'use strict';
  var all=[],cat='All',type='all',q='',tab='home',active=null,where='';
  var $=function(id){return document.getElementById(id)};
  var load=function(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}};
  var store=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  var favs=load('loopa-favs'),recent=load('loopa-recent');
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var isLive=function(w){return !!w.video&&!w._fail};
  var HEART='<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  var MUTED='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 4 6M21 9l-4 6"/></svg>';
  var SOUND='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/></svg>';
  $('yr').textContent=new Date().getFullYear();

  function toast(t){var el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},2200)}
  function hideSplash(){var s=$('splash');if(!s)return;s.classList.add('out');setTimeout(function(){s.remove()},500)}

  var BUILTIN=[{"id": "neon-rain", "title": "Neon Rain", "category": "City", "image": "thumbnails/city.jpg", "video": "videos/city.mp4", "trending": true, "featured": true}, {"id": "aurora-lake", "title": "Aurora Lake", "category": "Nature", "image": "thumbnails/aurora.jpg", "video": "videos/aurora.mp4", "trending": true, "featured": true}, {"id": "red-garage", "title": "Red Garage", "category": "Cars", "image": "thumbnails/car.jpg", "video": "", "trending": true, "featured": true}, {"id": "liquid-gold", "title": "Liquid Gold", "category": "Abstract", "image": "thumbnails/liquid.jpg", "video": "videos/liquid.mp4", "featured": true}, {"id": "golden-forest", "title": "Golden Forest", "category": "Nature", "image": "thumbnails/forest.jpg", "video": "", "trending": true}, {"id": "ringed-drift", "title": "Ringed Drift", "category": "Space", "image": "thumbnails/space.jpg", "video": "videos/space.mp4", "trending": true}, {"id": "turquoise-shore", "title": "Turquoise Shore", "category": "Nature", "image": "thumbnails/ocean.jpg", "video": ""}, {"id": "glass-orbs", "title": "Glass Orbs", "category": "Abstract", "image": "thumbnails/glass.jpg", "video": "", "featured": true}];
  function boot(d){all=(Array.isArray(d)&&d.length?d:BUILTIN).filter(function(w){return w&&w.id&&w.title&&w.image});init();hideSplash()}
  // App wrappers (file://) block fetch, so fall back to the built-in list
  try{fetch('wallpapers.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(boot).catch(function(){boot(BUILTIN)})}catch(e){boot(BUILTIN)}

  function media(w,cls){
    return isLive(w)
      ?'<video class="'+(cls||'')+'" src="'+esc(w.video)+'" poster="'+esc(w.image)+'" muted loop playsinline preload="metadata"></video>'
      :'<img class="'+(cls||'')+'" loading="lazy" src="'+esc(w.image)+'" alt="'+esc(w.title)+'">';
  }
  function badge(w){return isLive(w)?'<span class="tag live">Live</span>':'<span class="tag ghost">HD</span>'}
  function card(w,i){
    return '<button class="card" style="animation-delay:'+((i||0)*40)+'ms" data-id="'+esc(w.id)+'">'+media(w)+badge(w)+
      (favs.indexOf(w.id)>-1?'<span class="heart">'+HEART+'</span>':'')+
      '<div class="cap"><b>'+esc(w.title)+'</b><span>'+esc(w.category)+'</span></div></button>';
  }
  function head(t,sub){return '<div class="sec-h"><h2>'+t+'</h2>'+(sub?'<span>'+sub+'</span>':'')+'</div>'}
  function row(t,items){return items.length?head(t,items.length+' items')+'<div class="hrow">'+items.map(card).join('')+'</div>':''}
  function grid(t,items,empty){return head(t,items.length?items.length+' items':'')+(items.length?'<div class="grid">'+items.map(card).join('')+'</div>':'<p class="empty">'+empty+'</p>')}
  function byIds(ids){return ids.map(function(i){return all.find(function(w){return w.id===i})}).filter(Boolean)}
  function typeOk(w){return type==='all'||(type==='live'?isLive(w):!isLive(w))}

  function init(){
    $('statCount').textContent=all.length;
    var cats=['All'];all.forEach(function(w){if(cats.indexOf(w.category)<0)cats.push(w.category)});
    $('cats').innerHTML=cats.map(function(c){return '<button class="chip" data-cat="'+esc(c)+'">'+esc(c)+'</button>'}).join('');
    render();
  }
  function render(){
    $('favCount').textContent=favs.length;
    document.querySelectorAll('.chip').forEach(function(b){b.classList.toggle('on',b.dataset.cat===cat)});
    document.querySelectorAll('[data-type]').forEach(function(b){b.classList.toggle('on',b.dataset.type===type)});
    document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('on',b.dataset.tab===tab)});
    var list=all.filter(function(w){return typeOk(w)&&(cat==='All'||w.category===cat)&&(w.title+' '+w.category).toLowerCase().indexOf(q.toLowerCase())>-1});
    var h='';
    if(tab==='favs') h=grid('Saved',byIds(favs).filter(typeOk),'Tap the heart on any wallpaper to save it here.');
    else if(tab==='live') h=grid('Live wallpapers',list.filter(isLive),'No live wallpapers yet. Add MP4 videos in wallpapers.json.');
    else if(q||cat!=='All'||type!=='all') h=grid(q?'Results for “'+esc(q)+'”':'Browse',list,'Nothing matches. Try another word or category.');
    else{
      var ft=all.filter(function(w){return w.featured});
      if(ft.length) h+='<div class="hero-wrap">'+ft.map(function(w){return '<button class="hero" data-id="'+esc(w.id)+'">'+media(w,isLive(w)?'':'kb')+'<div class="cap">'+badge(w)+'<b>'+esc(w.title)+'</b><small>'+esc(w.category)+'</small></div></button>'}).join('')+'</div>';
      h+=row('Trending now',all.filter(function(w){return w.trending}));
      h+=row('Live wallpapers',all.filter(isLive));
      h+=row('Recently viewed',byIds(recent));
      h+=grid('All wallpapers',all,'');
    }
    $('main').innerHTML=h;
    watchMedia();
  }

  // play card videos only while visible (saves battery and data)
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p)p.catch(function(){})}else v.pause()})},{threshold:.4}):null;
  function watchMedia(){
    document.querySelectorAll('#main video').forEach(function(v){
      v.addEventListener('error',function(){var id=v.closest('[data-id]').dataset.id;var w=all.find(function(x){return x.id===id});if(w){w._fail=true;var img=document.createElement('img');img.src=w.image;img.alt=w.title;v.replaceWith(img)}},{once:true});
      if(io)io.observe(v);else v.play().catch(function(){});
    });
    document.querySelectorAll('#main img').forEach(function(im){im.addEventListener('error',function(){im.style.opacity=0},{once:true})});
  }

  document.addEventListener('click',function(e){
    var c=e.target.closest('[data-cat]');if(c){cat=c.dataset.cat;render();return}
    var ty=e.target.closest('[data-type]');if(ty){type=ty.dataset.type;render();return}
    var t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;render();window.scrollTo(0,0);return}
    var w=e.target.closest('#main [data-id]');if(w)open(all.find(function(x){return x.id===w.dataset.id}));
  });
  $('q').addEventListener('input',function(e){q=e.target.value.trim();$('clearQ').hidden=!q;render()});
  $('clearQ').onclick=function(){$('q').value='';q='';this.hidden=true;render()};

  function src(){return isLive(active)?active.video:active.image}
  function open(w){
    if(!w)return;active=w;where='';
    recent=[w.id].concat(recent.filter(function(i){return i!==w.id})).slice(0,12);store('loopa-recent',recent);
    $('pCat').textContent=w.category;$('pTitle').textContent=w.title;$('pErr').hidden=true;$('msg').textContent='';
    $('pType').className='tag'+(isLive(w)?' live':'');$('pType').textContent=isLive(w)?'Live':'HD Photo';
    var m=$('media');
    if(isLive(w)){
      $('spin').hidden=false;
      m.innerHTML='<video autoplay loop muted playsinline poster="'+esc(w.image)+'" src="'+esc(w.video)+'"></video>';
      var v=m.querySelector('video');$('mute').hidden=false;$('mute').innerHTML=MUTED;
      v.oncanplay=function(){$('spin').hidden=true};
      v.onerror=function(){w._fail=true;$('spin').hidden=true;m.innerHTML='<img class="kb" src="'+esc(w.image)+'" alt="">';$('mute').hidden=true;$('pErr').hidden=false;$('pType').className='tag';$('pType').textContent='HD Photo'};
    } else {$('spin').hidden=true;m.innerHTML='<img class="kb" src="'+esc(w.image)+'" alt="'+esc(w.title)+'">';$('mute').hidden=true}
    setFav();$('preview').hidden=false;document.body.style.overflow='hidden';
    document.querySelectorAll('#main video').forEach(function(v){v.pause()});
  }
  function close(){$('preview').hidden=true;$('sheet').hidden=true;$('media').innerHTML='';document.body.style.overflow='';render()}
  function setFav(){$('fav').classList.toggle('faved',favs.indexOf(active.id)>-1)}
  $('back').onclick=close;
  window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('preview').hidden){if($('sheet').hidden)close();else $('sheet').hidden=true}});
  $('fav').onclick=function(){var i=favs.indexOf(active.id);if(i>-1){favs.splice(i,1);toast('Removed from saved')}else{favs.push(active.id);toast('Saved to favorites')}store('loopa-favs',favs);setFav()};
  $('mute').onclick=function(){var v=$('media').querySelector('video');if(!v)return;v.muted=!v.muted;this.innerHTML=v.muted?MUTED:SOUND};
  $('apply').onclick=function(){$('dl').href=src();$('dl').setAttribute('download',active.id+(isLive(active)?'.mp4':'.jpg'));$('msg').textContent='';document.querySelectorAll('.opt').forEach(function(o){o.classList.remove('on')});$('sheet').hidden=false};
  $('closeSheet').onclick=function(){$('sheet').hidden=true};
  $('sheet').onclick=function(e){if(e.target===this)this.hidden=true};
  document.querySelectorAll('.opt').forEach(function(o){o.onclick=function(){
    where=o.dataset.where;document.querySelectorAll('.opt').forEach(function(x){x.classList.toggle('on',x===o)});save();
  }});

  function say(t,bad){var m=$('msg');m.textContent=t;m.classList.toggle('bad',!!bad)}
  function absUrl(p){var a=document.createElement('a');a.href=p;return a.href}
  function save(){
    var s=src(),live=isLive(active);
    // Native Android bridge: sets wallpaper directly (1=home, 2=lock, 3=both)
    var B=window.Android||window.AndroidWallpaper;
    if(B&&B.setWallpaper){var flag=where==='Home screen'?1:where==='Lock screen'?2:3;
      try{
        if(live&&B.setLiveWallpaper){B.setLiveWallpaper(absUrl(s));say('Live preview khul raha hai — "Set wallpaper" dabayein ✓')}
        else{B.setWallpaper(absUrl(live?active.image:s),flag);say('Setting wallpaper on '+where.toLowerCase()+'…')}
      }catch(e){say('Could not set wallpaper.',true)}return}
    say('Preparing…');
    var tip=live?' Live videos need a video-wallpaper app on your phone to play on '+where.toLowerCase()+'.':' Then choose "'+where+'".';
    fetch(s).then(function(r){if(!r.ok)throw new Error('net');return r.blob()}).then(function(b){
      var f=new File([b],active.id+(live?'.mp4':'.jpg'),{type:b.type||(live?'video/mp4':'image/jpeg')});
      if(navigator.canShare&&navigator.canShare({files:[f]})){
        return navigator.share({files:[f],title:active.title}).then(function(){say('In the menu, pick "Set as wallpaper" or your Gallery.'+tip)});
      }
      var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();a.remove();
      say('Saved to your downloads. Open it in Gallery → ⋮ → Set as wallpaper.'+tip);
    }).catch(function(e){
      if(e&&e.name==='AbortError'){say('');return}
      say('Couldn\'t save automatically. Use "Just download" below.',true);
    });
  }
})();
