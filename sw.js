// NewCoin Radar — Service Worker v4.0
const CACHE = 'newcoin-radar-v4';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// index.htmlは常にネットワークから取得（キャッシュしない）
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API・外部サービスは常にネットワーク直接
  if (url.hostname.includes('railway.app') ||
      url.hostname.includes('anthropic.com') ||
      url.hostname.includes('openai.com') ||
      url.hostname.includes('bitget.com') ||
      url.hostname.includes('coinmarketcap.com')) {
    return;
  }

  // index.htmlは常に最新を取得
  if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // その他はキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
