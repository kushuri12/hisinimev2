const API = "https://www.sankavollerei.com/anime/";

export function search() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") || "";

  setTimeout(async () => {
    const container = document.getElementById("srch");
    container.innerHTML = `
      <h2 class="text-purple-800 font-bold text-xl mb-4 mt-[-10px] text-center">Hasil Pencarian: "${query}"</h2>
      <div id="results" class="flex flex-wrap gap-3 justify-center"></div>
    `;

    try {
      const res = await fetch(`${API}samehadaku/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data?.data?.animeList || [];

      const resultsContainer = document.getElementById("results");

      if (!results.length) {
        resultsContainer.innerHTML = `<p class="text-gray-500 text-center w-full">Tidak ada hasil ditemukan.</p>`;
        return;
      }

      results.forEach((anime) => {
        const card = document.createElement("div");
        card.className = `
          min-w-[150px] max-w-[150px] bg-white rounded-lg shadow-md p-2 flex flex-col hover:shadow-lg cursor-pointer
        `;
        card.innerHTML = `
          <img src="${anime.poster}" alt="${anime.title}" class="w-full h-auto rounded mb-2 object-cover" />
          <h3 class="text-purple-800 font-bold text-xs line-clamp-2 text-center">${anime.title}</h3>
        `;
        card.addEventListener("click", () => {
          navigateTo(`/anime/detail?id=${anime.animeId}`);
        });
        resultsContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p class="text-red-500 text-center w-full">Gagal mengambil hasil pencarian.</p>`;
    }

    document.getElementById("backto").addEventListener("click", (e) => {
          e.preventDefault();
          navigateTo(`/`);
        });
  }, 0);

  return `
  <a class="absolute left-1 top-1 bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="#" id="backto">Kembali</a>
    <div id="srch" class="flex flex-col gap-4 items-center p-5 min-h-screen bg-gray-50">
      <p class="text-gray-400 text-center">Sedang memuat pencarian...</p>
    </div>
  `;
}
