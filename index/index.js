// index.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// 🆕 ADDED doc & updateDoc to save claim status permanently in Firebase
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const form = document.getElementById('complaintForm');
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
const imageInput = document.getElementById('image');
const fileNameDisplay = document.getElementById('fileNameDisplay');

// Image file selection display listener
if (imageInput) {
    imageInput.addEventListener('change', function() {
        if(this.files && this.files[0]) {
            fileNameDisplay.innerHTML = `<span class="font-semibold text-green-500">File Selected:</span> ${this.files[0].name}`;
        } else {
            fileNameDisplay.innerHTML = `<span class="font-semibold text-cyan-600">Click to upload</span> or drag image`;
        }
    });
}

// Form Submission Logic
if (form && submitBtn) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="relative z-10">Submitting...</span> <i class="fa-solid fa-spinner fa-spin relative z-10"></i>';
        submitBtn.disabled = true;

        // Generate Unique App ID
        const trackingId = "COER-" + Math.floor(100000 + Math.random() * 900000);

        const cuid = document.getElementById('cuid').value;
        const title = document.getElementById('title').value;
        const block = document.getElementById('block').value;
        const room = document.getElementById('room').value;
        const category = document.getElementById('category').value;
        const priority = document.getElementById('priority').value;
        const description = document.getElementById('description').value;

        // Store tracking ID locally for notifications tracking
        localStorage.setItem('lastAppId', trackingId);

        const file = imageInput && imageInput.files ? imageInput.files[0] : null;
        
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function() {
                await saveToDatabase(trackingId, cuid, title, block, room, category, priority, description, reader.result, file.name, originalBtnHTML);
            };
        } else {
            await saveToDatabase(trackingId, cuid, title, block, room, category, priority, description, "No image", "No image", originalBtnHTML);
        }
    });
}

// 🚀 Database Save Logic 
async function saveToDatabase(trackingId, cuid, title, block, room, category, priority, description, imageFile, imageName, originalBtnHTML) {
    try {
        const dateNow = new Date().toLocaleDateString('en-GB');

        let adminDeadlineVal = null;
        let mgmtDeadlineVal = null;

        if (priority === "Critical") {
            const currentTime = new Date().getTime();
            
            // Demo Time: Admin (3 min), Mgmt (5 min)
            const adminTime = currentTime + (3 * 60 * 1000); 
            const mgmtTime = currentTime + (5 * 60 * 1000);

            adminDeadlineVal = new Date(adminTime).toISOString();
            mgmtDeadlineVal = new Date(mgmtTime).toISOString();
        }

        await addDoc(collection(db, "complaints"), {
            trackingId, cuid, title, block, room, category, priority, description,
            imageFile, imageName,
            status: "Pending", 
            adminDeadline: adminDeadlineVal,
            mgmtDeadline: mgmtDeadlineVal,
            penaltyClaimed: false, // 🆕 DATABASE MEIN STATUS SAVE HOGA (VERY IMPORTANT)
            dateStr: dateNow,
            timestamp: serverTimestamp()
        });

        // Heatmap trigger save
        let localComplaints = JSON.parse(localStorage.getItem('campusIssues')) || [];
        localComplaints.push({ block, priority });
        localStorage.setItem('campusIssues', JSON.stringify(localComplaints));

        if(submitBtn) {
            submitBtn.innerHTML = '<span class="relative z-10">Success! Redirecting...</span> <i class="fa-solid fa-circle-check relative z-10"></i>';
            submitBtn.classList.replace('from-cyan-500', 'from-emerald-500');
        }
        
        setTimeout(() => {
            window.location.href = `../success/success.html?id=${trackingId}`;
        }, 800);

    } catch (error) {
        alert("Error: " + error.message);
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    }
}

// 🌐 PUBLIC FEED LOGIC
let allFetchedReports = [];

window.addEventListener('loadReportsEvent', async () => {
    const listContainer = document.getElementById('complaintsList');
    if(!listContainer) return;
    
    listContainer.innerHTML = `<p class="text-center text-slate-400 text-sm mt-10 italic"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading all campus reports...</p>`;

    try {
        const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        allFetchedReports = [];
        querySnapshot.forEach((doc) => {
            allFetchedReports.push(doc.data());
        });
        renderReports(allFetchedReports);

    } catch (error) {
        listContainer.innerHTML = `<p class="text-center text-rose-500 text-sm mt-10">Failed to load reports. Please check connection.</p>`;
    }
});

