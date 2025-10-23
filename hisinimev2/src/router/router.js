import { homeOtakuDesu, homeSamehadaku, homeBoth } from '../page/home.js';
import { favoriteBoth } from '../page/favorite.js';
import { searchBoth } from '../page/search.js';
import { dashboard } from '../page/dashboard.js';

// OtakuDesu pages
import { detail as otakudesuDetail } from '../page/otakudesu/detail.js';
import { watch as otakudesuWatch } from '../page/otakudesu/watch.js';

// Samehadaku pages
import { detail as samehadakuDetail } from '../page/samehadaku/detail.js';
import { watch as samehadakuWatch } from '../page/samehadaku/watch.js';

const routes = {
    "/": homeBoth,
    // Combined routes
    "/favorite": favoriteBoth,
    "/search": searchBoth,
    "/dashboard": dashboard,
    // OtakuDesu routes
    "/anime/otakudesu": homeOtakuDesu,
    "/anime/otakudesu/detail": otakudesuDetail,
    "/anime/otakudesu/watch": otakudesuWatch,
    // Samehadaku routes
    "/anime/samehadaku": homeSamehadaku,
    "/anime/samehadaku/detail": samehadakuDetail,
    "/anime/samehadaku/watch": samehadakuWatch,
};

export function navigateTo(path) {
    history.pushState({}, "", path);
    handleRoute();
}

function handleRoute() {
    let path = window.location.pathname;

    if (path === "" || path === "/") {
        path = "/";
    }

    const app = document.getElementById("root");
    const page = routes[path] || (() => "<h2 class='text-red-500'>404 - Halaman tidak ditemukan</h2>");
    app.innerHTML = page();
}

window.onpopstate = handleRoute;
handleRoute();

// supaya bisa dipakai di onclick html
window.navigateTo = navigateTo;
