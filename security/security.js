// security.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('sosContainer');
    const mainSiren = document.getElementById('mainSiren');
    const sirenIcon = document.getElementById('sirenIcon');
    const systemStatus = document.getElementById('systemStatus');

    // 📡 LIVE LISTENER FOR SOS ALERTS
    const q = query(collection(db, "emergencies"), where("status", "==", "ACTIVE_SOS"));
    
    onSnapshot(q, (snapshot) => {
        container.innerHTML = "";

        if (snapshot.empty) {
            // ALL CLEAR STATE
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                    <div class="bg-emerald-500/10 p-6 rounded-full mb-4">
                        <i class="fa-solid fa-shield-check text-5xl text-emerald-500"></i>
                    </div>
                    <h3 class="text-xl font-bold text-emerald-400 mb-1">Campus is Safe</h3>
                    <p class="font-medium text-slate-500">No active emergency alerts at the moment.</p>
                </div>`;
            
            mainSiren.className = "bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/50 transition-all duration-300";
            sirenIcon.className = "fa-solid fa-building-shield text-emerald-500 text-2xl";
            
            systemStatus.className = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2";
            systemStatus.innerHTML = `<i class="fa-solid fa-shield-check"></i> System Secure`;
            return;
        }

        // EMERGENCY STATE
        mainSiren.className = "bg-red-600/30 p-2.5 rounded-xl border-2 border-red-500 siren-flash transition-all duration-300";
        sirenIcon.className = "fa-solid fa-siren-on text-red-500 text-2xl animate-pulse";
        
        systemStatus.className = "bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse";
        systemStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ACTIVE ALERT`;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const emergencyId = docSnap.id;
            
            // Map link logic (agar GPS coordinates hain)
            let mapBtn = '';
            let locDisplay = data.locationInfo.source;

            if (data.locationInfo.lat && data.locationInfo.lon) {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.locationInfo.lat},${data.locationInfo.lon}`;
                mapBtn = `<a href="${mapsUrl}" target="_blank" class="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-2 px-4 rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"><i class="fa-solid fa-location-crosshairs"></i> Open Map</a>`;
                locDisplay = `Lat: ${data.locationInfo.lat.toFixed(4)}, Lon: ${data.locationInfo.lon.toFixed(4)}`;
            }

            const alertCard = `
                <div class="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden siren-flash">
                    <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest animate-pulse">Critical SOS</span>
                            <h3 class="text-xl font-bold text-white mt-2">Student Needs Help!</h3>
                            <p class="text-xs text-slate-400 font-mono mt-1">App ID: ${data.studentId}</p>
                        </div>
                        <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 opacity-80"></i>
                    </div>

                    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-5">
                        <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Detected Location:</p>
                        <p class="text-cyan-400 font-mono font-bold text-sm">${locDisplay}</p>
                        <p class="text-xs text-slate-500 mt-1"><i class="fa-solid fa-satellite-dish mr-1"></i> Source: ${data.locationInfo.source}</p>
                    </div>

                    <div class="flex gap-3">
                        ${mapBtn}
                        <button onclick="resolveEmergency('${emergencyId}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition shadow-lg shadow-red-500/20 cursor-pointer">
                            <i class="fa-solid fa-check-double mr-1"></i> Mark as Resolved
                        </button>
                    </div>
                </div>`;
            
            container.innerHTML += alertCard;
        });
    });
});

// ✅ RESOLVE EMERGENCY LOGIC
window.resolveEmergency = async function(docId) {
    if(!confirm("Are you sure the student is safe and the emergency is resolved?")) return;
    
    try {
        const docRef = doc(db, "emergencies", docId);
        await updateDoc(docRef, { status: "RESOLVED" });
        alert("✅ Emergency Resolved. System standing down.");
    } catch (error) {
        alert("Error updating status: " + error.message);
    }
}