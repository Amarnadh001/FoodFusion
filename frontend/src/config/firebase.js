import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// 🔹 Firebase Config (Replace with your own Firebase credentials)
const firebaseConfig = {
    apiKey: "AIzaSyCx97aSCC_t6Tlddro9F8CdYXXK6-EHhhI",
    authDomain: "food-fusion-6b706.firebaseapp.com",
    projectId: "food-fusion-6b706",
    storageBucket: "food-fusion-6b706.firebasestorage.app",
    messagingSenderId: "530752015105",
    appId: "1:530752015105:web:41fad1e64a8b3044e12900",
    measurementId: "G-5J7G3TWQ9V"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
