# 🏢 Smart Campus Tracker
*(Developed by Team Nexus)*

> An enterprise-grade, multi-tier digital grievance and campus management ecosystem tailored for Indian academic institutions to bring absolute transparency, accountability, and safety to campus life.

---

## 🚀 Project Overview

Traditional Indian campuses often struggle with unmonitored infrastructure complaints, bureaucratic delays, and communication gaps between students and college authorities. **Smart Campus Tracker** revolutionizes how campus issues and emergencies are handled. 

Instead of relying on manual follow-ups and registers, this system introduces an **Automated SLA (Service Level Agreement) Escalation workflow**. If the local campus administration fails to resolve a critical issue within the stipulated time, the ticket automatically escalates to the Top Management tier, ultimately holding the system accountable through automated student penalty vouchers (such as fee discounts).

---

## 🎯 Hackathon Theme Alignments

* **🏛️ GovTech & CyberTrust (Theme 16):** Acts as a transparent digital grievance system ensuring absolute accountability at every administrative level.
* **🛡️ Tech4Her & Campus Safety (Theme 5):** Features a dedicated Emergency SOS panic button for immediate administrative and security alerts.
* **🌐 ConnectTech (Theme 17):** Seamlessly bridges the communication gap between Students, Admin, and Top Management.

---

## ✨ Key Features

* **⏳ 3-Tier Automated SLA Escalation:** Issues flow sequentially from `Admin ➡️ Management ➡️ Student Penalty` if deadlines are breached.
* **🚨 Emergency SOS Panic Button:** Instantly captures user geolocation and broadcasts active security alerts to the campus administration and security desks.
* **🪄 Smart QR Auto-Fill:** Scan physical QR codes placed inside lecture halls, hostels, or libraries to auto-fill building, floor, and room data into the reporting form.
* **🎙️ Voice-to-Text Reporting:** Built-in speech recognition supporting Indian accents/English for fast, hands-free issue descriptions.
* **🔔 Real-Time Sync & Notifications:** Instant dashboard updates and browser push notifications powered by Firebase Firestore.

---

## 💻 Tech Stack

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, JavaScript (ES6+) |
| **Backend & Database** | Firebase Firestore (NoSQL Cloud Database) |
| **APIs & Tools** | Web Speech API, Geolocation API, FontAwesome, QR Code Generator |

---

## ⚙️ How the SLA Escalation Works

1. **Issue Submission:** A student raises a critical infrastructure issue, generating a unique institutional tracking ID (e.g., `COER-XXXXXX`).
2. **Admin Tier (Strict Timer):** Local campus administrators are given a designated window to resolve the ticket.
3. **Management Escalation:** If the admin deadline expires, the system locks the local admin panel for that ticket and flags it on the Top Management executive dashboard.
4. **Penalty Trigger:** If both tiers fail, an accountability mechanism unlocks a **₹500 Fee Discount Voucher** directly on the student's dashboard.

---

## 🚀 Getting Started Locally

To run a local instance for hackathon demonstration or development:

```bash
# Clone the repository
git clone [https://github.com/Akash76-coder/Smart-campus-tracker.git](https://github.com/Akash76-coder/Smart-campus-tracker.git)

# Navigate to the project directory
cd Smart-campus-tracker

# Run via Live Server (Port 5500) in VS Code for local mobile-to-laptop network testing
