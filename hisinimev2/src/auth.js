import { auth } from './firebase.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFavorites as getLocalFavorites, saveFavorites as saveLocalFavorites } from './storage/storage.js';
import { getFavoritesFromFirestore, saveFavoritesToFirestore } from './storage/storage.js';

let currentUser = null;

export function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      console.log('User logged in:', user.displayName);
      // Migrate local favorites to Firestore
      await migrateFavoritesToFirestore(user.uid);
    } else {
      console.log('User logged out');
    }
    // Update UI
    updateAuthUI();
  });
}

export function getCurrentUser() {
  return currentUser;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}



export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

async function migrateFavoritesToFirestore(uid) {
  const localFavs = getLocalFavorites();
  if (localFavs.length > 0) {
    const firestoreFavs = await getFavoritesFromFirestore(uid);
    if (firestoreFavs.length === 0) {
      // Only migrate if Firestore is empty
      await saveFavoritesToFirestore(uid, localFavs);
      // Clear local storage after migration
      saveLocalFavorites([]);
    }
  }
}

function updateAuthUI() {
  // This will be called from home.js or wherever UI is updated
  const event = new CustomEvent('authStateChanged', { detail: { user: currentUser } });
  window.dispatchEvent(event);
}
