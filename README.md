# BGAN M2M Monitoring Dashboard (Frontend)

This project is a web-based dashboard for monitoring BGAN M2M communication in real-time. It visualizes signal data, device information, network status, and PDP connection through integration with a backend service.

---

## Live Demo

https://bgan-m2m-dashboard.vercel.app

---

## Dashboard Preview

![BGAN Dashboard](Dashboard%20bgan.jpeg)

---

## Features

### Signal Monitoring

* Display real-time signal strength
* Visualize signal history in chart form
* Auto-refresh data with configurable interval

### Device & Network Information

* Display satellite information (ID & name)
* Display IMEI and IMSI
* Show network registration status (home, roaming, etc.)

### PDP & Connection Monitoring

* Display PDP status (active / inactive)
* Show assigned IP address
* Activate PDP connection
* Deactivate PDP connection

### APN Configuration

* Display APN profiles
* Configure APN (APN name, username, password)
* Save APN settings via backend API

### Dashboard

* Real-time data updates
* Interactive visualization
* Responsive dashboard layout

---

## Tech Stack

* React.js
* JavaScript
* REST API (Flask backend)
* Vercel (deployment)

---

## Backend Integration

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

## How to Run

```bash
npm install
npm start
```

Open in browser:
http://localhost:3000

---

## Project Structure

- `src/` → Main application logic (components, API calls, pages)
- `public/` → Static assets
- `package.json` → Dependencies & scripts
- `vercel.json` → Deployment configuration (if used)

---

## Notes

* Requires backend service to function properly
* Uses polling mechanism for real-time updates
* Designed for monitoring BGAN modem via AT Commands system

---

## Author

Velanie Nur Shabrina
