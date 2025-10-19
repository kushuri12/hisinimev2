import { home } from '../page/home.js';
import { watch } from '../page/watch.js';
import { detail } from '../page/detail.js';
import { search } from '../page/search.js';
import { favorite } from '../page/favorite.js';

const routes = {
    "/": home,
    "/anime/watch": watch,
    "/anime/detail": detail,
    "/anime/search": search,
    "/anime/favorite": favorite,
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
