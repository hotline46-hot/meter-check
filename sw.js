const V='meter-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(CORE.concat(LIBS).map(u=>c.add(u).catch(()=>{})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const same=u.origin===location.origin;
  if(same&&(r.mode==='navigate'||u.pathname.endsWith('index.html')||u.pathname.endsWith('/'))){
    e.respondWith(
      fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
    return res;
  })));
});
