const STATIC_CACHE_NAME = 'udacity-static-v1';

self.addEventListener('error', function(e) {
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
                'index.html',
                'restaurant.html'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (response) {
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                let responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then(function (cache) {
                    if(event.request.method !== 'POST' && !event.request.url.startsWith('chrome-extension')) {
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