function renderReports(reportsArray) {
    const listContainer = document.getElementById('complaintsList');
    if(!listContainer) return;
    listContainer.innerHTML = '';

    if(reportsArray.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-slate-400 py-10"><p>No reports found.</p></div>`;
        return;
    }

    reportsArray.forEach((comp) => {
        let statusBadge = comp.status === "Pending" 
            ? `<span class="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200"><i class="fa-regular fa-clock mr-1"></i> Pending</span>` 
            : `<span class="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200"><i class="fa-solid fa-check mr-1"></i> Solved</span>`;

        const displayId = comp.trackingId ? comp.trackingId : 'N/A';

        const card = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 mb-1 inline-block">App No: ${displayId}</span>
                        <h4 class="font-bold text-slate-800 text-sm pr-4">${comp.title}</h4>
                    </div>
                    ${statusBadge}
                </div>
                <div class="flex items-center text-xs text-slate-500 gap-4 mt-2">
                    <span class="flex items-center gap-1.5"><i class="fa-regular fa-building"></i> ${comp.block}</span>
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-door-open"></i> ${comp.room}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-3 border-t border-slate-50 pt-2 text-right">
                    Reported on: ${comp.dateStr || 'Recently'}
                </div>
            </div>`;
        listContainer.innerHTML += card;
    });
}

const searchBtn = document.getElementById('searchBtn');
if(searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        if(!searchTerm) { renderReports(allFetchedReports); return; }
        
        const filtered = allFetchedReports.filter(comp => {
            const idMatch = comp.trackingId && comp.trackingId.toLowerCase().includes(searchTerm);
            const blockMatch = comp.block && comp.block.toLowerCase().includes(searchTerm);
            return idMatch || blockMatch;
        });
        renderReports(filtered);
    });
}

// ==========================================
// 🔥 FEATURE: SMART QR CODE AUTO-FILL & PERSONAL SLA CHECK
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');         
    const floor = urlParams.get('floor'); 
    const room = urlParams.get('room');   

    if (q) {
        const blockMap = {
            'mca': 'mca 1st year',
            'cse': 'btech cse',
            'lib': 'library',
            'hos': 'hostel',
            'can': 'canteen'
        };

        const actualBlock = blockMap[q];

        if (actualBlock) {
            const blockSelect = document.getElementById('block');
            if(blockSelect) {
                blockSelect.value = actualBlock;
                blockSelect.classList.add('border-emerald-400', 'bg-emerald-50', 'text-emerald-700');
            }
        }
        
        if (room) {
            const roomInput = document.getElementById('room');
            if(roomInput) {
                roomInput.value = floor ? `${floor} - ${room}` : room;
                roomInput.classList.add('border-emerald-400', 'bg-emerald-50', 'text-emerald-700');
            }
        }
        
        setTimeout(() => {
            alert("🪄 QR Code Scanned!\nLocation & Floor auto-filled successfully.");
        }, 500);
    }

    requestNotificationPermission();
    initRealtimeNotifications();

    // Check individual student personal SLA status on page load
    checkPersonalStudentSLA();
});

// ==========================================
// 🎟️ SECURE DATABASE LEVEL SLA CHECKER (FOOLPROOF)
// ==========================================
async function checkPersonalStudentSLA() {
    const myAppId = localStorage.getItem('lastAppId');
    const couponSec = document.getElementById('couponSection');

    if (!myAppId || !couponSec) return;

    try {
        const q = query(collection(db, "complaints"), where("trackingId", "==", myAppId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;

            // 1. Agar Database mein pehle hi claimed (true) hai, toh coupon HIDE hi rakho!
            if (data.penaltyClaimed === true) {
                couponSec.classList.add('hidden');
                return; 
            }

            // 2. Agar claimed nahi hai, tab SLA check karo
            if (data.priority === "Critical" && data.status === "Pending" && data.mgmtDeadline) {
                const deadlineTime = new Date(data.mgmtDeadline).getTime();
                const now = Date.now();

                // Mgmt deadline cross ho chuki hai
                if (now > deadlineTime) {
                    couponSec.classList.remove('hidden');

                    // Button ko find karke usme click event lagana (Taaki click karte hi DB update ho jaye)
                    const redeemBtn = couponSec.querySelector('button');
                    if(redeemBtn) {
                        // Purane click events hatane ke liye naya clone banate hain
                        const newBtn = redeemBtn.cloneNode(true);
                        redeemBtn.parentNode.replaceChild(newBtn, redeemBtn);
                        
                        newBtn.addEventListener('click', async (e) => {
                            e.preventDefault();
                            newBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Claiming...';
                            newBtn.disabled = true;
                            
                            try {
                                // 🔥 FIREBASE DATABASE UPDATE 🔥
                                const issueRef = doc(db, "complaints", docId);
                                await updateDoc(issueRef, { penaltyClaimed: true });
                                
                                alert("🎉 Success! ₹500 Fee Discount Voucher applied to your student account.");
                                couponSec.classList.add('hidden'); // Screen se hide kar diya
                            } catch (err) {
                                alert("System Error: " + err.message);
                                newBtn.innerHTML = 'Redeem Fee Discount';
                                newBtn.disabled = false;
                            }
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.log("Personal SLA fetch error: ", e);
    }
}

// 🎤 VOICE-TO-TEXT SPEECH RECOGNITION FEATURE
window.startVoiceInput = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Your browser does not support voice input. Please use Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micIcon = document.getElementById('micIcon');
    if(micIcon) micIcon.classList.add('text-rose-600', 'fa-beat');
    
    recognition.start();

    recognition.onresult = function(event) {
        const speechText = event.results[0][0].transcript;
        const descBox = document.getElementById('description');
        
        if(descBox) {
            descBox.value = descBox.value ? descBox.value + " " + speechText : speechText;
        }
        
        if(micIcon) micIcon.classList.remove('text-rose-600', 'fa-beat');
    };

    recognition.onerror = function(event) {
        alert("Voice recognition error: " + event.error);
        if(micIcon) micIcon.classList.remove('text-rose-600', 'fa-beat');
    };

    recognition.onspeechend = function() {
        recognition.stop();
        if(micIcon) micIcon.classList.remove('text-rose-600', 'fa-beat');
    };
}

// 🔔 REAL-TIME WEB NOTIFICATIONS LOGIC
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Web Notifications enabled!");
            }
        });
    }
}

function showNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602123.png'
        });
    }
}

function initRealtimeNotifications() {
    const userTrackingId = localStorage.getItem('lastAppId');
    if (!userTrackingId) return;

    try {
        const q = query(collection(db, "complaints"), where("trackingId", "==", userTrackingId));

        onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified") {
                    const data = change.doc.data();
                    if (data.status === "Solved") {
                        showNotification("🎉 Update from Campus Team!", "Your issue (App No: " + data.trackingId + ") has been Resolved.");
                    }
                }
            });
        });
    } catch (e) {
        console.log("Notification listener error: ", e);
    }
}

// 🚨 CUSTOM SOS MODAL DISPATCH LOGIC
window.triggerEmergencySOS = function() {
    const modal = document.getElementById('sosModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

window.closeSosModal = function() {
    const modal = document.getElementById('sosModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.confirmAndRedirectSOS = async function() {
    const studentId = localStorage.getItem('lastAppId') || "Anonymous_Student";
    
    const sosBtn = document.querySelector('#sosModal button.bg-red-600');
    if(sosBtn) {
        sosBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending SOS...';
        sosBtn.disabled = true;
    }

    const redirectToAlertPage = (locString) => {
        window.location.href = `../emergency_alert/emergency_alert.html?loc=${encodeURIComponent(locString)}`;
    };

    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                await addDoc(collection(db, "emergencies"), {
                    studentId: studentId,
                    locationInfo: { lat: pos.coords.latitude, lon: pos.coords.longitude, source: "GPS Coordinates" },
                    timestamp: serverTimestamp(),
                    status: "ACTIVE_SOS"
                });
                redirectToAlertPage(`Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
                
            }, async (err) => {
                await addDoc(collection(db, "emergencies"), {
                    studentId: studentId,
                    locationInfo: { lat: null, lon: null, source: "Manual Campus Zone (GPS Denied)" },
                    timestamp: serverTimestamp(),
                    status: "ACTIVE_SOS"
                });
                redirectToAlertPage("Campus Building Zone");
            }, { timeout: 5000 });
        } else {
            await addDoc(collection(db, "emergencies"), {
                studentId: studentId,
                locationInfo: { lat: null, lon: null, source: "Manual Campus Zone (Unsupported)" },
                timestamp: serverTimestamp(),
                status: "ACTIVE_SOS"
            });
            redirectToAlertPage("Campus Building Zone");
        }
    } catch (e) {
        console.log("SOS DB error: ", e);
        redirectToAlertPage("Campus Building Zone");
    }
}