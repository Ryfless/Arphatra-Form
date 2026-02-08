# 🦅 Arphatra Form Builder

> **Professional, High-Performance, and Aesthetic Form Builder Application.**
> Build beautiful forms, collect data, and analyze responses with ease.

![Arphatra Banner](frontend/public/assets/images/banner-login.png)

## 🌟 Overview

**Arphatra** adalah aplikasi Form Builder modern (SaaS-ready) yang dirancang dengan antarmuka yang intuitif dan estetika visual yang tinggi ("Mahogany & Rice" Theme). Dibangun dengan teknologi terkini untuk memastikan performa yang cepat dan skalabilitas tinggi.

### Key Features
*   **Drag & Drop Editor:** Susun pertanyaan dengan mudah menggunakan antarmuka seret-lepas.
*   **Google Login:** Akses cepat dan aman menggunakan akun Google.
*   **Rich Content Support:** Dukungan untuk Gambar, Video (YouTube/Vimeo), dan format teks kaya.
*   **Real-time Analytics:** Dashboard visual (Pie Chart, Histogram) untuk menganalisis jawaban secara instan.
*   **Secure & Fast:** Terintegrasi dengan Firebase Authentication & Firestore untuk keamanan data tingkat tinggi.
*   **Automatic Thumbnail Generation:** Preview visual form otomatis dibuat saat disimpan untuk tampilan Dashboard yang lebih informatif.
*   **Multi-Page Forms:** Dukungan otomatis untuk pemisahan halaman (Section) dan logika navigasi.
*   **Export Data:** Ekspor hasil tanggapan ke format Spreadsheet untuk analisis lebih lanjut.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** [React 19](https://react.dev/) (Vite)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Routing:** React Router Dom v7
*   **State Management:** React Hooks (Context + Local State)
*   **Icons:** Custom SVG & Material Icons

### Backend (Server)
*   **Runtime:** [Node.js v22](https://nodejs.org/)
*   **Framework:** Express.js
*   **Database:** Google Firestore (NoSQL)
*   **Auth:** Firebase Authentication (Admin SDK)
*   **Storage:** Firebase Cloud Storage

---

## 🚀 Quick Start

Ikuti langkah ini untuk menjalankan proyek di komputer lokal Anda.

### Prerequisites
*   Node.js v18+ installed
*   Akun Google Firebase (Project baru)

### 1. Clone Repository
```bash
git clone https://github.com/username/arphatra-pweb.git
cd arphatra-pweb
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```
*   Isi `.env` dengan kredensial Firebase Anda.
*   Letakkan file `serviceAccountKey.json` dari Firebase Console di folder `backend/`.

**Jalankan Server:**
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Setup Frontend
Buka terminal baru:
```bash
cd frontend
npm install
cp .env.example .env
```
*   Isi `.env` dengan konfigurasi Firebase Client Anda.

**Jalankan Client:**
```bash
npm run dev
# App running on http://localhost:5173
```

---

## 📂 Project Structure

```
arphatra-pweb/
├── backend/            # Express Server & API Handlers
│   ├── src/
│   │   ├── config/     # Firebase & Server Config
│   │   ├── handlers/   # Business Logic (Form, Auth, Upload)
│   │   ├── middleware/ # Auth Verification
│   │   └── routes/     # API Endpoints
│   └── serviceAccountKey.json
│
├── frontend/           # React Application
│   ├── public/         # Static Assets (Icons, Images)
│   ├── src/
│   │   ├── components/ # Reusable UI Components (CMS, Popup, Toast)
│   │   ├── lib/        # Utilities (API Helper, Storage)
│   │   ├── pages/      # Main Views (Home, Create, View)
│   │   └── styles/     # Global Tailwind CSS
│
└── docs/               # Detailed Documentation
```

## 📚 Documentation

*   [**Architecture Guide**](./docs/ARCHITECTURE.md) - Penjelasan mendalam tentang struktur kode.
*   [**API Reference**](./docs/API_REFERENCE.md) - Daftar lengkap endpoint backend.
*   [**Contributing**](./docs/CONTRIBUTING.md) - Panduan untuk kontributor.

---

## 👥 Authors

*   **Arrazi** -
*   **Farras** -
*   **Fika**   -
*   **Hurul**  -

Licensed under [MIT License](LICENSE).
