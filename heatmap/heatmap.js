// heatmap.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

async function loadHeatmapData() {
    try {
        const querySnapshot = await getDocs(collection(db, "complaints"));
        
        let counts = {
            'mca': 0,
            'cse': 0,
            'lib': 0,
            'hos': 0,
            'can': 0
        };

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Sirf pending issues ko count karenge heatmap ke liye
            if (data.status === "Pending") {
                const blockStr = (data.block || "").toLowerCase();
                
                if (blockStr.includes("mca")) counts['mca']++;
                else if (blockStr.includes("btech") || blockStr.includes("cse")) counts['cse']++;
                else if (blockStr.includes("library") || blockStr.includes("lib")) counts['lib']++;
                else if (blockStr.includes("hostel") || blockStr.includes("hos")) counts['hos']++;
                else if (blockStr.includes("canteen") || blockStr.includes("can")) counts['can']++;
            }
        });

        // Update UI for each block based on counts
        updateBlockUI('mca', counts['mca']);
        updateBlockUI('cse', counts['cse']);
        updateBlockUI('lib', counts['lib']);
        updateBlockUI('hos', counts['hos']);
        updateBlockUI('can', counts['can']);

    } catch (error) {
        console.error("Error loading heatmap: ", error);
    }
}

function updateBlockUI(blockKey, count) {
    const countEl = document.getElementById(`count-${blockKey}`);
    const cardEl = document.getElementById(`card-${blockKey}`);
    const badgeEl = document.getElementById(`badge-${blockKey}`);

    if (countEl) countEl.innerText = count;

    // Color coding logic based on count
    if (count >= 6) {
        // Critical (Red)
        cardEl.className = "heatmap-card bg-rose-950/40 border-2 border-rose-500 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.3)]";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse";
        badgeEl.innerText = "Critical Alert";
    } else if (count >= 3) {
        // Warning (Yellow/Amber)
        cardEl.className = "heatmap-card bg-amber-950/40 border-2 border-amber-500 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)]";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950";
        badgeEl.innerText = "Needs Attention";
    } else {
        // Safe (Emerald/Green)
        cardEl.className = "heatmap-card bg-slate-800/80 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        badgeEl.innerText = "Normal";
    }
}

document.addEventListener('DOMContentLoaded', loadHeatmapData);