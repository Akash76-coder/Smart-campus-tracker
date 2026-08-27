// admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.fetchComplaints = async function() {
    const listContainer = document.getElementById('adminComplaintsList');
    if(!listContainer) return;

    listContainer.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-cyan-600 mb-4"></i><p class="font-medium text-slate-600">Refreshing live data...</p></div>`;

    try {
        const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        listContainer.innerHTML = '';
        let total = 0, pending = 0, solved = 0;

        if(querySnapshot.empty) {
            listContainer.innerHTML = `<div class="col-span-full text-center text-slate-500 py-10">No complaints found.</div>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            
            total++;
            if(data.status === "Solved") solved++;
            else pending++;

            let statusBadge = data.status === "Solved" 
                ? `<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200"><i class="fa-solid fa-check"></i> Solved</span>`
                : `<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200"><i class="fa-regular fa-clock"></i> Pending</span>`;
            
            let priorityColor = data.priority === "Critical" ? "text-rose-600 bg-rose-50 border border-rose-200" : (data.priority === "Low" ? "text-slate-600 bg-slate-100" : "text-orange-600 bg-orange-50");

            // ⏱️ Auto-Escalation Logic
            let timerHtml = '';
            let actionBtn = '';

            if (data.status === "Solved") {
                actionBtn = `<button disabled class="w-full bg-slate-100 text-slate-400 font-semibold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-slate-200"><i class="fa-solid fa-lock"></i> Issue Resolved</button>`;
            } else {
                if (data.priority === "Critical" && data.adminDeadline) {
                    const adminDeadlineTime = new Date(data.adminDeadline).getTime();
                    const now = Date.now();
                    const timeLeftSec = Math.floor((adminDeadlineTime - now) / 1000);

                    if (timeLeftSec > 0) {
                        // Admin ka time abhi bacha hai
                        timerHtml = `
                            <div class="mt-2 bg-blue-50 border border-blue-200 p-2 rounded-xl flex items-center justify-between text-xs">
                                <span class="text-blue-700 font-medium flex items-center gap-1"><i class="fa-solid fa-stopwatch text-blue-500"></i> Admin SLA Left:</span>
                                <span id="card-timer-${docId}" class="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Calculating...</span>
                            </div>`;
                        setTimeout(() => startCardRowTimer(docId, timeLeftSec), 150);
                        
                        actionBtn = `<button onclick="markAsSolved('${docId}')" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl mt-4 transition-colors text-sm shadow-md shadow-cyan-500/20 group cursor-pointer"><i class="fa-solid fa-check-double mr-1 group-hover:scale-110 transition-transform"></i> Mark as Solved</button>`;
                    } else {
                        // 🚨 Admin ka time finish - Escalated to Mgmt (Lock Admin)
                        timerHtml = `
                            <div class="mt-2 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-center justify-between text-xs">
                                <span class="text-rose-700 font-bold flex items-center gap-1"><i class="fa-solid fa-arrow-up-right-dots"></i> Status:</span>
                                <span class="font-bold text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm">ESCALATED TO MGMT</span>
                            </div>`;
                        actionBtn = `<button disabled class="w-full bg-rose-100 text-rose-500 font-semibold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-rose-200"><i class="fa-solid fa-lock"></i> Admin Locked (Escalated)</button>`;
                    }
                } else {
                    // Normal Priority Issue (No SLA)
                    actionBtn = `<button onclick="markAsSolved('${docId}')" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl mt-4 transition-colors text-sm shadow-md shadow-cyan-500/20 group cursor-pointer"><i class="fa-solid fa-check-double mr-1 group-hover:scale-110 transition-transform"></i> Mark as Solved</button>`;
                }
            }

            let imageHTML = '';
            if(data.imageFile && data.imageFile !== "No image") {
                imageHTML = `
                <div class="mt-3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 h-32 relative group cursor-pointer">
                    <img src="${data.imageFile}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Proof">
                </div>`;
            }

            const displayId = data.trackingId ? data.trackingId : 'N/A';
            const displayCuid = data.cuid ? data.cuid : 'N/A'; 
            const displayDesc = data.description ? data.description : 'No description provided'; 

            const card = `
                <div id="card-${docId}" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 admin-card flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${priorityColor}">${data.priority} Priority</span>
                            ${statusBadge}
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded border border-cyan-100 inline-block">App No: ${displayId}</span>
                            <span class="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 inline-block"><i class="fa-solid fa-id-card mr-1"></i> CU ID: ${displayCuid}</span>
                        </div>
                        
                        <h3 class="font-bold text-slate-800 text-lg mb-1 leading-tight">${data.title}</h3>
                        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500 mb-2 border-b border-slate-100 pb-2">
                            <span class="flex items-center gap-1.5 text-blue-600"><i class="fa-regular fa-building"></i> ${data.block}</span>
                            <span class="flex items-center gap-1.5 text-purple-600"><i class="fa-solid fa-door-open"></i> ${data.room}</span>
                        </div>

                        ${timerHtml}
                        
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                            <p class="text-xs text-slate-600 h-14 overflow-y-auto custom-scrollbar italic leading-relaxed">"${displayDesc}"</p>
                        </div>
                        ${imageHTML}
                    </div>
                    <div id="action-container-${docId}">
                        ${actionBtn}
                    </div>
                </div>`;
            listContainer.innerHTML += card;
        });

        if(document.getElementById('statTotal')) document.getElementById('statTotal').innerText = total;
        if(document.getElementById('statPending')) document.getElementById('statPending').innerText = pending;
        if(document.getElementById('statSolved')) document.getElementById('statSolved').innerText = solved;

    } catch (error) {
        console.error("Error:", error);
    }
}

