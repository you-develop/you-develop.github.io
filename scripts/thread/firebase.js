import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import {
    getAuth, onAuthStateChanged, signInAnonymously,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { firebaseConfig, isConfigured } from './config.js';

let app;
let auth;
let db;

export function getServices() {
    if (!isConfigured()) throw new Error('Firebase 설정이 필요합니다.');
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
    return { auth, db };
}

export function ensureUser() {
    const { auth } = getServices();
    return new Promise((resolve, reject) => {
        const stop = onAuthStateChanged(auth, async user => {
            stop();
            if (user) { resolve(user); return; }
            try {
                resolve((await signInAnonymously(auth)).user);
            } catch (error) {
                reject(error);
            }
        }, reject);
    });
}
