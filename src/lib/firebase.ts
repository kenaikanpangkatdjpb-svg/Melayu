import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_USERS } from '../mockData';
import { UserAccount } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Collection Reference
const USERS_COLLECTION = 'users';

// Helper function to seed initial users to Firestore if collection is empty
export async function syncInitialUsersToFirestore(): Promise<UserAccount[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log('Seeding initial users to Firebase Firestore...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
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
    console.warn('Firebase sync failed, falling back to local users:', error);
    const local = localStorage.getItem('melayu_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  }
}

// Fetch all users from Firebase Firestore
export async function getUsersFromFirestore(): Promise<UserAccount[]> {
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
    console.error('Error fetching users from Firestore:', error);
    const local = localStorage.getItem('melayu_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  }
}

// Save or Update User in Firebase Firestore
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

// Delete User from Firebase Firestore
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
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
    console.error('Error authenticating user via Firestore:', error);
    return null;
  }
}
