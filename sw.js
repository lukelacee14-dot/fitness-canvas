// Bump CACHE_VERSION whenever any precached file changes so clients pick up
// the new deploy instead of being stuck on a stale cache — activate deletes
// every cache whose name doesn't match the current version.
var CACHE_VERSION = 'v4';
var CACHE_NAME = 'fitness-canvas-' + CACHE_VERSION;

// Keep this in sync with index.html's <script>/<link> tags when adding a
// new module or shared file, and with any local data files a module reads.
var PRECACHE_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/canvas.css',
  'css/modules.css',
  'js/storage.js',
  'js/activity-log.js',
  'js/catalog.js',
  'js/registry.js',
  'js/account-catalog.js',
  'js/account-registry.js',
  'js/tabs.js',
  'js/account-tabs.js',
  'js/remove-confirm.js',
  'js/account-remove-confirm.js',
  'js/tabstrip.js',
  'js/account-tabstrip.js',
  'js/picker.js',
  'js/account-picker.js',
  'js/onboarding.js',
  'js/canvas-hint.js',
  'js/gps-tracker.js',
  'js/exercise-database.js',
  'js/pr-computation.js',
  'js/rest-timer.js',
  'js/main.js',
  'modules/workout-logger/module.js',
  'modules/program-builder/module.js',
  'modules/exercise-library/module.js',
  'modules/rest-timer/module.js',
  'modules/pr-tracker/module.js',
  'modules/meal-tracker/module.js',
  'modules/water-tracker/module.js',
  'modules/recipe-builder/module.js',
  'modules/profile/module.js',
  'modules/sport-info-lookup/module.js',
  'modules/body-measurements/module.js',
  'modules/progress-photos/module.js',
  'modules/sleep-tracker/module.js',
  'modules/soreness-rpe-log/module.js',
  'modules/progress-analytics/module.js',
  'modules/streaks/module.js',
  'modules/activity-feed/module.js',
  'modules/achievements/module.js',
  'modules/leaderboards/module.js',
  'data/nutrition-database.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Cache-first: static assets rarely change between deploys, so serve them
// straight from cache when present. Anything not precached (or fetched
// before the SW installed) is requested from the network and opportunistically
// cached for next time, so the app still works fully offline after one visit.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;

      return fetch(event.request).then(function (response) {
        if (response && response.ok && response.type === 'basic') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function () {
        // Offline and not in cache — nothing more we can do for this request.
      });
    })
  );
});
