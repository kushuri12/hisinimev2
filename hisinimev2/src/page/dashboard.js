import { getCurrentUser, logout } from '../auth.js';
import { getFavorites, removeFavorite } from '../storage/storage.js';
import { navigateTo } from '../router/router.js';

function createDashboardPage() {
  return function() {
    const user = getCurrentUser();
    if (!user) {
      // Redirect to home if not logged in
      navigateTo('/');
      return;
    }

    setTimeout(async () => {
      document.title = 'Dashboard - HisiNime v2';

      // Fetch favorites asynchronously
      let favorites = [];
      try {
        favorites = await getFavorites();
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }

      // Update the favorites section
      const favoritesContainer = document.getElementById('favorites-container');
      if (favoritesContainer) {
        favoritesContainer.innerHTML = `
          <h2 class="text-gradient font-bold text-xl mb-4">Favorit Anda (${favorites.length})</h2>
          ${favorites.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${favorites.map(anime => `
                <div class="card p-4 hover:bg-gray-700 transition relative" data-id="${anime.id}" data-source="${anime.source}">
                  <img src="${anime.poster}" alt="${anime.title}" class="w-full h-32 object-cover rounded mb-2" />
                  <h3 class="font-bold text-sm text-white">${anime.title}</h3>
                  <p class="text-xs text-gray-400">From ${anime.source}</p>
                  <button class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition remove-fav-btn" data-id="${anime.id}" data-source="${anime.source}">Hapus</button>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-gray-400">Belum ada favorit. Tambahkan anime ke favorit dari halaman detail!</p>
          `}
        `;

        // Add click listeners to favorite cards
        favoritesContainer.querySelectorAll('.card').forEach(card => {
          card.addEventListener('click', (e) => {
            // Prevent navigation if remove button is clicked
            if (e.target.classList.contains('remove-fav-btn')) return;
            const id = card.getAttribute('data-id');
            const source = card.getAttribute('data-source');
            navigateTo(`/anime/${source.toLowerCase()}/detail?id=${id}`);
          });
        });

        // Add click listeners to remove buttons
        favoritesContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const source = btn.getAttribute('data-source');
            await removeFavorite(id, source);
            // Refresh favorites
            const updatedFavorites = await getFavorites();
            favoritesContainer.innerHTML = `
              <h2 class="text-gradient font-bold text-xl mb-4">Favorit Anda (${updatedFavorites.length})</h2>
              ${updatedFavorites.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${updatedFavorites.map(anime => `
                    <div class="card p-4 hover:bg-gray-700 transition relative" data-id="${anime.id}" data-source="${anime.source}">
                      <img src="${anime.poster}" alt="${anime.title}" class="w-full h-32 object-cover rounded mb-2" />
                      <h3 class="font-bold text-sm text-white">${anime.title}</h3>
                      <p class="text-xs text-gray-400">From ${anime.source}</p>
                      <button class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition remove-fav-btn" data-id="${anime.id}" data-source="${anime.source}">Hapus</button>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="text-gray-400">Belum ada favorit. Tambahkan anime ke favorit dari halaman detail!</p>
              `}
            `;
            // Re-attach listeners after update
            favoritesContainer.querySelectorAll('.card').forEach(card => {
              card.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-fav-btn')) return;
                const id = card.getAttribute('data-id');
                const source = card.getAttribute('data-source');
                navigateTo(`/anime/${source.toLowerCase()}/detail?id=${id}`);
              });
            });
            favoritesContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
              btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const source = btn.getAttribute('data-source');
                await removeFavorite(id, source);
                // Refresh favorites again
                const refreshedFavorites = await getFavorites();
                favoritesContainer.innerHTML = `
                  <h2 class="text-gradient font-bold text-xl mb-4">Favorit Anda (${refreshedFavorites.length})</h2>
                  ${refreshedFavorites.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      ${refreshedFavorites.map(anime => `
                        <div class="card p-4 hover:bg-gray-700 transition relative" data-id="${anime.id}" data-source="${anime.source}">
                          <img src="${anime.poster}" alt="${anime.title}" class="w-full h-32 object-cover rounded mb-2" />
                          <h3 class="font-bold text-sm text-white">${anime.title}</h3>
                          <p class="text-xs text-gray-400">From ${anime.source}</p>
                          <button class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition remove-fav-btn" data-id="${anime.id}" data-source="${anime.source}">Hapus</button>
                        </div>
                      `).join('')}
                    </div>
                  ` : `
                    <p class="text-gray-400">Belum ada favorit. Tambahkan anime ke favorit dari halaman detail!</p>
                  `}
                `;
              });
            });
          });
        });
      }

      // Logout listener
      const logoutBtn = document.getElementById('logout-dashboard');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await logout();
            navigateTo('/');
          } catch (error) {
            alert('Logout gagal: ' + error.message);
          }
        });
      }

      // Back to home listener
      const backHomeBtn = document.getElementById('back-home');
      if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
          navigateTo('/');
        });
      }
    }, 0);

    return `
      <div class="nav-bar w-screen p-4">
        <div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
          <h1 class="text-gradient font-bold text-xl md:text-2xl text-center">Dashboard - HisiNime v2</h1>

          <div class="flex items-center gap-2 mb-4">
            <span class="text-white">Halo, ${user.displayName || user.email}</span>
            <button id="logout-dashboard" class="btn-secondary text-sm px-3 py-2">Logout</button>
            <button id="back-home" class="btn-primary text-sm px-3 py-2">Kembali ke Home</button>
          </div>
        </div>
      </div>

      <div class="content-section w-full max-w-6xl mx-auto p-4">
        <div class="mb-6">
          <h2 class="text-gradient font-bold text-xl mb-4">Informasi Akun</h2>
          <div class="bg-gray-800 p-4 rounded-lg">
            <p class="text-white"><strong>Nama:</strong> ${user.displayName || 'N/A'}</p>
            <p class="text-white"><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p class="text-white"><strong>UID:</strong> ${user.uid}</p>
            <p class="text-white"><strong>Provider:</strong> ${user.providerData[0]?.providerId || 'N/A'}</p>
          </div>
        </div>

        <div id="favorites-container">
          <h2 class="text-gradient font-bold text-xl mb-4">Favorit Anda (Memuat...)</h2>
          <p class="text-gray-400">Sedang memuat favorit...</p>
        </div>
      </div>
    `;
  };
}

export const dashboard = createDashboardPage();
