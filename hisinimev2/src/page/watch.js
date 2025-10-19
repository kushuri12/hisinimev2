import { navigateTo } from "../router/router.js";

const API = "https://www.sankavollerei.com/anime/";

async function loadStreaming(animeId, episodeId, container, rekomen) {
  try {
    const res = await fetch(`${API}samehadaku/episode/${episodeId}`);
    const { data } = await res.json();
    if (!data) {
      container.innerText = "Streaming anime tidak tersedia.";
      return;
    }

    container.innerHTML = `
      <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="#" id="backto">Kembali</a>
      <h1 class="mt-5 font-bold text-xl text-center mb-4">${data.title}</h1>

      <div class="flex justify-between mt-3 w-full">
        <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="#" id="backeps"><< Sebelumnya</a>
        <a class="bg-gray-100 text-center p-2 ml-2 rounded text-purple-500 hover:bg-purple-100 transition" href="#" id="nexteps">Selanjutnya >></a>
      </div>

      <iframe id="player" class="w-full aspect-video mt-4 rounded shadow" src="" frameborder="0" allowfullscreen></iframe>

      <div id="qualities" class="mt-4 flex flex-wrap gap-2"></div>
      <div id="servers" class="mt-3 flex flex-wrap gap-2"></div>
    `;

    // Tombol navigasi
    document.getElementById("backto").addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(`/`);
    });

    document.getElementById("nexteps").addEventListener("click", (e) => {
      e.preventDefault();
      if (data.nextEpisode?.episodeId) {
        navigateTo(
          `/anime/watch?id=${animeId}&episode=${data.nextEpisode.episodeId}`
        );
      }
    });
    document.getElementById("backeps").addEventListener("click", (e) => {
      e.preventDefault();
      if (data.prevEpisode?.episodeId) {
        navigateTo(
          `/anime/watch?id=${animeId}&episode=${data.prevEpisode.episodeId}`
        );
      }
    });

    // Render qualities dan servers
    renderQualities(data.server.qualities);

    // Render rekomendasi anime acak
    rekomenAnime(rekomen);

  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil streaming anime.";
  }
}

// =======================
// Rekomendasi Anime Acak
// =======================
async function rekomenAnime(container) {
  try {
    const res = await fetch(`${API}samehadaku/popular`);
    const data = await res.json();

    if (!data?.data || data.data.length === 0) {
      container.innerHTML = `<p class="text-gray-500 p-2">Tidak ada rekomendasi anime.</p>`;
      return;
    }

    container.innerHTML = `
      <h2 class="font-semibold mb-2 text-purple-700 text-lg px-2">Rekomendasi Anime</h2>
      <div class="flex flex-col gap-2 overflow-y-auto max-h-[500px] p-2">
      </div>
    `;

    const listContainer = container.querySelector("div");

    data.data.animeList.forEach((anime) => {
      const card = document.createElement("a");
      card.href = "#";
      card.className = `
        flex items-center gap-3 bg-white p-2 rounded shadow hover:shadow-lg transition
      `;
      card.innerHTML = `
        <img src="${anime.poster}" alt="${anime.title}" class="w-[100px] h-[50px] object-cover rounded-md"/>
        <div class="flex-1">
          <span class="text-purple-800 font-medium truncate">${anime.title}</span>
          <span class="text-xs text-gray-500 block mt-1">${anime.english || ""}</span>
        </div>
      `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(`/anime/detail?id=${anime.animeId}`);
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-gray-500 p-2">Gagal memuat rekomendasi anime.</p>`;
  }
}

// =======================
// Qualities & Servers
// =======================
function renderQualities(qualities) {
  const qEl = document.getElementById("qualities");
  const player = document.getElementById("player");
  qEl.innerHTML = "";

  const savedResolution = localStorage.getItem("preferredResolution");
  let targetButton = null;

  qualities.forEach((q) => {
    if (!q.serverList?.length) return;

    const btn = createButton(q.title, () => {
      localStorage.setItem("preferredResolution", q.title);
      renderServers(q.serverList);
    });
    qEl.appendChild(btn);

    if (savedResolution && q.title === savedResolution) targetButton = btn;
    if (!savedResolution && q.title.includes("720")) targetButton = btn;
  });

  if (targetButton) targetButton.click();
  else qEl.querySelector("button")?.click();
}

function renderServers(servers) {
  const sEl = document.getElementById("servers");
  const player = document.getElementById("player");
  sEl.innerHTML = "";

  servers.forEach((s) => {
    const btn = createButton(s.title, async () => {
      if (s.serverId.startsWith("http")) {
        player.src = s.serverId;
      } else {
        try {
          const res = await fetch(`${API}samehadaku/server/${s.serverId}`);
          const json = await res.json();
          if (json?.data?.url) player.src = json.data.url;
          else {
            player.src = "";
            alert("URL streaming tidak ditemukan.");
          }
        } catch (e) {
          console.error(e);
          alert("Gagal memuat server.");
        }
      }
    });
    sEl.appendChild(btn);
  });
  sEl.querySelector("button")?.click();
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "px-2 py-1 bg-gray-200 rounded hover:bg-purple-200";
  btn.addEventListener("click", () => {
    btn.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("bg-purple-500", "text-white"));
    btn.classList.add("bg-purple-500", "text-white");
    onClick();
  });
  return btn;
}

export function watch() {
  setTimeout(() => {
    const container = document.getElementById("container");
    const rekomen = document.getElementById("rekomen");

    const urlParams = new URLSearchParams(location.search);
    const animeId = urlParams.get("id");
    const episodeId = urlParams.get("episode") || urlParams.get("id"); // fallback

    document.title = animeId || "Streaming";

    if (!animeId) container.innerText = "Maaf, streaming tidak ditemukan";
    else loadStreaming(animeId, episodeId, container, rekomen);
  }, 0);

  return `
  <div class="flex flex-col md:flex-row md:m-2 gap-2  ">
    <div id="container" class="bg-white w-screen md:w-[100vh] rounded p-3">Sedang memuat konten...</div>
    <div id="rekomen" class="bg-white w-screen md:w-[100vh] rounded p-3"></div>
  </div>
  `;
}
