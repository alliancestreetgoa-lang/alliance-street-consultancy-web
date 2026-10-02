import { initializeApp } from "firebase/app";
import {
  EmailAuthProvider, connectAuthEmulator, getAuth, onAuthStateChanged, reauthenticateWithCredential,
  signInWithEmailAndPassword, signOut, updatePassword, type User,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore/lite";
import config from "@site/lib/firebase-config.json";

/**
 * The single admin account. People type the username "admin"; Firebase needs
 * an email-shaped identifier, so it maps to this address. The password is held
 * (hashed) by Firebase Authentication — never in this code or the website.
 * firestore.rules and the sign-in worker both check this account.
 *
 * `?emulator` (local only) points the portal at the Firebase emulators so the
 * tools can be exercised without touching real data.
 */
export const ADMIN_USERNAME = "admin";
export const ADMIN_EMAIL = "admin@alliance-street-leads.firebaseapp.com";

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

export class SignInError extends Error {}

export async function signInAdmin(username: string, password: string) {
  if (username.trim().toLowerCase() !== ADMIN_USERNAME) throw new SignInError("Incorrect username or password.");
  try {
    return await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (code.includes("too-many-requests")) throw new SignInError("Too many attempts. Wait a few minutes and try again.");
    if (code.includes("network")) throw new SignInError("Couldn’t reach the sign-in service. Check your connection.");
    throw new SignInError("Incorrect username or password.");
  }
}

/** Changes the admin password everywhere (portal and content editor). */
export async function changePassword(current: string, next: string) {
  const user = auth.currentUser;
  if (!user?.email) throw new SignInError("Sign in again first.");
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
  } catch {
    throw new SignInError("Your current password is not correct.");
  }
  await updatePassword(user, next);
}

export function signOutAdmin() {
  return signOut(auth);
}

export function watchUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
