const STATIC_CACHE_NAME = 'udacity-static-v1';
const BACKEND_URL = 'http://localhost:1337/';

self.addEventListener('error', function (e) {
    console.log('SW ERROR', e.filename, e.lineno, e.colno, e.message);
});

self.addEventListener('install', function (event) {
    console.log('install', event);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(function (cache) {
            return cache.addAll([
                'js/main.js',
                'js/dbhelper.js',
                'js/restaurant_info.js',
                'js/idb.js',
                'js/lazysizes.min.js',
                'js/modernizr-custom.js',
                'css/styles.css',
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg',
                'img/1_320w.jpg',
                'img/2_320w.jpg',
                'img/3_320w.jpg',
                'img/4_320w.jpg',
                'img/5_320w.jpg',
                'img/6_320w.jpg',
                'img/7_320w.jpg',
                'img/8_320w.jpg',
                'img/9_320w.jpg',
                'img/10_320w.jpg',
                'img/webp/1.webp',
                'img/webp/2.webp',
                'img/webp/3.webp',
                'img/webp/4.webp',
                'img/webp/5.webp',
                'img/webp/6.webp',
                'img/webp/7.webp',
                'img/webp/8.webp',
                'img/webp/9.webp',
                'img/webp/10.webp',
                'img/webp/1_320w.webp',
                'img/webp/2_320w.webp',
                'img/webp/3_320w.webp',
                'img/webp/4_320w.webp',
                'img/webp/5_320w.webp',
                'img/webp/6_320w.webp',
                'img/webp/7_320w.webp',
                'img/webp/8_320w.webp',
                'img/webp/9_320w.webp',
                'img/webp/10_320w.webp',
                'index.html',
                'restaurant.html',
                'manifest.json'
            ]);
        })
    );
});

/* We only want SW to GET and handle static resources (either from our web server or google maps api).
 * We ignore our backend server, because we always want the freshest data from it. */
self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET' || event.request.url.startsWith(BACKEND_URL)) {
        return;
    }
    event.respondWith(caches.match(event.request).then(function (response) {
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                let responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then(function (cache) {
                    if (!event.request.url.startsWith('chrome-extension')) {
                        cache.put(event.request, responseClone);
                    }
                });
                return response;
            }).catch(function () {
                return caches.match('img/try_again.png');
            });
        }
    }));
});