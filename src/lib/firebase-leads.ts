"use client";

import { getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, runTransaction, serverTimestamp, setLogLevel, updateDoc } from "firebase/firestore/lite";
import config from "@/lib/firebase-config.json";
import { consultationSchema, type ConsultationValues } from "@/lib/consultation";

let connection: Promise<{ auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> }> | undefined;

function connect() {
  // Lazy-loaded by the form: no Firebase traffic until the visitor presses Continue.
  connection ??= (async () => {
    setLogLevel("silent");
    const app = getApps().find(app => app.name === "alliance-leads") ?? initializeApp(config, "alliance-leads");
    const auth = getAuth(app);
    await setPersistence(auth, browserSessionPersistence);
    await auth.authStateReady();
    if (!auth.currentUser) await signInAnonymously(auth);
    return { auth, db: getFirestore(app) };
  })().catch(error => { connection = undefined; throw error; });
  return connection;
}

export async function saveLead(values: ConsultationValues, source: string) {
  const details = consultationSchema.parse(values);
  const { auth, db } = await connect();
  const ownerUid = auth.currentUser!.uid;
  const ref = doc(db, "leads", ownerUid);
  // Retrying Continue and editing details update the same lead, without duplicates.
  await runTransaction(db, async transaction => {
    const existing = await transaction.get(ref);
    if (existing.exists()) {
      transaction.update(ref, { ...details, updatedAt: serverTimestamp() });
    } else {
      transaction.set(ref, {
        ...details, ownerUid, source, consentVersion: "2026-10-01",
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        enquiryRequested: false, bookingRequested: false,
      });
    }
  });
  return ownerUid;
}

export async function recordLeadChoice(leadId: string, choice: "enquiryRequested" | "bookingRequested") {
  const { db } = await connect();
  await updateDoc(doc(db, "leads", leadId), { [choice]: true, updatedAt: serverTimestamp() });
}
