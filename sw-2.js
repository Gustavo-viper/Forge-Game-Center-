const CACHE = 'forge-game-center-v12-embedded-words';
const APP_SHELL = [
  './', './index.html', './style.css', './app.js', './manifest.json',
  './assets/forge-game-center.png', './assets/cyber-detective.png',
  './assets/forge-pet.png', './assets/hangman-pro.png', './assets/palavras-ocultas.png',
  './games/palavras-ocultas/index.html', './games/palavras-ocultas/style.css',
  './games/palavras-ocultas/manifest.webmanifest', './games/palavras-ocultas/assets/palavras-ocultas-logo.jpg',
  './games/palavras-ocultas/assets/icon-512.png', './games/palavras-ocultas/sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', {status: 503, statusText: 'Offline'});
      });
    })
  );
});
