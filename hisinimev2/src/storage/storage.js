// localStorage helper
export function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function saveFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}

export function addFavorite(id) {
  let favs = getFavorites();
  if (!favs.includes(id)) {
    favs.push(id);
    saveFavorites(favs);
  }
}

export function removeFavorite(id) {
  let favs = getFavorites();
  favs = favs.filter(a => a !== id);
  saveFavorites(favs);
}
