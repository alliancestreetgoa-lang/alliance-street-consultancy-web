import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider, connectAuthEmulator, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore/lite";
import config from "@site/lib/firebase-config.json";

/**
 * Staff sign-in. Separate from the visitors' anonymous sessions on the public
 * site (a different Firebase app name and a different origin), and every read
 * is checked by firestore.rules — this file grants nothing by itself.
 *
 * `?emulator` (local only) points the portal at the Firebase emulators so the
 * lead tools can be exercised without touching real leads.
 */
const useEmulator =
  ["localhost", "127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("emulator");

export const app = initializeApp(useEmulator ? { ...config, projectId: "demo-alliance-street", apiKey: "demo-key" } : config, "staff-portal");
export const auth = getAuth(app);
export const db = getFirestore(app);
export const USING_EMULATOR = useEmulator;

if (useEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8085);
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export function signOutStaff() {
  return signOut(auth);
}

export function watchUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
