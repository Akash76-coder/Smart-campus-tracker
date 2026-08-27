// campus_finder.js

// Database for Locations
const courseDatabase = {
    "mca": {
        courseName: "MCA 1st Year / 2nd Year",
        block: "Smart Computing Block",
        floor: "3rd Floor",
        room: "Room No. B-302 <br> Room No. B-305", 
        directions: "Enter main gate, walk straight to Smart Computing Block, take central stairs to 2nd floor 3rd Floor, turn right.",
        box: { top: "40%", left: "31%", width: "13%", height: "10%", rotate: "38deg" },
        pin: { top: "35%", left: "25%" }
    },

    "bca": {
        courseName: "BCA 1st/2nd/3rd Year",
        block: "Smart Computing Block",
        floor: "2nd Floor , 3rd Floor",
        room: "Room No. B-201 <br> Room No. B-302 <br> Room No B-405", 
        directions: "Enter main gate, walk straight to Smart Computing Block, take central stairs to 2nd floor, turn right.",
        box: { top: "40%", left: "31%", width: "13%", height: "10%", rotate: "38deg" },
        pin: { top: "35%", left: "25%" }
    },

    "btech cse": {
        courseName: "B.Tech Computer Science (CSE)",
        block: "CB BLock",
        floor: "1st Floor",
        room: "Lab A-104 & Lecture Hall 3",
        directions: "Walk past central fountain, enter Wing A of main building, go to 1st floor.",
        box: { top: "45%", left: "24%", width: "20%", height: "8%", rotate: "40deg" },
        pin: { top: "43%", left: "22%" }
    },

    "btech civil": {
        courseName: "B.Tech Civil",
        block: "Civil Engineering",
        floor: "Ground Floor",
        room: "Room No. B-302 <br> Room No. B-305", 
        directions: "Enter main gate, walk straight to Smart Computing Block, take central stairs to 2nd floor 3rd Floor, turn right.",
        box: { top: "31%", left: "29%", width: "8%", height: "10%", rotate: "41deg" },
        pin: { top: "28%", left: "24%" }
    },

    "mba": {
        courseName: "MBA",
        block: "Main Administration",
        floor: "2nd Floor",
        room: "MB-201",
        directions: "Enter from the main gate, it is the first building on your left.",
        box: { top: "51%", left: "41%", width: "15%", height: "25%", rotate: "0deg" },
        pin: { top: "55%", left: "42.3%" }
    },


    "canteen": {
        courseName: "Central Canteen",
        block: "Student Activity Center",
        floor: "Ground Floor",
        room: "Food Court Area",
        directions: "Walk straight past the main academic building towards the open lawn area.",
        box: { top: "48%", left: "50%", width: "12%", height: "12%", rotate: "40deg" },
        pin: { top: "45%", left: "45%" }
    },
    "library": {
        courseName: "Central Library",
        block: "Admin Block",
        floor: "1st Floor",
        room: "Reading Hall",
        directions: "From Admin block, take the east pathway towards the circular building.",
        box: { top: "51%", left: "41%", width: "15%", height: "25%", rotate: "0deg" },
        pin: { top: "55%", left: "40%" }
    },
    "hostel": {
        courseName: "Boys/Girls Hostel",
        block: "Residential Zone",
        floor: "All Floors",
        room: "Hostel Rooms",
        directions: "Move to the northern end of the campus, past the sports ground.",
        box: { top: "2.3%", left: "50%", width: "35%", height: "35%", rotate: "133deg" },
        pin: { top: "8%", left: "55%" },
    },
    "admin block": {
        courseName: "Admin Block",
        block: "Main Administration",
        floor: "Ground Floor",
        room: "Registrar Office",
        directions: "Enter from the main gate, it is the first building on your left.",
        box: { top: "51%", left: "41%", width: "15%", height: "25%", rotate: "0deg" },
        pin: { top: "55%", left: "40%" }
    },
    "Auditorium": {
        courseName: " Vardhman Auditorium",
        block: "Vardhman Auditorium",
        floor: "Ground Floor",
        room: "Auditorium",
        directions: "Located near the main campus entrance on the right side.",
        box: { top: "40%", left: "5%", width: "15%", height: "20%", rotate: "0deg" },
        pin: { top: "42%", left: "1%" }
    },

    "Ground": {
        courseName: "Cricket Ground",
        block: "Cricket Ground",
        floor: "Ground",
        room: "Cricket Ground",
        directions: "Located near the main campus entrance on the right side.",
        box: { top: "53%", left: "-2%", width: "15%", height: "28%", rotate: "65deg" },
        pin: { top: "53%", left: "-2%" }
    }
};

