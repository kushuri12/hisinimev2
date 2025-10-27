import { useState, useEffect } from 'react';
import { db } from '../utils/firebase.js';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from './useAuth.js';

// Combined storage hook
export function useStorage() {
  const { user } = useAuth();
  const favoritesHook = useFavorites();
  const historyHook = useHistory();

  // Bookmark time functions
  const getBookmarkTime = async (episodeId) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'bookmarks', episodeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        }
      } catch (error) {
        console.error('Error getting bookmark time:', error);
      }
    } else {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
      return bookmarks[episodeId];
    }
    return null;
  };

  const saveBookmarkTime = async (episodeId, timeData) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'bookmarks', episodeId), timeData);
      } catch (error) {
        console.error('Error saving bookmark time:', error);
      }
    } else {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
      bookmarks[episodeId] = timeData;
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  };

  // Last resolution functions
  const getLastResolution = async (animeId) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'resolutions', animeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().resolution;
        }
      } catch (error) {
        console.error('Error getting last resolution:', error);
      }
    } else {
      const resolutions = JSON.parse(localStorage.getItem('resolutions') || '{}');
      return resolutions[animeId];
    }
    return null;
  };

  const saveLastResolution = async (animeId, resolution) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'resolutions', animeId), { resolution });
      } catch (error) {
        console.error('Error saving last resolution:', error);
      }
    } else {
      const resolutions = JSON.parse(localStorage.getItem('resolutions') || '{}');
      resolutions[animeId] = resolution;
      localStorage.setItem('resolutions', JSON.stringify(resolutions));
    }
  };

  // Preferred resolution functions
  const getPreferredResolution = async () => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'preferences', 'resolutions');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().preferred;
        }
      } catch (error) {
        console.error('Error getting preferred resolution:', error);
      }
    } else {
      return localStorage.getItem('preferredResolution');
    }
    return null;
  };

  const savePreferredResolution = async (resolution) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'preferences', 'resolutions'), { preferred: resolution });
      } catch (error) {
        console.error('Error saving preferred resolution:', error);
      }
    } else {
      localStorage.setItem('preferredResolution', resolution);
    }
  };

  // History save function (wrapper for useHistory)
  const saveHistory = async (animeId, episodeId, episodeTitle, animeTitle, source, poster) => {
    await historyHook.addToHistory(animeId, episodeId, source, animeTitle, poster, episodeTitle);
  };

  return {
    // Favorites
    favorites: favoritesHook.favorites,
    addFavorite: favoritesHook.addFavorite,
    removeFavorite: favoritesHook.removeFavorite,
    getFavorites: async () => favoritesHook.favorites,

    // History
    history: historyHook.history,
    saveHistory,
    removeFromHistory: historyHook.removeFromHistory,

    // Bookmarks
    getBookmarkTime,
    saveBookmarkTime,

    // Resolutions
    getLastResolution,
    saveLastResolution,
    getPreferredResolution,
    savePreferredResolution,
  };
}

// Favorites are saved to Firestore if user is logged in, otherwise not saved
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      getFavoritesFromFirestore(user.uid).then(setFavorites);
    } else {
      setFavorites([]);
    }
  }, [user]);

  const addFavorite = async (id, source, title, poster) => {
    if (!user) return;

    let favs = await getFavoritesFromFirestore(user.uid);
    // Normalize favorites to new format for consistency
    favs = favs.map(fav => {
      if (typeof fav === 'string') {
        return { id: fav, source: 'Samehadaku', title: '', poster: '' }; // Migrate old string format
      } else if (fav && typeof fav === 'object' && fav.id && !fav.source) {
        return { ...fav, source: 'Samehadaku' }; // Add default source if missing
      }
      return fav;
    });
    const exists = favs.some(fav => fav.id === id && fav.source === source);
    if (!exists) {
      favs.push({ id, source, title, poster });
      await saveFavoritesToFirestore(user.uid, favs);
      setFavorites(favs);
    }
  };

  const removeFavorite = async (id, source) => {
    if (!user) return;

    let favs = await getFavoritesFromFirestore(user.uid);
    favs = favs.filter(fav => !(fav.id === id && fav.source === source));
    await saveFavoritesToFirestore(user.uid, favs);
    setFavorites(favs);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite
  };
}

