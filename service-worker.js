const CACHE_NAME = 'rajgk-quiz-v4-static';
const DATA_CACHE_NAME = 'rajgk-quiz-v4-data';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/state.js',
  './js/ui.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened static cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-First strategy for data.json
  if (url.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If response is invalid, throw to trigger catch and use cache
          if (!response || response.status !== 200) {
            throw new Error('Network response not valid');
          }
          const responseClone = response.clone();
          caches.open(DATA_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First strategy for static assets
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        // Fetch from network if not in cache
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
          // Don't cache if not a valid response or not our domain/cdn
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // We don't necessarily want to cache everything dynamically for a strict PWA,
          // but if it's an asset (like the font woff2 files), we can cache it in the static cache
          if (url.origin === 'https://fonts.gstatic.com') {
             const responseToCache = response.clone();
             caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache);
             });
          }
          
          return response;
        });
      })
    );
  }
});
