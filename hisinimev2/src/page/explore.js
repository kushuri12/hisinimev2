import { fetchFromSource } from "../api";
import { navigateTo } from "../router/router";

function processAnimeData(result, source) {
  let animeList = [];

  if (source === "OtakuDesu") {
    if (result?.data?.data?.list && Array.isArray(result.data.data.list)) {
      for (const group of result.data.data.list) {
        if (group.animeList && Array.isArray(group.animeList)) {
          for (const anime of group.animeList) {
            animeList.push({ ...anime, source });
          }
        }
      }
    }
  } else {
    if (result?.data?.data?.list && Array.isArray(result.data.data.list)) {
      for (const group of result.data.data.list) {
        if (group.animeList && Array.isArray(group.animeList)) {
          for (const anime of group.animeList) {
            animeList.push({ ...anime, source });
          }
        }
      }
    } else if (result?.data?.data?.list?.animeList && Array.isArray(result.data.data.list.animeList)) {
      for (const anime of result.data.data.list.animeList) {
        animeList.push({ ...anime, source });
      }
    } else if (result?.data?.data?.animeList && Array.isArray(result.data.data.animeList)) {
      for (const anime of result.data.data.animeList) {
        animeList.push({ ...anime, source });
      }
    }
  }

  return animeList;
}

function processGenreData(result, source) {
  let animeList = [];

  if (source === "OtakuDesu") {
    const rawAnimeList = result.data?.data?.anime || [];
    animeList = rawAnimeList.map(anime => ({ ...anime, animeId: anime.slug, source }));
  } else if (source === "Samehadaku") {
    const rawAnimeList = result.data?.data?.animeList || [];
    animeList = rawAnimeList.map(anime => ({ ...anime, animeId: anime.animeId, source }));
  }

  return animeList;
}

function createAnimeCardHTML(anime) {
  const idKey = "animeId";
  const idValue = anime[idKey];
  if (!idValue) return ''; // Skip if no ID
  const lastPart = idValue.replace(/\/+$/, "").split("/").pop();
  const navPath = anime.source === "OtakuDesu" ? `/anime/otakudesu/detail?id=${lastPart}` : `/anime/samehadaku/detail?id=${idValue}`;
  return `
    <div class="card h-20 w-full cursor-pointer bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition duration-300 shadow-lg hover:shadow-xl flex flex-row items-center gap-3" onclick="window.navigateTo('${navPath}')">
      ${anime.poster ? `<img src="${anime.poster}" alt="${anime.title}" class="w-16 h-16 object-cover rounded">` : ''}
      <div class="flex flex-col justify-center flex-1 min-w-0">
        <h3 class="font-bold text-sm truncate text-white" title="${anime.title}">${anime.title}</h3>
        <span class="text-xs text-gray-400">From ${anime.source}</span>
      </div>
    </div>
  `;
}

let currentPage = 1;
const itemsPerPage = 20;
let allAnimeList = [];
let currentGenreSlug = null;
let currentGenrePage = 1;

function displayPage(page, animeFolder) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageAnime = allAnimeList.slice(start, end);

  const gridHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">${pageAnime.map(createAnimeCardHTML).join('')}</div>`;
  animeFolder.innerHTML = gridHTML;

  // Add pagination controls
  const totalPages = Math.ceil(allAnimeList.length / itemsPerPage);
  if (totalPages > 1) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "flex justify-center mt-4 gap-2";
    paginationDiv.innerHTML = `
      <button id="prevPage" class="btn-secondary text-sm px-3 py-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${page === 1 ? 'disabled' : ''}>Previous</button>
      <span class="text-white text-sm px-3 py-2">Page ${page} of ${totalPages}</span>
      <button id="nextPage" class="btn-secondary text-sm px-3 py-2 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${page === totalPages ? 'disabled' : ''}>Next</button>
    `;
    animeFolder.appendChild(paginationDiv);

    document.getElementById("prevPage").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage, animeFolder);
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage, animeFolder);
      }
    });
  }
}

async function loadAnime() {
  const otakuPromise = fetchFromSource("OtakuDesu", "allanime").then(result => ({ result, source: "OtakuDesu" })).catch(err => ({ failed: true, source: "OtakuDesu", error: err }));
  const samePromise = fetchFromSource("Samehadaku", "allanime").then(result => ({ result, source: "Samehadaku" })).catch(err => ({ failed: true, source: "Samehadaku", error: err }));

  // Race to see which one finishes first (or fails)
  const raceResult = await Promise.race([otakuPromise, samePromise]);

  // Process the first one if successful
  if (!raceResult.failed) {
    const firstAnimeList = processAnimeData(raceResult.result, raceResult.source);
    allAnimeList.push(...firstAnimeList);
  }

  // Now wait for the other one
  const remainingPromise = raceResult.source === "OtakuDesu" ? samePromise : otakuPromise;
  const remainingResult = await remainingPromise;

  if (!remainingResult.failed) {
    const secondAnimeList = processAnimeData(remainingResult.result, remainingResult.source);
    allAnimeList.push(...secondAnimeList);
  }
}

