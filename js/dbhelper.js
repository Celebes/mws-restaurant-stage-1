/**
 * Common database helper functions.
 */
class DBHelper {

    constructor() {
        this.dbPromise = undefined;
    }

    static get DB_PROMISE() {
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }

        if (!this.dbPromise) {
            this.dbPromise = idb.open('restaurants-db', 1, function (upgradeDb) {
                upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
            });
        }
        return this.dbPromise;
    }

    /**
     * Backend URL.
     * Change this to /restaurants API endpoint on your server.
     */
    static get BACKEND_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        DBHelper.fetchRestaurantsFromDB(callback);

        fetch(DBHelper.BACKEND_URL)
            .then(response => {
                if (!response.ok) {
                    Promise.reject(`Request failed. Returned status of ${response.statusText}`);
                }
                return response.json();
            })
            .then(restaurants => {
                DBHelper.saveRestaurantsToDB(restaurants);
                return callback(null, restaurants)
            })
            .catch(error => callback(error, null))
    }

    static fetchRestaurantsFromDB(callback) {
        DBHelper.DB_PROMISE.then(db => {
            if (!db) return;

            db.transaction('restaurants')
                .objectStore('restaurants')
                .getAll()
                .then(restaurants => {
                    if (restaurants && restaurants.length > 0) {
                        callback(null, restaurants);
                    }
                });
        });
    }

    static fetchRestaurantFromDBById(id, callback) {
        DBHelper.DB_PROMISE.then(db => {
            if (!db) return;

            db.transaction('restaurants')
                .objectStore('restaurants')
                .get(Number(id))
                .then(restaurant => {
                    if (restaurant) {
                        callback(null, restaurant);
                    }
                });
        });
    }

    static saveRestaurantsToDB(restaurants) {
        DBHelper.DB_PROMISE.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            for (let restaurant of restaurants) {
                tx.objectStore('restaurants').put(restaurant);
            }
            return tx.complete;
        })
    }

    static saveRestaurantToDB(restaurant) {
        DBHelper.DB_PROMISE.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            tx.objectStore('restaurants').put(restaurant);
            return tx.complete;
        })
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        DBHelper.fetchRestaurantFromDBById(id, callback);
        fetch(`${DBHelper.BACKEND_URL}/${id}`)
            .then(response => {
                if (!response.ok) {
                    Promise.reject(`Request failed. Returned status of ${response.statusText}`);
                }
                return response.json();
            })
            .then(restaurant => {
                DBHelper.saveRestaurantToDB(restaurant);
                return callback(null, restaurant);
            })
            .catch(error => callback(error, null));
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant, smaller) {
        const canUseWebp = document.getElementsByTagName('html').item(0).classList.contains('webp');
        const filePath = canUseWebp ? '/img/webp/' : '/img/';
        const fileName = `${restaurant.photograph ? restaurant.photograph : restaurant.id}`;
        const fileSufix = smaller ? '_320w' : '';
        const fileExtension = canUseWebp ? '.webp' : '.jpg';
        return (`${filePath}${fileName}${fileSufix}${fileExtension}`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }

    /* initially is_favorite is boolean (false) or undefined on the server, but after setting it through PUT, it becomes string */
    static isRestaurantFavorite(favoriteVal) {
        if (favoriteVal) {
            return String(favoriteVal) === 'true' ? true : false;
        } else {
            return false;
        }
    }

    static toggleRestaurantFavorite(fav, restaurant) {
        const newFavoriteValue = !DBHelper.isRestaurantFavorite(restaurant.is_favorite);
        console.log('toggleRestaurantFavorite, new value will be ', newFavoriteValue);
        fetch(`${DBHelper.BACKEND_URL}/${restaurant.id}/?is_favorite=${newFavoriteValue}`, {
            method: 'PUT'
        }).then(response => response.json())
            .then(response => {
                fav.innerHTML = newFavoriteValue ? 'FAVORITE' : 'NOT FAVORITE';
                fav.className = newFavoriteValue ? 'main-button favorite-button' : 'main-button not-favorite-button';
                // update in DB
                restaurant.is_favorite = newFavoriteValue;
                DBHelper.saveRestaurantToDB(restaurant);
            })
            .catch(error => console.error('Error toggleRestaurantFavorite:', error));
    }
}
