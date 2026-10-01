// Explicit integration check against the dedicated leads project using synthetic data only.
// Run with: node scripts/check-firebase-leads.mjs
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInAnonymously, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc, getDocs, collection, deleteDoc, serverTimestamp, setLogLevel } from 'firebase/firestore/lite';
setLogLevel("silent");
const config = JSON.parse(readFileSync(new URL('../src/lib/firebase-config.json', import.meta.url)));
assert.equal(config.projectId, 'alliance-street-leads');
const first = initializeApp(config, 'lead-test-owner');
const second = initializeApp(config, 'lead-test-stranger');
const unauth = initializeApp(config, 'lead-test-unauthenticated');
let assertions = 0;
async function denied(operation, label) {
  await assert.rejects(operation, error => error.code === 'permission-denied', label);
  assertions++;
}
const testUsers = [];
try {
  const owner = (await signInAnonymously(getAuth(first))).user;
  testUsers.push(owner);
  const stranger = (await signInAnonymously(getAuth(second))).user;
  testUsers.push(stranger);
  const db = getFirestore(first);
  const ref = doc(db, 'leads', owner.uid);
  const lead = {
    name: 'AUTOMATED TEST — Delete after verification', country: 'United Arab Emirates',
    address: 'Synthetic test address, Dubai', email: 'firebase-test@example.com', phone: '+971500000000',
    services: ['Advisory'], notes: 'Synthetic integration test; not a real enquiry.',
    source: '/book-consultation', ownerUid: owner.uid, consentVersion: '2026-10-01',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), enquiryRequested: false, bookingRequested: false,
  };
  writeFileSync(new URL('../.firebase-test-records.json', import.meta.url), JSON.stringify([owner.uid]));
  await denied(()=>setDoc(ref,{...lead,services:['Invalid service']}),'Invalid services must be rejected');
  await denied(()=>setDoc(ref,{...lead,isAdmin:true}),'Unapproved fields must be rejected');
  await setDoc(ref, lead);
  assert.equal((await getDoc(ref)).data().email, lead.email); assertions++;
  await denied(()=>getDoc(doc(getFirestore(second),'leads',owner.uid)),'Other visitors must not read a lead');
  await denied(()=>getDoc(doc(getFirestore(unauth),'leads',owner.uid)),'Unauthenticated reads must be blocked');
  await denied(()=>getDocs(collection(db,'leads')),'Visitors must not list leads');
  await denied(()=>updateDoc(doc(getFirestore(second),'leads',owner.uid),{notes:'changed',updatedAt:serverTimestamp()}),'Other visitors must not edit a lead');
  await denied(()=>updateDoc(ref,{ownerUid:stranger.uid,updatedAt:serverTimestamp()}),'Ownership must be immutable');
  await denied(()=>updateDoc(ref,{createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),'Creation timestamp must be immutable');
  await denied(()=>updateDoc(ref,{bookingConfirmed:true,updatedAt:serverTimestamp()}),'Clients must not claim a confirmed booking');
  await denied(()=>deleteDoc(ref),'Visitor deletes must be blocked');
  await updateDoc(ref,{enquiryRequested:true,updatedAt:serverTimestamp()});
  await updateDoc(ref,{bookingRequested:true,updatedAt:serverTimestamp()});
  const saved=(await getDoc(ref)).data();
  assert.equal(saved.enquiryRequested,true); assert.equal(saved.bookingRequested,true); assertions+=2;
  await denied(()=>updateDoc(ref,{enquiryRequested:false,updatedAt:serverTimestamp()}),'Previously recorded choices must be preserved');
  console.log(`PASS: ${assertions} live Firebase data and access checks. Synthetic lead cleanup required.`);
} finally {
  for(const user of testUsers) await deleteUser(user).catch(()=>{});
  await Promise.all([first,second,unauth].map(deleteApp));
}
