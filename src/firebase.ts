import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCvuCh7baLLWUh35Amw6zMZ1nhpY2_B3gQ",
  authDomain: "board-clash-246a3.firebaseapp.com",
  projectId: "board-clash-246a3",
  storageBucket: "board-clash-246a3.firebasestorage.app",
  messagingSenderId: "180791005603",
  appId: "1:180791005603:web:5ddcc54dd0629ee307ca16"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const initializeAnonymousSession = async () => {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error('Failed to create anonymous session:', error);
    throw error;
  }
};

export const saveGameResult = async (winner: string, redPieces: number, bluePieces: number, duration: number) => {
  try {
    await addDoc(collection(db, 'matches'), {
      winner,
      redPieces,
      bluePieces,
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving game result:', error);
  }
};

export const getLeaderboard = async () => {
  try {
    const q = query(collection(db, 'matches'), orderBy('timestamp', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};