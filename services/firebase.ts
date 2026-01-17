import firebase from 'firebase/compat/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants';

// Initialize Firebase using compat to avoid modular import issues in some environments
const app = firebase.initializeApp(FIREBASE_CONFIG);

export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore();
export const rtdb = getDatabase();