// ==========================================
// 🔍 1. EXISTING SEARCH FUNCTION
// ==========================================
function findCourseLocation() {
    const query = document.getElementById('courseSearch').value.trim().toLowerCase();
    if(!query) return;

    let data = null;

    // SMART SEARCH LOGIC
    for (let key in courseDatabase) {
        if (key.includes(query) || courseDatabase[key].courseName.toLowerCase().includes(query)) {
            data = courseDatabase[key];
            break; 
        }
    }

    if(data) {
        // Populate Details
        document.getElementById('resCourse').innerText = data.courseName;
        document.getElementById('valCourse').innerText = data.courseName;
        document.getElementById('valBlock').innerText = data.block;
        document.getElementById('valFloor').innerText = data.floor;
        document.getElementById('valRoom').innerHTML = data.room; 
        document.getElementById('valDirections').innerText = data.directions;

        document.getElementById('addressCard').classList.remove('hidden');

        // Apply Red Glow Box & ROTATION
        const glow = document.getElementById('glowOverlay');
        glow.style.top = data.box.top;
        glow.style.left = data.box.left;
        glow.style.width = data.box.width;
        glow.style.height = data.box.height;
        
        let boxRotation = data.box.rotate ? data.box.rotate : "0deg";
        glow.style.transform = `rotate(${boxRotation})`;
        glow.classList.remove('hidden');

        // Apply Pin Marker
        const pin = document.getElementById('pinMarker');
        pin.style.top = data.pin.top;
        pin.style.left = data.pin.left;
        
        document.getElementById('pinLabel').innerHTML = data.courseName; 
        pin.classList.remove('hidden');

        document.getElementById('mapStatus').innerHTML = `<span class="text-emerald-400 font-semibold"><i class="fa-solid fa-check"></i> Found!</span>`;
    } else {
        alert("Location not found! Try searching for 'MCA', 'Canteen', 'Library', 'Hostel', 'Admin', or 'Auditorium'.");
    }
}

function quickSearch(query) {
    document.getElementById('courseSearch').value = query;
    findCourseLocation();
}

// ==========================================
// 🚀 2. NEW FEATURE: LIVE NAVIGATION SYSTEM
// ==========================================
function startNavigation(sourceKey, destKey) {
    if (!sourceKey || !destKey) {
        alert("Please select both Source and Destination.");
        return;
    }
    
    if (sourceKey === destKey) {
        alert("You are already at your destination!");
        return;
    }

    // Getting Coordinates (percentages) from database
    const startPoint = courseDatabase[sourceKey].pin;
    const endPoint = courseDatabase[destKey].pin;

    drawAnimatedRoute(startPoint, endPoint);
}

function drawAnimatedRoute(start, end) {
    // 1. Map container dhoondo (Jisme tumhara background image hai)
    // Hum assume kar rahe hain tumhara pinMarker jis parent me hai wahi map container hai
    const mapContainer = document.getElementById('pinMarker').parentElement;

    // 2. SVG Line Layer (Agar pehle se bani hai toh hata do)
    let oldSvg = document.getElementById('navPathSvg');
    if(oldSvg) oldSvg.remove();

    // Naya SVG create karo
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "navPathSvg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "10"; // Map image ke upar, pins ke niche

    // Dashed Line Draw karo (SVG accepts % values directly!)
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start.left);
    line.setAttribute("y1", start.top);
    line.setAttribute("x2", end.left);
    line.setAttribute("y2", end.top);
    line.setAttribute("stroke", "#0ea5e9"); // Cyan color
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-dasharray", "10,10");
    
    // Line Animation CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes dashMove { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        #navPathSvg line { animation: dashMove 0.5s linear infinite; }
    `;
    
    svg.appendChild(style);
    svg.appendChild(line);
    mapContainer.appendChild(svg);

    // 3. Animated Live Dot (Student Marker)
    let oldDot = document.getElementById('liveNavDot');
    if(oldDot) oldDot.remove();

    const dot = document.createElement('div');
    dot.setAttribute("id", "liveNavDot");
    dot.style.position = "absolute";
    dot.style.width = "16px";
    dot.style.height = "16px";
    dot.style.backgroundColor = "#ef4444"; // Red glowing dot
    dot.style.borderRadius = "50%";
    dot.style.transform = "translate(-50%, -50%)"; // Center offset
    dot.style.zIndex = "20";
    dot.style.boxShadow = "0 0 15px 5px rgba(239, 68, 68, 0.6)";
    
    // Set Starting Point
    dot.style.top = start.top;
    dot.style.left = start.left;
    mapContainer.appendChild(dot);

    // Trick for animation: Thoda delay dekar CSS transition apply karo
    setTimeout(() => {
        dot.style.transition = "top 4s linear, left 4s linear"; // 4 seconds animation
        dot.style.top = end.top;
        dot.style.left = end.left;
    }, 50);

    // Animation khatam hone par alert
    setTimeout(() => {
        alert("🎉 You have arrived at your destination!");
        if (svg) svg.remove();
        if (dot) dot.remove();
    }, 4050);
}

// Cancel Route Function
function cancelNavigation() {
    let oldSvg = document.getElementById('navPathSvg');
    if(oldSvg) oldSvg.remove();

    let oldDot = document.getElementById('liveNavDot');
    if(oldDot) oldDot.remove();
}