// Independent ticking function for each card timer (Locks admin when it hits 0)
function startCardRowTimer(docId, duration) {
    let timer = duration;
    const clockEl = document.getElementById(`card-timer-${docId}`);
    if (!clockEl) return;

    const interval = setInterval(() => {
        let hours = Math.floor(timer / 3600);
        let minutes = Math.floor((timer % 3600) / 60);
        let seconds = timer % 60;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        clockEl.innerText = `${hours}:${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(interval);
            const parentDiv = clockEl.closest('div');
            if(parentDiv) {
                // Update UI to Escalate State
                parentDiv.className = "mt-2 bg-rose-50 border border-rose-200 p-2 rounded-xl flex items-center justify-between text-xs";
                parentDiv.innerHTML = `<span class="text-rose-700 font-bold flex items-center gap-1"><i class="fa-solid fa-arrow-up-right-dots"></i> Status:</span> <span class="font-bold text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm">ESCALATED TO MGMT</span>`;
                
                // Disable the button dynamically when timer hits 0
                const actionContainer = document.getElementById(`action-container-${docId}`);
                if(actionContainer) {
                    actionContainer.innerHTML = `<button disabled class="w-full bg-rose-100 text-rose-500 font-semibold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-rose-200"><i class="fa-solid fa-lock"></i> Admin Locked (Escalated)</button>`;
                }
            }
        }
    }, 1000);
}

window.markAsSolved = async function(docId) {
    if(!confirm("Are you sure you want to mark this issue as Solved?")) return;
    try {
        const issueRef = doc(db, "complaints", docId);
        await updateDoc(issueRef, { status: "Solved" });
        alert("✅ Issue marked as solved!");
        fetchComplaints(); 
    } catch (error) {
        alert("Error updating: " + error.message);
    }
}

// ==========================================
// 🖨️ ADMIN QR GENERATOR (WITH FLOOR)
// ==========================================
window.generateAdminQR = function() {
    const block = document.getElementById('adminQrBlock').value;
    const floor = document.getElementById('adminQrFloor').value;
    const room = document.getElementById('adminQrRoom').value.trim();
    const baseUrl = document.getElementById('adminQrBaseUrl').value.trim();

    if(!room) {
        alert("Please enter a room number!");
        return;
    }

    const finalUrl = `${baseUrl}?q=${block}&floor=${encodeURIComponent(floor)}&room=${encodeURIComponent(room)}`;
    
    const qrContainer = document.getElementById('adminQrcodeContainer');
    if(!qrContainer) return;
    qrContainer.innerHTML = "";

    if (typeof QRCode === "undefined") {
        alert("QR Library is still loading. Please try again in 2 seconds.");
        return;
    }

    new QRCode(qrContainer, {
        text: finalUrl,
        width: 130,
        height: 130,
        colorDark : "#0f172a",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById('adminQrLabel').innerText = `Room: ${room} (${floor})`;
    document.getElementById('adminQrLinkText').innerText = `Location: ${floor} - Room ${room}`;
    document.getElementById('adminQrResult').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', fetchComplaints);