// History functions
export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      getHistoryFromFirestore(user.uid).then(setHistory);
    } else {
      const localHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      setHistory(localHistory);
    }
  }, [user]);

  const addToHistory = async (animeId, episodeId, source, title, poster, episodeTitle) => {
    const historyItem = {
      animeId,
      episodeId,
      source,
      title,
      poster,
      episodeTitle,
      timestamp: Date.now()
    };

    if (user) {
      await saveHistoryToFirestore(user.uid, historyItem);
      const updatedHistory = await getHistoryFromFirestore(user.uid);
      setHistory(updatedHistory);
    } else {
      const localHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      // Remove existing entry for this anime
      const filtered = localHistory.filter(item => !(item.animeId === animeId && item.source === source));
      filtered.unshift(historyItem);
      // Keep only last 100 items
      if (filtered.length > 100) filtered.splice(100);
      localStorage.setItem('watchHistory', JSON.stringify(filtered));
      setHistory(filtered);
    }
  };

  const removeFromHistory = async (index) => {
    if (user) {
      const item = history[index];
      if (item) {
        await removeHistoryFromFirestore(user.uid, item.animeId, item.episodeId, item.source);
        const updatedHistory = await getHistoryFromFirestore(user.uid);
        setHistory(updatedHistory);
      }
    } else {
      const localHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      localHistory.splice(index, 1);
      localStorage.setItem('watchHistory', JSON.stringify(localHistory));
      setHistory(localHistory);
    }
  };

  return {
    history,
    addToHistory,
    removeFromHistory
  };
}

// Firestore helpers - using subcollection approach for better structure
async function getFavoritesFromFirestore(uid) {
  try {
    const favoritesRef = collection(db, 'users', uid, 'favorites');
    const q = query(favoritesRef);
    const querySnapshot = await getDocs(q);
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push(doc.data());
    });
    return favorites;
  } catch (error) {
    console.error('Error getting favorites from Firestore:', error);
    return [];
  }
}

async function saveFavoritesToFirestore(uid, favs) {
  try {
    // Clear existing favorites
    const favoritesRef = collection(db, 'users', uid, 'favorites');
    const q = query(favoritesRef);
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Add new favorites
    const addPromises = favs.map(fav => addDoc(favoritesRef, fav));
    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error saving favorites to Firestore:', error);
  }
}

async function getHistoryFromFirestore(uid) {
  try {
    const historyRef = collection(db, 'users', uid, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push(doc.data());
    });
    return history;
  } catch (error) {
    console.error('Error getting history from Firestore:', error);
    return [];
  }
}

async function saveHistoryToFirestore(uid, historyItem) {
  try {
    const historyRef = collection(db, 'users', uid, 'history');
    // Check if entry already exists for this anime
    const q = query(historyRef, where('animeId', '==', historyItem.animeId), where('source', '==', historyItem.source));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Update existing
      const docId = querySnapshot.docs[0].id;
      await setDoc(doc(db, 'users', uid, 'history', docId), historyItem);
    } else {
      // Add new
      await addDoc(historyRef, historyItem);
    }
  } catch (error) {
    console.error('Error saving history to Firestore:', error);
  }
}

async function removeHistoryFromFirestore(uid, animeId, episodeId, source) {
  try {
    if (!animeId || !source) {
      console.error('Invalid parameters for removing history:', { animeId, source });
      return;
    }
    const historyRef = collection(db, 'users', uid, 'history');
    const q = query(historyRef, where('animeId', '==', animeId), where('source', '==', source));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing history from Firestore:', error);
  }
}

// Local storage helpers for non-logged in users
export function getLocalFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function saveLocalFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}