async function loadGenreAnimePage(slug, source, page) {
  const endpointBase = source === "OtakuDesu" ? `genre/${slug}` : `genres/${slug}`;
  const endpoint = `${endpointBase}?page=${page}`;
  const result = await fetchFromSource(source, endpoint);
  const animeList = processGenreData(result, source);
  const pagination = result.data?.pagination;
  return { animeList, pagination };
}

async function loadGenrePage(slug, page) {
  const animeFolder = document.getElementById("animeFolder");
  animeFolder.innerHTML = "Sedang memuat anime...";

  try {
    const [otakuResult, sameResult] = await Promise.all([
      loadGenreAnimePage(slug, "OtakuDesu", page),
      loadGenreAnimePage(slug, "Samehadaku", page)
    ]);

    allAnimeList = [...otakuResult.animeList, ...sameResult.animeList];
    currentGenrePage = page;

    // Determine total pages from pagination (use the max from both sources)
    const otakuPagination = otakuResult.pagination;
    const samePagination = sameResult.pagination;
    const otakuTotalPages = otakuPagination ? (otakuPagination.last_visible_page || otakuPagination.totalPages) : 1;
    const sameTotalPages = samePagination ? (samePagination.last_visible_page || samePagination.totalPages) : 1;
    const totalGenrePages = Math.max(otakuTotalPages, sameTotalPages);

    if (allAnimeList.length === 0) {
      animeFolder.innerHTML = `<p class="text-red-400 text-center">Gagal memuat anime.</p>`;
    } else {
      displayGenrePage(animeFolder, totalGenrePages);
    }
  } catch (err) {
    console.error("Failed to load anime by genre:", err);
    animeFolder.innerHTML = `<p class="text-red-400 text-center">Gagal memuat anime.</p>`;
  }
}

function displayGenrePage(animeFolder, totalGenrePages) {
  const gridHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">${allAnimeList.map(createAnimeCardHTML).join('')}</div>`;
  animeFolder.innerHTML = gridHTML;

  // Add pagination controls for genre pages
  if (totalGenrePages > 1) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "flex justify-center mt-4 gap-2";
    paginationDiv.innerHTML = `
      <button id="prevGenrePage" class="btn-secondary text-sm px-3 py-2 ${currentGenrePage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentGenrePage === 1 ? 'disabled' : ''}>Previous</button>
      <span class="text-white text-sm px-3 py-2">Genre Page ${currentGenrePage} of ${totalGenrePages}</span>
      <button id="nextGenrePage" class="btn-secondary text-sm px-3 py-2 ${currentGenrePage >= totalGenrePages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentGenrePage >= totalGenrePages ? 'disabled' : ''}>Next</button>
    `;
    animeFolder.appendChild(paginationDiv);

    document.getElementById("prevGenrePage").addEventListener("click", () => {
      if (currentGenrePage > 1) {
        loadGenrePage(currentGenreSlug, currentGenrePage - 1);
      }
    });

    document.getElementById("nextGenrePage").addEventListener("click", () => {
      if (currentGenrePage < totalGenrePages) {
        loadGenrePage(currentGenreSlug, currentGenrePage + 1);
      }
    });
  }
}

async function loadGenres() {
  const animeFolder = document.getElementById("animeFolder");
  const otakuGenres = await fetchFromSource("OtakuDesu", "genre");

  const genres = otakuGenres?.data?.data || [];
  animeFolder.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">${genres.map(genre => `<button class="btn-secondary rounded-md bg-gray-800 text-sm px-3 py-2 genre-btn" data-slug="${genre.slug}">${genre.name}</button>`).join('')}</div>`;

  // Add event listeners to genre buttons
  document.querySelectorAll(".genre-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const slug = btn.getAttribute("data-slug");
      currentGenreSlug = slug;
      currentGenrePage = 1;
      loadGenrePage(slug, 1);
    });
  });
}

export function explore() {
  // Reset page state when navigating to explore
  currentPage = 1;
  allAnimeList = [];

  setTimeout(async () => {
    const animeFolder = document.getElementById("animeFolder");

    // Load initial anime
    await loadAnime();

    if (allAnimeList.length === 0) {
      animeFolder.innerHTML = `<p class="text-red-400 text-center">Gagal memuat anime.</p>`;
    } else {
      displayPage(currentPage, animeFolder);
    }

    document.getElementById("animeList").addEventListener("click", async () => {
      allAnimeList = [];
      currentPage = 1;
      animeFolder.innerHTML = "Sedang memuat anime...";
      await loadAnime();
      if (allAnimeList.length === 0) {
        animeFolder.innerHTML = `<p class="text-red-400 text-center">Gagal memuat anime.</p>`;
      } else {
        displayPage(currentPage, animeFolder);
      }
    });
    document.getElementById("genreList").addEventListener("click", () => {
      loadGenres();
    });

  }, 0);

  return `
  <div class="min-h-screen bg-gray-900 text-white">
    <h1 class="text-gradient font-bold text-xl mt-3 p-5 md:text-2xl text-center mb-5">Explore Anime</h1>
    <div class="flex justify-center gap-4 mb-6">
      <button id="animeList" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md">Anime</button>
      <button id="genreList" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md">Genre</button>
    </div>
    <div id="animeFolder" class="max-w-7xl mx-auto rounded-lg shadow-xl p-6 bg-gray-800 overflow-x-auto">
      Sedang memuat anime...
    </div>
  </div>
  `;
}
