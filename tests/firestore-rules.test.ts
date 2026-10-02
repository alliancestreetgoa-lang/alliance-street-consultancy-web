import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, updateDoc,
} from "firebase/firestore";

/**
 * Security rules, exercised against the Firestore emulator:
 *   npm run test:rules
 * Skipped by the normal `npm test` (no emulator there). Uses only synthetic data.
 */
const RUN = !!process.env.FIRESTORE_EMULATOR_HOST;

let env: RulesTestEnvironment;

type Provider = "google.com" | "password" | "anonymous";
const google = (email: string, verified = true) => ({
  email, email_verified: verified, firebase: { sign_in_provider: "google.com" as Provider },
});
const lead = (uid: string) => ({
  name: "Synthetic Visitor", country: "United Arab Emirates", email: "visitor@example.com", phone: "+971500000000",
  address: "Synthetic address, Dubai", services: ["Advisory"], notes: "", ownerUid: uid,
  source: "/book-consultation", consentVersion: "2026-10-01",
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(), enquiryRequested: false, bookingRequested: false,
});
const adminState = (by: string, status = "contacted") => ({
  status, meetingConfirmed: false, meetingAt: null, notes: "Called back", updatedBy: by, updatedAt: serverTimestamp(),
});

describe.skipIf(!RUN)("firestore rules", () => {
  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: "demo-alliance-street",
      firestore: { rules: readFileSync("firestore.rules", "utf8") },
    });
  });
  afterAll(async () => { await env?.cleanup(); });

  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      const at = Timestamp.now();
      await setDoc(doc(db, "staff/admin@example.com"), { role: "admin", active: true, addedBy: "bootstrap", addedAt: at });
      await setDoc(doc(db, "staff/pub@example.com"), { role: "publisher", active: true, addedBy: "admin@example.com", addedAt: at });
      await setDoc(doc(db, "staff/ed@example.com"), { role: "editor", active: true, addedBy: "admin@example.com", addedAt: at });
      await setDoc(doc(db, "staff/gone@example.com"), { role: "editor", active: false, addedBy: "admin@example.com", addedAt: at });
      await setDoc(doc(db, "leads/visitor-1"), { ...lead("visitor-1"), createdAt: at, updatedAt: at });
    });
  });

  const as = (email: string, opts?: { verified?: boolean; provider?: Provider }) =>
    env.authenticatedContext(`uid-${email}`, {
      ...google(email, opts?.verified ?? true),
      ...(opts?.provider ? { firebase: { sign_in_provider: opts.provider } } : {}),
    }).firestore();

  describe("visitors keep their original, narrow access", () => {
    it("can create and read only their own lead", async () => {
      const db = env.authenticatedContext("visitor-2", { firebase: { sign_in_provider: "anonymous" as Provider } }).firestore();
      await assertSucceeds(setDoc(doc(db, "leads/visitor-2"), lead("visitor-2")));
      await assertSucceeds(getDoc(doc(db, "leads/visitor-2")));
      await assertFails(getDoc(doc(db, "leads/visitor-1")));
    });
    it("cannot list leads, read staff data or the staff list", async () => {
      const db = env.authenticatedContext("visitor-1", { firebase: { sign_in_provider: "anonymous" as Provider } }).firestore();
      await assertFails(getDocs(collection(db, "leads")));
      await assertFails(getDoc(doc(db, "leadAdmin/visitor-1")));
      await assertFails(getDocs(collection(db, "staff")));
      await assertFails(setDoc(doc(db, "staff/visitor@example.com"), { role: "admin", active: true, addedBy: "x", addedAt: serverTimestamp() }));
    });
    it("unauthenticated requests get nothing", async () => {
      const db = env.unauthenticatedContext().firestore();
      await assertFails(getDocs(collection(db, "leads")));
      await assertFails(getDoc(doc(db, "leads/visitor-1")));
      await assertFails(getDocs(collection(db, "staff")));
    });
  });

  describe("staff access", () => {
    it("allowlisted staff can list and read leads", async () => {
      for (const email of ["admin@example.com", "pub@example.com", "ed@example.com"]) {
        await assertSucceeds(getDocs(query(collection(as(email), "leads"), limit(50))));
        await assertSucceeds(getDoc(doc(as(email), "leads/visitor-1")));
      }
    });
    it("rejects signed-in users who are not on the list, inactive, unverified or not Google", async () => {
      await assertFails(getDocs(collection(as("stranger@example.com"), "leads")));
      await assertFails(getDocs(collection(as("gone@example.com"), "leads")));
      await assertFails(getDocs(collection(as("ed@example.com", { verified: false }), "leads")));
      await assertFails(getDocs(collection(as("ed@example.com", { provider: "password" }), "leads")));
    });
    it("staff cannot change what the visitor submitted", async () => {
      await assertFails(updateDoc(doc(as("admin@example.com"), "leads/visitor-1"), { notes: "edited", updatedAt: serverTimestamp() }));
    });
    it("any staff role can record follow-up status and history, attributed to themselves", async () => {
      const db = as("ed@example.com");
      await assertSucceeds(setDoc(doc(db, "leadAdmin/visitor-1"), adminState("ed@example.com")));
      await assertSucceeds(setDoc(doc(db, "leadAdmin/visitor-1/history/h1"), {
        status: "contacted", meetingConfirmed: false, note: "First call", by: "ed@example.com", at: serverTimestamp(),
      }));
      await assertFails(setDoc(doc(db, "leadAdmin/visitor-1"), adminState("someone-else@example.com")));
      await assertFails(setDoc(doc(db, "leadAdmin/visitor-1"), { ...adminState("ed@example.com"), status: "made-up" }));
      await assertFails(setDoc(doc(db, "leadAdmin/no-such-lead"), adminState("ed@example.com")));
    });
    it("history is append-only for everyone but admins", async () => {
      await env.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), "leadAdmin/visitor-1/history/h1"), {
          status: "contacted", meetingConfirmed: false, by: "ed@example.com", at: Timestamp.now(),
        });
      });
      await assertFails(updateDoc(doc(as("ed@example.com"), "leadAdmin/visitor-1/history/h1"), { status: "won" }));
      await assertFails(deleteDoc(doc(as("pub@example.com"), "leadAdmin/visitor-1/history/h1")));
      await assertSucceeds(deleteDoc(doc(as("admin@example.com"), "leadAdmin/visitor-1/history/h1")));
    });
    it("only admins can delete a lead", async () => {
      await assertFails(deleteDoc(doc(as("pub@example.com"), "leads/visitor-1")));
      await assertSucceeds(deleteDoc(doc(as("admin@example.com"), "leads/visitor-1")));
    });
  });

  describe("staff list", () => {
    const entry = (by: string, role = "editor") => ({ role, active: true, addedBy: by, addedAt: serverTimestamp() });
    it("each person can read their own entry; only admins read the list", async () => {
      await assertSucceeds(getDoc(doc(as("ed@example.com"), "staff/ed@example.com")));
      await assertFails(getDoc(doc(as("ed@example.com"), "staff/admin@example.com")));
      await assertFails(getDocs(collection(as("pub@example.com"), "staff")));
      await assertSucceeds(getDocs(collection(as("admin@example.com"), "staff")));
    });
    it("only admins add, change and remove staff", async () => {
      await assertFails(setDoc(doc(as("pub@example.com"), "staff/new@example.com"), entry("pub@example.com")));
      await assertSucceeds(setDoc(doc(as("admin@example.com"), "staff/new@example.com"), entry("admin@example.com")));
      await assertSucceeds(updateDoc(doc(as("admin@example.com"), "staff/new@example.com"), { role: "publisher", addedBy: "admin@example.com" }));
      await assertSucceeds(deleteDoc(doc(as("admin@example.com"), "staff/new@example.com")));
    });
    it("rejects invalid roles, mixed-case ids and self-changes", async () => {
      await assertFails(setDoc(doc(as("admin@example.com"), "staff/x@example.com"), entry("admin@example.com", "owner")));
      await assertFails(setDoc(doc(as("admin@example.com"), "staff/Mixed@Example.com"), entry("admin@example.com")));
      await assertFails(updateDoc(doc(as("admin@example.com"), "staff/admin@example.com"), { role: "editor", addedBy: "admin@example.com" }));
      await assertFails(deleteDoc(doc(as("admin@example.com"), "staff/admin@example.com")));
    });
  });
});
