const API = "https://www.sankavollerei.com/anime/";

export function search() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") || "";

  setTimeout(async () => {
    const container = document.getElementById("srch");
    container.innerHTML = `
      <div class="w-full flex flex-col items-center mb-6">
        <h2 class="text-purple-500 font-bold text-2xl text-center mb-1">
          Hasil Pencarian
        </h2>
        <p class="text-gray-500 text-center text-sm">
          “${query}”
        </p>
      </div>
      <div id="results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl"></div>
    `;

    try {
      const res = await fetch(`${API}samehadaku/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data?.data?.animeList || [];
      const resultsContainer = document.getElementById("results");

      if (!results.length) {
        resultsContainer.innerHTML = `
          <p class="text-gray-500 text-center col-span-full">Tidak ada hasil ditemukan.</p>
        `;
        return;
      }

      results.forEach((anime) => {
        const card = document.createElement("div");
        card.className = `
          bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
          hover:shadow-lg hover:-translate-y-1 transition-all duration-200
          flex flex-col
        `;
        card.innerHTML = `
          <img src="${anime.poster}" alt="${anime.title}" 
            class="w-full aspect-[3/4] object-cover"/>
          <div class="p-2 flex flex-col flex-grow">
            <h3 class="text-purple-800 font-semibold text-sm text-center line-clamp-2">
              ${anime.title}
            </h3>
          </div>
        `;
        card.addEventListener("click", () => {
          navigateTo(`/anime/detail?id=${anime.animeId}`);
        });
        resultsContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <p class="text-red-500 text-center w-full">Gagal mengambil hasil pencarian.</p>
      `;
    }

    // tombol kembali
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }, 0);

  return `
    <div class="w-full flex justify-start p-4 bg-white shadow-sm z-10">
      <a 
        href="" 
        id="backto" 
        class="bg-purple-100 text-purple-700 px-4 py-2 rounded font-semibold hover:bg-purple-200 transition"
      >Kembali</a>
    </div>
    <div id="srch" class="flex flex-col items-center p-5 min-h-screen bg-gray-50">
      <p class="text-gray-400 text-center">Sedang memuat pencarian...</p>
    </div>
  `;
}
