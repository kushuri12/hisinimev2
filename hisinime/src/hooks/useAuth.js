import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getLocalFavorites, saveLocalFavorites } from './useStorage.js';

let currentUser = null;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      setUser(user);
      setLoading(false);

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

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    loginWithGoogle,
    logout,
    getCurrentUser: () => currentUser
  };
}

async function migrateFavoritesToFirestore(uid) {
  // Temporarily disable migration to avoid import errors
  // const localFavs = getLocalFavorites();
  // if (localFavs.length > 0) {
  //   const firestoreFavs = await getFavoritesFromFirestore(uid);
  //   if (firestoreFavs.length === 0) {
  //     // Only migrate if Firestore is empty
  //     await saveFavoritesToFirestore(uid, localFavs);
  //     // Clear local storage after migration
  //     saveLocalFavorites([]);
  //   }
  // }
}

function updateAuthUI() {
  // This will be called from components
  const event = new CustomEvent('authStateChanged', { detail: { user: currentUser } });
  window.dispatchEvent(event);
}
