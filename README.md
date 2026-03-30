# 📊 BGAN M2M Monitoring Dashboard (Frontend)

This project is a frontend dashboard for monitoring BGAN M2M communication in real-time.
It visualizes signal data, device information, network status, and PDP connection using data from the backend API.

---

## 🚀 Features

### 📡 Signal Monitoring

* Display real-time signal strength
* Visualize signal history in chart form
* Auto-refresh data with configurable interval

### 🛰️ Device & Network Information

* Display satellite information (ID & name)
* Display IMEI and IMSI
* Show network registration status (home, roaming, etc.)

### 🔗 PDP & Connection Monitoring

* Display PDP status (active / inactive)
* Show assigned IP address
* Activate PDP connection
* Deactivate PDP connection

### 📶 APN Configuration

* Display APN profiles
* Configure APN (APN name, username, password)
* Save APN settings via backend API

---

## ⚙️ System Features

* Real-time data fetching from backend API
* Auto polling mechanism (interval-based)
* Responsive dashboard layout
* Integration with BGAN backend system

---

## 🧩 Tech Stack

* React.js
* JavaScript
* REST API (Flask backend)
* Vercel (deployment)

---

## 📂 Project Structure

* `src/` → Main application logic
* `public/` → Static assets
* `package.json` → Dependencies & scripts

---

## ▶️ How to Run

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm start
```

3. Open in browser:

```
http://localhost:3000
```

---

## 🔌 Backend Integration

This frontend communicates with backend API endpoints such as:

* `/api/m2m/signal`
* `/api/m2m/signal-history`
* `/api/m2m/network`
* `/api/m2m/satellite`
* `/api/m2m/imei`
* `/api/m2m/imsi`
* `/api/m2m/apn`
* `/api/m2m/pdp-status`
* `/api/m2m/pdp-activate`
* `/api/m2m/pdp-deactivate`

---

## 🌐 Live Demo

👉 https://bgan-m2m-dashboard.vercel.app

---

## 🧠 Notes

* This dashboard depends on backend availability
* Uses polling to update real-time data
* Designed for monitoring BGAN modem via AT Commands system

---

## 👩‍💻 Author

Velanie Nur Shabrina
Computer Engineering
