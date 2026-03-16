const CACHE_NAME = 'hokkaido-v18';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/config.js',
  './js/categories.js',
  './js/utils.js',
  './js/currency.js',
  './js/data/days.js',
  './js/data/souvenirs.js',
  './js/data/places.js',
  './js/data/warns.js',
  './js/render/card-helpers.js',
  './js/render/cards.js',
  './js/render/restaurant.js',
  './js/render/meal-tab.js',
  './js/render/souvenir.js',
  './js/render/dashboard.js',
  './js/map/init.js',
  './js/map/peek-card.js',
  './js/ui/sheet.js',
  './js/ui/tabs.js',
  './js/ui/events.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network First：先嘗試網路，失敗才用快取（確保每次部署都能拿到最新版）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
