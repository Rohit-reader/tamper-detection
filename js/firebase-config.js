// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWawE6AxjDON_34kf1i-MnvUzMGAT7NQE",
    authDomain: "tamper-detection-2689d.firebaseapp.com",
    projectId: "tamper-detection-2689d",
    storageBucket: "tamper-detection-2689d.firebasestorage.app",
    messagingSenderId: "95691650437",
    appId: "1:95691650437:web:3397c79a2ab6e5ac5a40ec",
    measurementId: "G-F7FLNVYXD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to create a new user with role
const createUserWithRole = async (email, password, role) => {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to get user role
const getUserRole = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data().role;
        }
        return null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

// Export the authentication functions and db
export const authFunctions = {
    auth,
    createUserWithRole,
    getUserRole,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};

// Export individual functions for easier imports
export { 
    auth, 
    createUserWithRole, 
    getUserRole, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};

export { db };
