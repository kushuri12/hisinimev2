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
  const episodeInfo = anime.episode_count ? `Episode ${anime.episode_count}` : (anime.type ? anime.type : '');
  const badgeClass = anime.source === "OtakuDesu" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-blue-500 to-green-500";
  return `
    <div class="card cursor-pointer bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col" onclick="window.navigateTo('${navPath}')" role="button" tabindex="0" aria-label="View details for ${anime.title}">
      <div class="relative">
        ${anime.poster ? `<img src="${anime.poster}" alt="${anime.title}" class="w-full h-32 object-cover rounded-lg mb-3">` : '<div class="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center"><i class="fas fa-image text-gray-500 text-2xl"></i></div>'}
        ${episodeInfo ? `<span class="absolute top-2 right-2 rounded-full ${badgeClass} text-white text-xs px-2 py-1 font-semibold shadow-lg">${episodeInfo}</span>` : ''}
      </div>
      <div class="flex flex-col flex-1">
        <h3 class="font-bold text-sm mb-2 line-clamp-2 text-white" title="${anime.title}">${anime.title}</h3>
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

  const gridHTML = `<div class="grid-responsive-2x2">${pageAnime.map(createAnimeCardHTML).join('')}</div>`;
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
  animeFolder.innerHTML = `<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>`;

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
  const gridHTML = `<div class="grid-responsive-2x2">${allAnimeList.map(createAnimeCardHTML).join('')}</div>`;
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
  const genreListContainer = document.getElementById("genreListContainer");
  const animeFolder = document.getElementById("animeFolder");

  try {
    const otakuGenres = await fetchFromSource("OtakuDesu", "genre");
    const genres = otakuGenres?.data?.data || [];

    genreListContainer.innerHTML = genres.map(genre => `<button class="btn-secondary w-full text-left text-sm px-3 py-2 genre-btn hover:bg-gray-700 transition-colors" data-slug="${genre.slug}">${genre.name}</button>`).join('');

    // Add event listeners to genre buttons
    document.querySelectorAll(".genre-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        // Remove active class from all buttons
        document.querySelectorAll(".genre-btn").forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        const slug = btn.getAttribute("data-slug");
        currentGenreSlug = slug;
        currentGenrePage = 1;
        animeFolder.innerHTML = `<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>`;
        loadGenrePage(slug, 1);
      });
    });

    // Show all anime initially in genre view
    animeFolder.innerHTML = `<div class="text-center text-gray-400 py-8"><i class="fas fa-list text-4xl mb-4"></i><p>Select a genre to explore anime</p></div>`;
  } catch (err) {
    console.error("Failed to load genres:", err);
    genreListContainer.innerHTML = `<p class="text-red-400 text-center">Failed to load genres</p>`;
  }
}

let currentView = 'anime'; // 'anime' or 'genre'

export function explore() {
  // Reset page state when navigating to explore
  currentPage = 1;
  allAnimeList = [];
  currentView = 'anime';

  setTimeout(async () => {
    const animeFolder = document.getElementById("animeFolder");
    const genreSidebar = document.getElementById("genreSidebar");
    const animeListBtn = document.getElementById("animeList");
    const genreListBtn = document.getElementById("genreList");

    // Load initial anime
    await loadAnime();

    if (allAnimeList.length === 0) {
      animeFolder.innerHTML = `<div class="flex items-center justify-center h-64"><div class="text-red-400 text-center"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Gagal memuat anime.</p></div></div>`;
    } else {
      displayPage(currentPage, animeFolder);
    }

    // Event listeners
    animeListBtn.addEventListener("click", async () => {
      currentView = 'anime';
      animeListBtn.classList.add('active');
      genreListBtn.classList.remove('active');
      genreSidebar.classList.add('hidden');
      animeFolder.classList.remove('md:col-span-3');
      animeFolder.classList.add('md:col-span-4');
      allAnimeList = [];
      currentPage = 1;
      animeFolder.innerHTML = `<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>`;
      await loadAnime();
      if (allAnimeList.length === 0) {
        animeFolder.innerHTML = `<div class="flex items-center justify-center h-64"><div class="text-red-400 text-center"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Gagal memuat anime.</p></div></div>`;
      } else {
        displayPage(currentPage, animeFolder);
      }
    });

    genreListBtn.addEventListener("click", () => {
      currentView = 'genre';
      genreListBtn.classList.add('active');
      animeListBtn.classList.remove('active');
      genreSidebar.classList.remove('hidden');
      animeFolder.classList.remove('md:col-span-4');
      animeFolder.classList.add('md:col-span-3');
      loadGenres();
    });

  }, 0);

  return `
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="nav-bar w-screen p-4">
      <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
        <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">Explore Anime</h1>
        <div class="flex gap-2">
          <button id="animeList" class="btn-primary active">Anime</button>
          <button id="genreList" class="btn-secondary">Genre</button>
        </div>
      </div>
    </div>
    <div class="content-section w-full max-w-7xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div id="genreSidebar" class="hidden md:block md:col-span-1 bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-4 text-gradient">Genres</h3>
          <div id="genreListContainer" class="space-y-2">
            <div class="animate-pulse flex space-x-4">
              <div class="rounded bg-gray-700 h-8 flex-1"></div>
            </div>
            <div class="animate-pulse flex space-x-4">
              <div class="rounded bg-gray-700 h-8 flex-1"></div>
            </div>
          </div>
        </div>
        <div id="animeFolder" class="md:col-span-3 bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}
