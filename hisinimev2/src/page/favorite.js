import { getFavorites } from '../storage/storage.js';

function createFavoriteBoth() {
  return function() {
    setTimeout(async () => {
      const container = document.getElementById("favorites");
      await renderFavoritesBoth(container, navigateTo);
      document.title = "Favorite";
    }, 0);

    return `
      <div id="favorites" class="mt-3 rounded shadow flex flex-col items-center p-5 w-full md:w-[100vh] bg-gray-900">
        <p class="text-gray-300 text-center">Sedang memuat favorit...</p>
      </div>
    `;
  };
}

async function renderFavoritesBoth(container, navigateTo) {
  // Bersihkan container
  container.innerHTML = '<h1 class="text-gradient font-bold text-xl md:text-2xl text-center mb-5">Favorite</h1>';

  const favs = await getFavorites();

  if (!favs || favs.length === 0) {
    container.innerHTML += '<p class="text-gray-300">Belum ada anime favorit nih...</p>';
    return;
  }

  // Prepare fetch promises for all favorites
  const fetchPromises = favs.map(async (fav) => {
    try {
      // Handle migration: old favorites are strings or objects without source
      let id, source;
      if (typeof fav === 'string') {
        // Old format: just id, assume Samehadaku for migration
        id = fav;
        source = 'Samehadaku';
      } else if (fav && typeof fav === 'object' && fav.id && fav.source) {
        // New format: {id, source}
        id = fav.id;
        source = fav.source;
      } else if (fav && typeof fav === 'object' && fav.id && !fav.source) {
        // Migration case: object with id but no source, assume Samehadaku
        id = fav.id;
        source = 'Samehadaku';
      } else {
        console.warn('Invalid favorite format:', fav);
        return null;
      }

      // Fetch data anime sesuai ID dan source
      const { fetchFromSource } = await import('../api.js');
      const result = await fetchFromSource(source, `anime/${encodeURIComponent(id)}`);

      if (!result.data) {
        console.warn('Data anime tidak ditemukan:', id);
        return null;
      }

      const data = result.data.data;
      return { id, source, data };
    } catch (err) {
      console.error('Gagal load anime favorit:', fav.id || fav, err);
      return null;
    }
  });

  // Wait for all fetches to complete
  const results = await Promise.all(fetchPromises);

  // Filter out null results and render all at once
  const validResults = results.filter(result => result !== null);

  const ul = document.createElement('ul');
  ul.className = 'flex flex-col gap-2 w-full';
  container.appendChild(ul);

  validResults.forEach(({ id, source, data }) => {
    // Buat list item
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer';

    // Konten anime
    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex items-center gap-3';
    const img = document.createElement('img');
    img.src = data.poster;
    img.width = 50;
    img.className = 'rounded-md';
    const textDiv = document.createElement('div');
    textDiv.className = 'flex flex-col';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = data.title || data.english;
    titleSpan.className = 'text-white';
    const episodeSpan = document.createElement('span');
    episodeSpan.textContent = `Episode: ${source === "OtakuDesu" ? data.episode_count : data.episodes}`;
    episodeSpan.className = 'text-sm text-gray-300';
    const sourceSpan = document.createElement('span');
    sourceSpan.textContent = `From ${source}`;
    sourceSpan.className = 'text-xs text-gray-400';

    textDiv.appendChild(titleSpan);
    textDiv.appendChild(episodeSpan);
    textDiv.appendChild(sourceSpan);
    infoDiv.appendChild(img);
    infoDiv.appendChild(textDiv);

    // Gabungkan semuanya
    li.appendChild(infoDiv);
    li.onclick = () => navigateTo(`/anime/${source.toLowerCase()}/detail?id=${id}`);
    ul.appendChild(li);
  });
}

export const favoriteBoth = createFavoriteBoth();
