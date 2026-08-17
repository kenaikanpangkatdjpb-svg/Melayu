import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_USERS } from '../mockData';
import { UserAccount } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Global flag to track if Firestore write/read quota is exhausted
let isQuotaExceeded = false;

function checkAndSetQuotaError(error: any): boolean {
  if (!error) return false;
  const str = String(error.code || error.message || error).toLowerCase();
  if (str.includes('resource-exhausted') || str.includes('quota') || str.includes('limit exceeded')) {
    if (!isQuotaExceeded) {
      isQuotaExceeded = true;
      console.warn('Firestore write/read quota limit exceeded. Falling back to local state and localStorage.');
    }
    return true;
  }
  return false;
}

// Collection Reference
const USERS_COLLECTION = 'users';

// Helper function to seed initial users to Firestore if collection is empty
export async function syncInitialUsersToFirestore(): Promise<UserAccount[]> {
  const local = localStorage.getItem('melayu_users');
  const fallback = local ? JSON.parse(local) : INITIAL_USERS;

  if (isQuotaExceeded) return fallback;

  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log('Seeding initial users to Firebase Firestore...');
      try {
        for (const u of INITIAL_USERS) {
          await setDoc(doc(db, USERS_COLLECTION, u.id), u);
        }
      } catch (e) {
        checkAndSetQuotaError(e);
      }
      return INITIAL_USERS;
    } else {
      const users: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as UserAccount);
      });
      return users;
    }
  } catch (error) {
    checkAndSetQuotaError(error);
    return fallback;
  }
}

// Fetch all users from Firebase Firestore
export async function getUsersFromFirestore(): Promise<UserAccount[]> {
  const local = localStorage.getItem('melayu_users');
  const fallback = local ? JSON.parse(local) : INITIAL_USERS;

  if (isQuotaExceeded) return fallback;

  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    if (snapshot.empty) {
      return await syncInitialUsersToFirestore();
    }
    const users: UserAccount[] = [];
    snapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserAccount);
    });
    return users;
  } catch (error) {
    checkAndSetQuotaError(error);
    return fallback;
  }
}

// Save or Update User in Firebase Firestore
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

// Delete User from Firebase Firestore
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

// Authenticate user against Firebase Firestore
export async function authenticateUserReal(usernameInput: string, passwordInput: string): Promise<UserAccount | null> {
  try {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    const users = await getUsersFromFirestore();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === trimmedUser && (u.password === trimmedPass || !u.password)
    );

    if (foundUser && foundUser.status === 'Aktif') {
      return foundUser;
    }

    return null;
  } catch (error) {
    checkAndSetQuotaError(error);
    return null;
  }
}

// Sanitize objects recursively to remove any undefined properties for Firestore compatibility
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj as Record<string, any>)) {
      const val = (obj as Record<string, any>)[key];
      if (val !== undefined) {
        result[key] = sanitizeForFirestore(val);
      }
    }
    return result as T;
  }
  return obj;
}

