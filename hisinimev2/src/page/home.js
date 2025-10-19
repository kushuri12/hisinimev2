const url_api = "https://www.sankavollerei.com/anime/";

async function home_anime() {
  try {
    const res = await fetch(`${url_api}samehadaku/completed`);
    const data = await res.json();
    if (data?.data?.animeList) {
      displayAnime(data.data.animeList, "card-completed");
    } else {
      document.getElementById("card-completed").innerText =
        "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data completed:", err);
    document.getElementById("card-completed").innerText =
      "Gagal mengambil data anime.";
  }
}

async function home_anime2() {
  try {
    const res = await fetch(`${url_api}samehadaku/ongoing`);
    const data = await res.json();
    if (data?.data?.animeList) {
      displayAnime(data.data.animeList, "card-ongoing");
    } else {
      document.getElementById("card-ongoing").innerText =
        "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data ongoing:", err);
    document.getElementById("card-ongoing").innerText =
      "Gagal mengambil data anime.";
  }
}

async function home_movie() {
  try {
    const res = await fetch(`${url_api}samehadaku/movies`);
    const data = await res.json();
    if (data?.data?.animeList) {
      displayAnime(data.data.animeList, "card-movies");
    } else {
      document.getElementById("card-movies").innerText =
        "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data movies:", err);
    document.getElementById("card-movies").innerText =
      "Gagal mengambil data anime.";
  }
}

function displayAnime(animeList, targetId) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.className = `
      min-w-[150px] max-w-[150px] bg-white rounded-lg shadow-md p-3 
      snap-start flex flex-col hover:shadow-lg transition-shadow
    `;
    card.innerHTML = `
      <img src="${anime.poster}" alt="${anime.title}" class="w-full h-auto rounded mb-3 object-cover" />
      <div class="flex flex-col items-start">
        <h3 class="font-bold text-sm mb-1 line-clamp-2">${anime.title}</h3>
      </div>
    `;

    card.addEventListener("click", () => {
      navigateTo(`/anime/detail?id=${anime.animeId}`);
    });

    grid.appendChild(card);
  });
}

export function home() {
  setTimeout(() => {
    // Load anime
    home_anime();
    home_anime2();
    home_movie();

    document.title = "HisiNime v2";

    // Ambil elemen search & navbar setelah HTML ada di DOM
    const searchInput = document.getElementById("input-btn");
    const searchBtn = document.getElementById("search-btn");
    const goToFav = document.getElementById("goToFavorite");

    // Listener search
    const doSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;
      navigateTo(`/anime/search?q=${encodeURIComponent(query)}`);
    };

    searchBtn.addEventListener("click", e => {
      e.preventDefault();
      doSearch();
    });

    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
      }
    });

    // Listener navbar
    goToFav.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(`/anime/favorite`);
    });

  }, 0);

  return `
    <div class="flex justify-between items-center w-screen p-2 pl-3 bg-white shadow rounded">
      <div class="flex flex-col gap-4 items-center">
        <h1 class="text-purple-800 font-bold">HisiNime v2</h1>
      </div>
      <div class="pl-1 pr-1 rounded bg-gray-100 flex items-center gap-1">
        <input
          id="input-btn"
          class="bg-gray-100 focus:outline-none px-2"
          type="text"
          placeholder="Cari anime..."
        />
        <a id="search-btn" class="text-purple-500 px-2" href="#">Cari</a>
      </div>
    </div>

    <div class="flex flex-col gap-4 mt-3 bg-white w-full md:w-[100vh] items-center p-2 rounded shadow">
        <a class="text-purple-500 text-sm font-semibold" href="/" id="goToFavorite">Favorite</a>
      </div>

    <div class="p-2 bg-white mt-5 rounded-tr-md rounded-tl-md w-full md:w-[100vh] font-semibold text-purple-500">Sudah Tamat</div>
    <div id="card-completed" class="p-2 bg-white rounded-br-md rounded-bl-md w-full md:w-[100vh] flex overflow-x-auto gap-2">Sedang memuat konten...</div>

    <div class="p-2 bg-white mt-5 rounded-tr-md rounded-tl-md w-full md:w-[100vh] font-semibold text-purple-500">Sedang Tayang</div>
    <div id="card-ongoing" class="p-2 bg-white rounded-br-md rounded-bl-md w-full md:w-[100vh] flex overflow-x-auto gap-2">Sedang memuat konten...</div>

    <div class="p-2 bg-white mt-5 rounded-tr-md rounded-tl-md w-full md:w-[100vh] font-semibold text-purple-500">Movie</div>
    <div id="card-movies" class="p-2 bg-white rounded-br-md rounded-bl-md w-full md:w-[100vh] flex overflow-x-auto gap-2">Sedang memuat konten...</div>
  `;
}
