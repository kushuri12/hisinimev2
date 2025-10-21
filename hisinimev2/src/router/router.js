import { home } from '../page/home.js';

// OtakuDesu pages
import { home as otakudesuHome } from '../page/otakudesu/home.js';
import { search as otakudesuSearch } from '../page/otakudesu/search.js';
import { detail as otakudesuDetail } from '../page/otakudesu/detail.js';
import { watch as otakudesuWatch } from '../page/otakudesu/watch.js';
import { favorite as otakudesuFavorite } from '../page/otakudesu/favorite.js';

// Samehadaku pages
import { home as samehadakuHome } from '../page/samehadaku/home.js';
import { search as samehadakuSearch } from '../page/samehadaku/search.js';
import { detail as samehadakuDetail } from '../page/samehadaku/detail.js';
import { watch as samehadakuWatch } from '../page/samehadaku/watch.js';
import { favorite as samehadakuFavorite } from '../page/samehadaku/favorite.js';

const routes = {
    "/": samehadakuHome,
    // OtakuDesu routes
    "/anime/otakudesu": otakudesuHome,
    "/anime/otakudesu/search": otakudesuSearch,
    "/anime/otakudesu/detail": otakudesuDetail,
    "/anime/otakudesu/watch": otakudesuWatch,
    "/anime/otakudesu/favorite": otakudesuFavorite,
    // Samehadaku routes
    "/anime/samehadaku": samehadakuHome,
    "/anime/samehadaku/search": samehadakuSearch,
    "/anime/samehadaku/detail": samehadakuDetail,
    "/anime/samehadaku/watch": samehadakuWatch,
    "/anime/samehadaku/favorite": samehadakuFavorite,
};

export function navigateTo(path) {
    history.pushState({}, "", path);
    handleRoute();
}

function handleRoute() {
    let path = window.location.pathname;

    if (path === "" || path === "/") {
        path = "/anime/samehadaku";
    }

    const app = document.getElementById("root");
    const page = routes[path] || (() => "<h2 class='text-red-500'>404 - Halaman tidak ditemukan</h2>");
    app.innerHTML = page();
}

window.onpopstate = handleRoute;
handleRoute();

// supaya bisa dipakai di onclick html
window.navigateTo = navigateTo;