// Generic subscribe with onSnapshot & auto-seed if empty
export function subscribeFirestoreCollection<T extends { id?: string | number }>(
  collectionName: string,
  initialData: T[],
  onUpdate: (data: T[]) => void
): () => void {
  const deletedKey = `melayu_deleted_${collectionName}_ids`;
  const getDeletedIds = (): string[] => {
    try {
      const stored = localStorage.getItem(deletedKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const getLocalFallback = () => {
    const local = localStorage.getItem(`melayu_${collectionName}`);
    const deletedIds = getDeletedIds();
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((it: any) => !deletedIds.includes(String(it.id)));
        }
      } catch (e) {
        return initialData.filter((it: any) => !deletedIds.includes(String(it.id)));
      }
    }
    return initialData.filter((it: any) => !deletedIds.includes(String(it.id)));
  };

  if (isQuotaExceeded) {
    onUpdate(getLocalFallback());
    return () => {};
  }

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        const deletedIds = getDeletedIds();
        const seededMarkerKey = `melayu_${collectionName}_seeded_v2`;
        const isAlreadySeeded = localStorage.getItem(seededMarkerKey) === 'true';

        if (snapshot.empty && !isAlreadySeeded) {
          console.log(`Seeding initial ${collectionName} to Firestore...`);
          const filteredInitial = initialData.filter((it: any) => !deletedIds.includes(String(it.id)));
          onUpdate(filteredInitial);
          localStorage.setItem(seededMarkerKey, 'true');
          if (!isQuotaExceeded) {
            try {
              for (let i = 0; i < filteredInitial.length; i++) {
                const item = filteredInitial[i];
                const docId = item.id ? String(item.id) : `doc_${i}`;
                await setDoc(doc(db, collectionName, docId), sanitizeForFirestore(item));
              }
            } catch (seedErr) {
              checkAndSetQuotaError(seedErr);
            }
          }
        } else {
          localStorage.setItem(seededMarkerKey, 'true');
          const remoteItems: T[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data) {
              const effectiveId = String(data.id || docSnap.id);
              // Filter out any document marked as deleted
              if (!deletedIds.includes(effectiveId) && !deletedIds.includes(docSnap.id)) {
                remoteItems.push({ ...data, id: effectiveId } as T);
              }
            }
          });

          // Check if local cache has newer items not yet in snapshot to avoid accidental overwrite on quick refresh
          const localFallback = getLocalFallback();
          const remoteIdSet = new Set(remoteItems.map(r => String(r.id)));
          const localOnlyItems = localFallback.filter(loc => !remoteIdSet.has(String(loc.id)) && !deletedIds.includes(String(loc.id)));

          // Merge local-only items with remote items (local-only on top so user sees their uploads immediately)
          const combinedItems = [...localOnlyItems, ...remoteItems];

          if (combinedItems.length > 0) {
            onUpdate(combinedItems);
            try {
              localStorage.setItem(`melayu_${collectionName}`, JSON.stringify(combinedItems));
            } catch (e) {
              console.warn(`Unable to cache ${collectionName} in localStorage:`, e);
            }
          } else if (snapshot.empty) {
            onUpdate(getLocalFallback());
          } else {
            onUpdate([]);
          }
        }
      },
      (error) => {
        checkAndSetQuotaError(error);
        onUpdate(getLocalFallback());
      }
    );
    return unsubscribe;
  } catch (err) {
    checkAndSetQuotaError(err);
    onUpdate(getLocalFallback());
    return () => {};
  }
}

// Generic save single item to Firestore
export async function saveFirestoreDoc<T extends { id?: string | number }>(
  collectionName: string,
  item: T
): Promise<void> {
  const docId = item.id ? String(item.id) : `doc_${Date.now()}`;

  // 1. Immediately update local storage cache for instant persistence on refresh
  try {
    const local = localStorage.getItem(`melayu_${collectionName}`);
    const deletedIds: string[] = JSON.parse(localStorage.getItem(`melayu_deleted_${collectionName}_ids`) || '[]');
    let currentList: any[] = local ? JSON.parse(local) : [];
    if (!Array.isArray(currentList)) currentList = [];

    const existingIndex = currentList.findIndex((it: any) => String(it.id) === docId);
    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...item, id: docId };
    } else {
      currentList = [{ ...item, id: docId }, ...currentList];
    }
    const cleanList = currentList.filter(it => !deletedIds.includes(String(it.id)));
    localStorage.setItem(`melayu_${collectionName}`, JSON.stringify(cleanList));
  } catch (cacheErr) {
    console.warn(`[saveFirestoreDoc] Local cache error for ${collectionName}:`, cacheErr);
  }

  if (isQuotaExceeded) return;
  try {
    const itemRef = doc(db, collectionName, docId);
    const sanitized = sanitizeForFirestore({ ...item, id: docId });
    await setDoc(itemRef, sanitized, { merge: true });
    console.log(`[saveFirestoreDoc] Successfully saved ${collectionName}/${docId} to Firestore.`);
  } catch (error) {
    console.error(`[saveFirestoreDoc] Error saving ${collectionName}/${docId} to Firestore:`, error);
    checkAndSetQuotaError(error);
  }
}

