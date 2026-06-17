// サービスワーカーを完全無効化（キャッシュ問題を根本解決）
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});
// fetchイベントは何もしない（全てネットワーク直接アクセス）
