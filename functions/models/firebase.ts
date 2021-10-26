import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const apps = getApps();
const isFirstInitialization = !apps.length;

let firebase = !isFirstInitialization ? apps[0] : initializeApp();

const db = getFirestore(firebase);
const storage = getStorage(firebase);

export { firebase as default, db, storage };
