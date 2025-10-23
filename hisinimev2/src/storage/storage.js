import { db } from '../firebase.js';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getCurrentUser } from '../auth.js';

// Favorites are saved to Firestore if user is logged in, otherwise not saved
export function getFavorites() {
  const user = getCurrentUser();
  if (user) {
    return getFavoritesFromFirestore(user.uid);
  } else {
    return [];
  }
}

export async function saveFavorites(favs) {
  const user = getCurrentUser();
  if (user) {
    await saveFavoritesToFirestore(user.uid, favs);
  } else {
    // Do not save if not logged in
  }
}

export async function addFavorite(id, source, title, poster) {
  let favs = await getFavorites();
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
    await saveFavorites(favs);
  }
}

export async function removeFavorite(id, source) {
  let favs = await getFavorites();
  favs = favs.filter(fav => !(fav.id === id && fav.source === source));
  await saveFavorites(favs);
}

// Firestore helpers - using subcollection approach for better structure
export async function getFavoritesFromFirestore(uid) {
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

export async function saveFavoritesToFirestore(uid, favs) {
  try {
    // Clear existing favorites
    const favoritesRef = collection(db, 'users', uid, 'favorites');
    const q = query(favoritesRef);
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Add new favorites
    const addPromises = favs.map(fav =>
      addDoc(favoritesRef, {
        source: fav.source,
        title: fav.title,
        poster: fav.poster,
        id: fav.id
      })
    );
    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error saving favorites to Firestore:', error);
  }
}

// Alternative: Simple document approach (uncomment if preferred)
// export async function getFavoritesFromFirestore(uid) {
//   try {
//     const docRef = doc(db, 'users', uid);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       return docSnap.data().favorites || [];
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error('Error getting favorites from Firestore:', error);
//     return [];
//   }
// }

// export async function saveFavoritesToFirestore(uid, favs) {
//   try {
//     const docRef = doc(db, 'users', uid);
//     await setDoc(docRef, { favorites: favs }, { merge: true });
//   } catch (error) {
//     console.error('Error saving favorites to Firestore:', error);
//   }
// }

// Bookmark time functions for episodes
export async function getBookmarkTime(episodeId) {
  const user = getCurrentUser();
  if (user) {
    return getBookmarkTimeFromFirestore(user.uid, episodeId);
  } else {
    // Fallback to localStorage
    const savedTime = JSON.parse(localStorage.getItem(`episodeTime-${episodeId}`));
    return savedTime || null;
  }
}

export async function saveBookmarkTime(episodeId, timeData) {
  const user = getCurrentUser();
  if (user) {
    await saveBookmarkTimeToFirestore(user.uid, episodeId, timeData);
  } else {
    // Fallback to localStorage
    localStorage.setItem(`episodeTime-${episodeId}`, JSON.stringify(timeData));
  }
}

export async function getBookmarkTimeFromFirestore(uid, episodeId) {
  try {
    const docRef = doc(db, 'users', uid, 'bookmarks', episodeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting bookmark time from Firestore:', error);
    return null;
  }
}

export async function saveBookmarkTimeToFirestore(uid, episodeId, timeData) {
  try {
    const docRef = doc(db, 'users', uid, 'bookmarks', episodeId);
    await setDoc(docRef, timeData);
  } catch (error) {
    console.error('Error saving bookmark time to Firestore:', error);
  }
}

// Resolution preference functions
export async function getPreferredResolution() {
  const user = getCurrentUser();
  if (user) {
    return getPreferredResolutionFromFirestore(user.uid);
  } else {
    return localStorage.getItem("preferredResolution") || null;
  }
}

export async function savePreferredResolution(resolution) {
  const user = getCurrentUser();
  if (user) {
    await savePreferredResolutionToFirestore(user.uid, resolution);
  } else {
    localStorage.setItem("preferredResolution", resolution);
  }
}

export async function getPreferredResolutionFromFirestore(uid) {
  try {
    const docRef = doc(db, 'users', uid, 'settings', 'resolution');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().value || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting preferred resolution from Firestore:', error);
    return null;
  }
}

export async function savePreferredResolutionToFirestore(uid, resolution) {
  try {
    const docRef = doc(db, 'users', uid, 'settings', 'resolution');
    await setDoc(docRef, { value: resolution });
  } catch (error) {
    console.error('Error saving preferred resolution to Firestore:', error);
  }
}

// Last resolution per anime for OtakuDesu
export async function getLastResolution(animeId) {
  const user = getCurrentUser();
  if (user) {
    return getLastResolutionFromFirestore(user.uid, animeId);
  } else {
    return localStorage.getItem(`lastResolution-${animeId}`) || "main";
  }
}

export async function saveLastResolution(animeId, resolution) {
  const user = getCurrentUser();
  if (user) {
    await saveLastResolutionToFirestore(user.uid, animeId, resolution);
  } else {
    localStorage.setItem(`lastResolution-${animeId}`, resolution);
  }
}

export async function getLastResolutionFromFirestore(uid, animeId) {
  try {
    const docRef = doc(db, 'users', uid, 'settings', `lastResolution-${animeId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().value || "main";
    } else {
      return "main";
    }
  } catch (error) {
    console.error('Error getting last resolution from Firestore:', error);
    return "main";
  }
}

export async function saveLastResolutionToFirestore(uid, animeId, resolution) {
  try {
    const docRef = doc(db, 'users', uid, 'settings', `lastResolution-${animeId}`);
    await setDoc(docRef, { value: resolution });
  } catch (error) {
    console.error('Error saving last resolution to Firestore:', error);
  }
}
