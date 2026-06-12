import {
    collection, deleteDoc, doc, getDocs, limit, onSnapshot,
    orderBy, query, writeBatch,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { getServices } from '../thread/firebase.js';

const BATCH_SIZE = 450;

export function listenAll(onData, onError) {
    const { db } = getServices();
    const threads = query(collection(db, 'threads'), orderBy('createdAt', 'desc'), limit(500));
    return onSnapshot(threads, snapshot => {
        onData(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
    }, onError);
}

export function removeOne(id) {
    const { db } = getServices();
    return deleteDoc(doc(db, 'threads', id));
}

export async function removeIds(ids) {
    const { db } = getServices();
    for (let start = 0; start < ids.length; start += BATCH_SIZE) {
        const batch = writeBatch(db);
        ids.slice(start, start + BATCH_SIZE)
            .forEach(id => batch.delete(doc(db, 'threads', id)));
        await batch.commit();
    }
}

export async function removeExpired() {
    const { db } = getServices();
    const snapshot = await getDocs(collection(db, 'threads'));
    const now = Date.now();
    const ids = snapshot.docs
        .filter(item => item.data().expiresAt?.toMillis() <= now)
        .map(item => item.id);
    await removeIds(ids);
    return ids.length;
}

export async function removeAll() {
    const { db } = getServices();
    const snapshot = await getDocs(collection(db, 'threads'));
    await removeIds(snapshot.docs.map(item => item.id));
    return snapshot.size;
}
