// management.js

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

window.fetchEscalatedComplaints = async function() {
    const listContainer = document.getElementById('mgmtComplaintsList');
    if(!listContainer) return;

    listContainer.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-purple-500 mb-4"></i><p class="font-medium text-slate-400">Scanning Escalated Network...</p></div>`;

    try {
        const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        listContainer.innerHTML = '';
        let totalEscalated = 0, pendingMgmt = 0, penaltiesIssued = 0;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            
            // 🚨 SIRF CRITICAL ISSUES JINKA ADMIN TIME NIKAL CHUKA HAI (Ya Mgmt ne solve kiye hain)
            if (data.priority === "Critical" && data.adminDeadline) {
                const adminDeadlineTime = new Date(data.adminDeadline).getTime();
                const now = Date.now();

                // Check condition: Admin failed OR Management already solved it
                if (data.status === "Solved by Mgmt" || (data.status === "Pending" && now > adminDeadlineTime)) {
                    totalEscalated++;

                    let timerHtml = '';
                    let actionBtn = '';
                    
                    if (data.status === "Solved by Mgmt") {
                        // Mgmt successfully solved it
                        actionBtn = `<button disabled class="w-full bg-emerald-900/40 text-emerald-500 font-bold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-emerald-500/30"><i class="fa-solid fa-shield-check"></i> Secured by Mgmt</button>`;
                        timerHtml = `<div class="mt-2 bg-emerald-900/30 border border-emerald-500/30 p-2 rounded-xl text-center text-xs text-emerald-400 font-bold">Resolved within Deadline</div>`;
                    } else {
                        // Issue is Pending & Escalated to Mgmt
                        const mgmtDeadlineTime = new Date(data.mgmtDeadline).getTime();
                        const mgmtTimeLeftSec = Math.floor((mgmtDeadlineTime - now) / 1000);

                        if (mgmtTimeLeftSec > 0) {
                            // ⏳ Management ka 2 din (demo 2 min) chal raha hai
                            pendingMgmt++;
                            timerHtml = `
                                <div class="mt-2 bg-amber-900/40 border border-amber-500/50 p-3 rounded-xl flex items-center justify-between text-xs timer-pulse">
                                    <span class="text-amber-400 font-bold"><i class="fa-solid fa-stopwatch"></i> MGMT SLA:</span>
                                    <span id="mgmt-timer-${docId}" class="font-mono font-black text-amber-300 text-sm">Calculating...</span>
                                </div>`;
                            actionBtn = `<button onclick="markAsSolvedByMgmt('${docId}')" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-4 transition-all text-sm shadow-lg shadow-purple-500/20 cursor-pointer">Resolve Escalation</button>`;
                            
                            setTimeout(() => startMgmtCardTimer(docId, mgmtTimeLeftSec), 150);
                        } else {
                            // 💥 Management bhi fail ho gayi! Penalty issued.
                            penaltiesIssued++;
                            timerHtml = `
                                <div class="mt-2 bg-rose-900/50 border border-rose-500/50 p-3 rounded-xl flex items-center justify-between text-xs">
                                    <span class="text-rose-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> Mgmt Failed:</span>
                                    <span class="font-black text-white bg-rose-600 px-2 py-1 rounded shadow-sm tracking-wider">PENALTY ISSUED</span>
                                </div>`;
                            actionBtn = `<button disabled class="w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-slate-700"><i class="fa-solid fa-ban"></i> Action Locked (Coupon Sent)</button>`;
                        }
                    }

                    const displayId = data.trackingId ? data.trackingId : 'N/A';
                    const displayCuid = data.cuid ? data.cuid : 'N/A';
                    const displayDesc = data.description ? data.description : 'No description provided';

                    const card = `
                        <div id="mgmt-card-${docId}" class="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 mgmt-card flex flex-col justify-between h-full">
                            <div>
                                <div class="flex justify-between items-center mb-4">
                                    <span class="bg-purple-900/50 text-purple-400 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Escalated</span>
                                    <span class="text-[10px] font-bold text-slate-400">ID: ${displayId}</span>
                                </div>
                                <h3 class="font-bold text-white text-lg mb-1">${data.title}</h3>
                                <p class="text-xs text-slate-400 font-mono mb-3"><i class="fa-solid fa-id-card text-purple-500 mr-1"></i> CU ID: ${displayCuid}</p>
                                
                                <div class="flex gap-4 text-xs font-medium text-slate-300 mb-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                    <span class="flex items-center gap-1.5"><i class="fa-regular fa-building text-blue-400"></i> ${data.block}</span>
                                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-door-open text-purple-400"></i> ${data.room}</span>
                                </div>

                                ${timerHtml}

                                <div class="mt-4">
                                    <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Issue Details:</p>
                                    <p class="text-xs text-slate-300 italic bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 h-16 overflow-y-auto custom-scrollbar">"${displayDesc}"</p>
                                </div>
                            </div>
                            <div id="mgmt-action-${docId}">
                                ${actionBtn}
                            </div>
                        </div>`;
                    listContainer.innerHTML += card;
                }
            }
        });

        if (totalEscalated === 0) {
            listContainer.innerHTML = `<div class="col-span-full text-center text-slate-500 py-10 bg-slate-900 border border-slate-800 rounded-2xl"><i class="fa-solid fa-shield text-3xl mb-3 text-slate-700"></i><br>System Secure. No escalations found.</div>`;
        }

        // Update Stats
        if(document.getElementById('statTotalEscalated')) document.getElementById('statTotalEscalated').innerText = totalEscalated;
        if(document.getElementById('statPendingMgmt')) document.getElementById('statPendingMgmt').innerText = pendingMgmt;
        if(document.getElementById('statPenalties')) document.getElementById('statPenalties').innerText = penaltiesIssued;

    } catch (error) {
        console.error("Error:", error);
    }
}

// ⏳ Independent Ticking Function for Mgmt Timers
function startMgmtCardTimer(docId, duration) {
    let timer = duration;
    const clockEl = document.getElementById(`mgmt-timer-${docId}`);
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
                // Change UI to Penalty State
                parentDiv.className = "mt-2 bg-rose-900/50 border border-rose-500/50 p-3 rounded-xl flex items-center justify-between text-xs";
                parentDiv.innerHTML = `<span class="text-rose-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> Mgmt Failed:</span> <span class="font-black text-white bg-rose-600 px-2 py-1 rounded shadow-sm tracking-wider">PENALTY ISSUED</span>`;
                
                // Lock Button
                const actionContainer = document.getElementById(`mgmt-action-${docId}`);
                if(actionContainer) {
                    actionContainer.innerHTML = `<button disabled class="w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl mt-4 cursor-not-allowed text-sm border border-slate-700"><i class="fa-solid fa-ban"></i> Action Locked (Coupon Sent)</button>`;
                }
                // Refresh to update stats
                setTimeout(window.fetchEscalatedComplaints, 2000);
            }
        }
    }, 1000);
}

// 🟢 Mark as Solved by Management
window.markAsSolvedByMgmt = async function(docId) {
    if(!confirm("Execute Resolution? This will close the escalated issue.")) return;
    try {
        const issueRef = doc(db, "complaints", docId);
        // Note: Using a unique status so it stays visible in mgmt panel history
        await updateDoc(issueRef, { status: "Solved by Mgmt" }); 
        alert("✅ Critical Escalation Resolved Successfully.");
        fetchEscalatedComplaints(); 
    } catch (error) {
        alert("System Error: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', fetchEscalatedComplaints);