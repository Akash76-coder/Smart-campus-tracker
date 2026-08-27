// js/login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ APNA FIREBASE CONFIG YAHAN PASTE KARO
const firebaseConfig = {
    apiKey: "AIzaSyC9fKAp1_LfidhOp8RHDuLxTJ1o_QVr65w",
    authDomain: "campus-tracker-ee7b4.firebaseapp.com",
    projectId: "campus-tracker-ee7b4",
    storageBucket: "campus-tracker-ee7b4.firebasestorage.app",
    messagingSenderId: "96695330598",
    appId: "1:96695330598:web:e37caa485ee6fdad95c3e7",
    measurementId: "G-MTW3Y221RG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const originalText = loginBtn.innerHTML;

    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
        // Firebase se login check karna
        await signInWithEmailAndPassword(auth, email, password);
        
        loginBtn.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
        loginBtn.classList.replace('bg-blue-600', 'bg-green-500');
        
        // Login success hone par admin page par bhej dena
        setTimeout(() => {
            window.location.href = "../admin/admin.html"; 
        }, 1000);

    } catch (error) {
        console.error("Login Error: ", error);
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = "Invalid credentials. Try again.";
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
});