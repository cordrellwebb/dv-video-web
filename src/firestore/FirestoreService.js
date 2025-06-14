// src/firestore/FirestoreService.js

import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  runTransaction,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// The main rooms collection name
const ROOMS = 'rooms';

// Take a seat (returns true if successful, false if already occupied)
export async function takeSeat({ roomId, seatNumber, userId, userName }) {
  const seatDocRef = doc(db, ROOMS, roomId, 'seats', `seat_${seatNumber}`);

  try {
    return await runTransaction(db, async (transaction) => {
      const seatSnap = await transaction.get(seatDocRef);
      if (seatSnap.exists() && seatSnap.data().occupied) {
        // Seat already taken
        return false;
      }

      // Mark seat as occupied
      transaction.set(seatDocRef, {
        occupied: true,
        userId,
        userName,
        timestamp: serverTimestamp(),
      });
      return true;
    });
  } catch (e) {
    console.error('Error taking seat:', e);
    return false;
  }
}

// Release a seat (simply deletes the seat doc)
export async function releaseSeat({ roomId, seatNumber }) {
  const seatDocRef = doc(db, ROOMS, roomId, 'seats', `seat_${seatNumber}`);
  try {
    await deleteDoc(seatDocRef);
  } catch (e) {
    console.error('Error releasing seat:', e);
  }
}

// Listen to seats in a given room (realtime)
export function seatsStream(roomId, callback) {
  const seatsColRef = collection(db, ROOMS, roomId, 'seats');
  return onSnapshot(seatsColRef, callback);
}

// Create a new room doc (if not exists)
export async function createRoomIfNotExists(roomId) {
  const roomDocRef = doc(db, ROOMS, roomId);
  const roomSnap = await getDoc(roomDocRef);
  if (!roomSnap.exists()) {
    await setDoc(roomDocRef, {
      createdAt: serverTimestamp(),
      status: 'waiting', // can be 'waiting', 'started', 'ended', etc.
    });
  }
}

// Update the room status
export async function updateRoomStatus(roomId, status) {
  const roomDocRef = doc(db, ROOMS, roomId);
  await updateDoc(roomDocRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Listen to room status changes (realtime)
export function roomStatusStream(roomId, callback) {
  const roomDocRef = doc(db, ROOMS, roomId);
  return onSnapshot(roomDocRef, callback);
}