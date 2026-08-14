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

// Generic subscribe with onSnapshot & auto-seed if empty
export function subscribeFirestoreCollection<T extends { id?: string }>(
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
        if (Array.isArray(parsed)) {
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
                await setDoc(doc(db, collectionName, docId), item);
              }
            } catch (seedErr) {
              checkAndSetQuotaError(seedErr);
            }
          }
        } else {
          localStorage.setItem(seededMarkerKey, 'true');
          const items: T[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data) {
              const effectiveId = String(data.id || docSnap.id);
              // Filter out any document marked as deleted
              if (!deletedIds.includes(effectiveId) && !deletedIds.includes(docSnap.id)) {
                items.push({ ...data, id: effectiveId } as T);
              }
            }
          });
          onUpdate(items);
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
export async function saveFirestoreDoc<T extends { id?: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const docId = item.id ? String(item.id) : `doc_${Date.now()}`;
    const itemRef = doc(db, collectionName, docId);
    await setDoc(itemRef, item, { merge: true });
  } catch (error) {
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
export async function saveFirestoreCollection<T extends { id?: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    for (let i = 0; i < items.length; i++) {
      if (isQuotaExceeded) break;
      const item = items[i];
      const docId = item.id ? String(item.id) : `doc_${i}`;
      await setDoc(doc(db, collectionName, docId), item, { merge: true });
    }
  } catch (error) {
    checkAndSetQuotaError(error);
  }
}

