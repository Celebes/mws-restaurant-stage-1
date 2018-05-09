let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const favContainer = document.getElementById('favorite-button-wrapper');
    favContainer.innerHTML = '';
    const fav = document.createElement('a');
    const isRestaurantFavorite = DBHelper.isRestaurantFavorite(restaurant.is_favorite);
    DBHelper.updateFavoriteButtonHTML(fav, isRestaurantFavorite);
    fav.onclick = () => DBHelper.toggleRestaurantFavorite(fav, restaurant);
    fav.setAttribute('aria-label', isRestaurantFavorite ? `Unfavorite ${restaurant.name}` : `Mark ${restaurant.name} as favorite`);
    favContainer.append(fav);

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const imgUrl = DBHelper.imageUrlForRestaurant(restaurant, false);
    const imgUrlSmall = DBHelper.imageUrlForRestaurant(restaurant, true);
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img lazyload';
    image.alt = `Restaurant named ${restaurant.name} serving ${restaurant.cuisine_type} food, located in ${restaurant.neighborhood}`;
    image.setAttribute('data-src', imgUrl);
    image.setAttribute('data-srcset', `${imgUrlSmall} 320w, ${imgUrl} 800w`);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    hours.innerHTML = '';
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (restaurant = self.restaurant) => {
    DBHelper.fetchRestaurantReviews(restaurant.id, (error, reviews) => {
        const container = document.getElementById('reviews-container');
        container.innerHTML = '';
        const title = document.createElement('h2');
        title.innerHTML = 'Reviews';
        container.appendChild(title);

        if (error) { // Got an error!
            console.error(error);
            const noReviews = document.createElement('p');
            noReviews.innerHTML = 'Couldn\'t load reviews!';
            container.appendChild(noReviews);
            return;
        }

        if (!reviews) {
            const noReviews = document.createElement('p');
            noReviews.innerHTML = 'No reviews yet!';
            container.appendChild(noReviews);
            return;
        }

        const ul = document.createElement('ul');
        reviews.forEach(review => {
            ul.appendChild(createReviewHTML(review));
        });
        container.appendChild(ul);
    });
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = (new Date(review.createdAt)).toLocaleString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb-current-page');
    breadcrumb.innerHTML = restaurant.name;
    breadcrumb.setAttribute('aria-current', 'page');
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

addReview = (e, form, restaurant = self.restaurant) => {
    e.preventDefault();
    const formData = {
        restaurant_id: restaurant.id,
        name: form.name.value,
        rating: form.rating.value,
        comments: form.comments.value
    };
    console.log('formData', formData);
    DBHelper.addReview(formData, (error, response) => {
        const submitStatus = document.getElementById('submit-status');
        if (error) {
            submitStatus.className = 'status-error';
            submitStatus.innerText = 'ERROR ADDING REVIEW';
        } else {
            submitStatus.className = 'status-success';
            submitStatus.innerText = 'SUCCES ADDING REVIEW';
            fillReviewsHTML();
        }
    });
}