// Generic delete doc from Firestore thoroughly (by direct doc ID and matching field ID)
export async function deleteFirestoreDoc(
  collectionName: string,
  id: string
): Promise<void> {
  const targetId = String(id);

  // 1. Instantly record into persistent deleted blacklist to prevent ghost items
  try {
    const deletedKey = `melayu_deleted_${collectionName}_ids`;
    const stored = localStorage.getItem(deletedKey);
    const deletedList: string[] = stored ? JSON.parse(stored) : [];
    if (!deletedList.includes(targetId)) {
      deletedList.push(targetId);
      localStorage.setItem(deletedKey, JSON.stringify(deletedList));
    }
  } catch (e) {}

  if (isQuotaExceeded) return;
  try {
    // 2. Delete direct doc by ID
    const itemRef = doc(db, collectionName, targetId);
    await deleteDoc(itemRef);

    // 3. Scan and delete any documents where docSnap.id or data.id matches targetId
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (docSnap.id === targetId || data.id === targetId || String(data.id) === targetId) {
        deletePromises.push(deleteDoc(doc(db, collectionName, docSnap.id)));
      }
    });
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

// Generic save entire collection (bulk sync on change)
export async function saveFirestoreCollection<T extends { id?: string | number }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    for (let i = 0; i < items.length; i++) {
      if (isQuotaExceeded) break;
      const item = items[i];
      const docId = item.id ? String(item.id) : `doc_${i}`;
      const sanitized = sanitizeForFirestore(item);
      await setDoc(doc(db, collectionName, docId), sanitized, { merge: true });
    }
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

// App Settings & Branding Synchronization across PC and Mobile devices
export interface AppSettings {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  updatedAt?: string;
}

export async function saveAppSettingsToFirestore(settings: Partial<AppSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'appSettings', 'branding');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    if (settings.logoUrl !== undefined) {
      if (settings.logoUrl) {
        localStorage.setItem('app_custom_logo', settings.logoUrl);
      } else {
        localStorage.removeItem('app_custom_logo');
      }
      window.dispatchEvent(new Event('app_logo_updated'));
    }
    if (settings.bannerUrl !== undefined) {
      if (settings.bannerUrl) {
        localStorage.setItem('melayu_hero_bg_image', settings.bannerUrl);
      }
      window.dispatchEvent(new Event('app_banner_updated'));
    }
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

export async function getAppSettingsFromFirestore(): Promise<AppSettings | null> {
  try {
    const docRef = doc(db, 'appSettings', 'branding');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AppSettings;
      if (data.logoUrl) {
        localStorage.setItem('app_custom_logo', data.logoUrl);
        window.dispatchEvent(new Event('app_logo_updated'));
      }
      if (data.bannerUrl) {
        localStorage.setItem('melayu_hero_bg_image', data.bannerUrl);
        window.dispatchEvent(new Event('app_banner_updated'));
      }
      return data;
    }
  } catch (error) {
    checkAndSetQuotaError(error);
  }
  return null;
}

export function subscribeAppSettings(onUpdate?: (settings: AppSettings) => void): () => void {
  try {
    const docRef = doc(db, 'appSettings', 'branding');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppSettings;
        if (data.logoUrl) {
          localStorage.setItem('app_custom_logo', data.logoUrl);
        } else if (data.logoUrl === null) {
          localStorage.removeItem('app_custom_logo');
        }
        window.dispatchEvent(new Event('app_logo_updated'));

        if (data.bannerUrl) {
          localStorage.setItem('melayu_hero_bg_image', data.bannerUrl);
          window.dispatchEvent(new Event('app_banner_updated'));
        }

        if (onUpdate) onUpdate(data);
      }
    }, (error) => {
      checkAndSetQuotaError(error);
    });
    return unsubscribe;
  } catch (error) {
    checkAndSetQuotaError(error);
    return () => {};
  }
}

