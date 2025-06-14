// src/auth/AuthService.js

import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Sign in user with email & password
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password.trim());
}

// Register new user with email & password
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email.trim(), password.trim());
}

// Sign out current user
export function signOutUser() {
  return signOut(auth);
}

// Get the current logged-in user (returns user object or null)
export function getCurrentUser() {
  return auth.currentUser;
}

// Get the current user UID (or null)
export function getCurrentUserId() {
  return auth.currentUser ? auth.currentUser.uid : null;
}

// Returns an unsubscribe function for auth state changes
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}