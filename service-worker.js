// Cache name
const CACHE_NAME = 'pomodoro-timer-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/25.png',
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css'
];

// Install event - caches assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - cleans up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both fail, show offline page
        return caches.match('/');
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data.type === 'TIMER_COMPLETE') {
    self.registration.showNotification('Pomodoro Timer', {
      body: '¡Tu tiempo ha terminado!',
      icon: '/src/25.png',
      badge: '/src/25.png',
      vibrate: [200, 100, 200]
    });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // If there's an open window, focus it
        for (let client of windowClients) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
