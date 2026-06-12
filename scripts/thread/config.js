export const firebaseConfig = {
    apiKey: "AIzaSyD7FbPy9rfDZQlORgJWs0MwT0u6OV-heXs",
    authDomain: "you-develop-f1476.firebaseapp.com",
    projectId: "you-develop-f1476",
    storageBucket: "you-develop-f1476.firebasestorage.app",
    messagingSenderId: "101670166696",
    appId: "1:101670166696:web:7376e468401f223f32e29d",
    measurementId: "G-VQC90L9D74",
};

export const ADMIN_UIDS = [
    'ajK8fhZQPmWIMRHxnAMXFmZEH6i2',
];

export function isConfigured() {
    return !firebaseConfig.apiKey.startsWith('YOUR_');
}
