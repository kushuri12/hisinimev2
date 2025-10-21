import { fetchFromSource } from '../../api.js';
import { navigateTo } from '../../router/router.js';

export function search() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") || "";
  const page = parseInt(urlParams.get("page")) || 1;

  setTimeout(async () => {
    const container = document.getElementById("srch");
    container.innerHTML = `
      <div class="w-full flex flex-col items-center mb-6">
        <h2 class="text-purple-300 font-bold text-2xl text-center mb-1">
          Hasil Pencarian (Samehadaku)
        </h2>
        <p class="text-gray-300 text-center text-sm">
          "${query}" - Halaman ${page}
        </p>
      </div>
      <div id="results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl"></div>
      <div id="pagination" class="flex justify-center gap-2 mt-6"></div>
    `;

    try {
      const result = await fetchFromSource("Samehadaku", `search?q=${encodeURIComponent(query)}&page=${page}`);
      const results = result?.data?.data?.animeList || [];
      const pagination = result?.data?.pagination || {};
      const resultsContainer = document.getElementById("results");
      const paginationContainer = document.getElementById("pagination");

      if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
          <p class="text-gray-300 text-center col-span-full">Tidak ada hasil ditemukan.</p>
        `;
        return;
      }

      results.forEach((anime) => {
        const card = document.createElement("div");
        card.className = `
      min-w-[150px] max-w-[150px] bg-gray-800 rounded-lg shadow-md
      snap-start flex flex-col hover:shadow-lg transition-shadow relative
    `;
        card.innerHTML = `
      <img src="${anime.poster}" alt="${
          anime.title
        }" class="w-full h-auto rounded mb-3 object-cover" />
          <span class="absolute top-2 right-2 rounded-full bg-purple-600 text-white text-[12px] p-2 font-semibold">${anime.type}</span>
      <div class="flex flex-col items-start pl-3 pr-3">
        <h3 class="font-bold text-white text-sm mb-1 line-clamp-2">${anime.title}</h3>
        <span class="text-xs text-gray-300">Score: ${anime.score}</span>
        <span class="text-xs text-gray-400">From ${result.source}</span>
      </div>
    `;
        card.addEventListener("click", () => {
          navigateTo(`/anime/samehadaku/detail?id=${anime.animeId}`);
        });
        resultsContainer.appendChild(card);
      });

      // Add event listener for back button
      document.getElementById('buttonBAckHOme').addEventListener("click", () => {
        navigateTo(`/anime/samehadaku`);
      });

      // Pagination buttons
      paginationContainer.innerHTML = "";
      if (pagination.hasPrevPage) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Sebelumnya";
        prevBtn.className = "bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600";
        prevBtn.addEventListener("click", () => {
          navigateTo(`/anime/samehadaku/search?q=${encodeURIComponent(query)}&page=${pagination.prevPage}`);
        });
        paginationContainer.appendChild(prevBtn);
      }

      if (pagination.hasNextPage) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Selanjutnya";
        nextBtn.className = "bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600";
        nextBtn.addEventListener("click", () => {
          navigateTo(`/anime/samehadaku/search?q=${encodeURIComponent(query)}&page=${pagination.nextPage}`);
        });
        paginationContainer.appendChild(nextBtn);
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <p class="text-red-400 text-center w-full">Gagal mengambil hasil pencarian.</p>
      `;
    }
  }, 0);

  return `
    <div class="w-full flex justify-start p-4 bg-gray-900 shadow-sm z-10">
      <a
      href="/"
        id="buttonBAckHOme"
        class="bg-gray-700 text-purple-300 px-4 py-2 rounded font-semibold hover:bg-purple-600 transition"
      >Kembali</a>
    </div>
    <div id="srch" class="flex flex-col items-center p-5 mt-3 bg-gray-900 rounded shadow">
      <p class="text-gray-300 text-center">Sedang memuat pencarian...</p>
    </div>
  `;
}
