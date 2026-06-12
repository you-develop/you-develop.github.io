import {
    collection, deleteDoc, deleteField, doc, limit, onSnapshot,
    orderBy, query, runTransaction, serverTimestamp, Timestamp, where,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { ensureUser, getServices } from './firebase.js';

const HOUR_MS = 60 * 60 * 1000;

export async function listenThreads(onData, onError) {
    await ensureUser();
    const { db } = getServices();
    const active = query(
        collection(db, 'threads'),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt', 'desc'),
        limit(100),
    );
    return onSnapshot(active, snapshot => {
        const items = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        onData(items.filter(item => item.expiresAt?.toMillis() > Date.now()));
    }, onError);
}

export async function addThread(content) {
    const user = await ensureUser();
    const { db } = getServices();
    const ref = doc(db, 'threads', user.uid);
    await runTransaction(db, async transaction => {
        const current = await transaction.get(ref);
        const expiresAt = current.data()?.expiresAt?.toMillis() || 0;
        if (current.exists() && expiresAt > Date.now()) {
            throw new Error('이미 작성한 방명록이 있습니다.');
        }
        transaction.set(ref, {
            content, authorId: user.uid, createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + HOUR_MS),
            score: 0, votes: {},
        });
    });
}

export async function voteThread(id, direction) {
    const user = await ensureUser();
    const { db } = getServices();
    const ref = doc(db, 'threads', id);
    await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        const previous = data.votes?.[user.uid] || 0;
        const next = previous === direction ? 0 : direction;
        const update = { score: data.score + next - previous };
        update[`votes.${user.uid}`] = next === 0 ? deleteField() : next;
        transaction.update(ref, update);
    });
}

export async function removeThread(id) {
    const { db } = getServices();
    await deleteDoc(doc(db, 'threads', id));
}
