import {
    GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { ADMIN_UIDS } from '../thread/config.js';
import { getServices } from '../thread/firebase.js';

export function watchAuth(callback) {
    const { auth } = getServices();
    return onAuthStateChanged(auth, callback);
}

export async function login() {
    const { auth } = getServices();
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function logout() {
    return signOut(getServices().auth);
}

export function isAdmin(user) {
    return Boolean(user && ADMIN_UIDS.includes(user.uid));
}
