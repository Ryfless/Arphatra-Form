# 🏛️ Architecture Guide

Dokumen ini menjelaskan arsitektur tingkat tinggi dan keputusan teknis di balik **Arphatra Form Builder**.

## 1. System Design Pattern

Arphatra menggunakan pola arsitektur **Client-Server (RESTful API)** yang terpisah secara modular.

*   **Frontend (SPA):** Bertanggung jawab atas UI/UX, interaksi pengguna, dan validasi sisi klien. Menggunakan React dengan pendekatan *Component-Based*.
*   **Backend (API):** Bertindak sebagai gerbang logika bisnis, otentikasi, dan interaksi database. Menggunakan Express.js.
*   **Database (NoSQL):** Menyimpan data form dan jawaban dalam struktur dokumen yang fleksibel menggunakan Firestore.

## 2. Frontend Architecture

### State Management
Kami menghindari penggunaan library global state yang berat (seperti Redux) dan memilih pendekatan yang lebih *lean*:
*   **Local State (`useState`):** Untuk interaksi UI sesaat (hover, open menu, input form).
*   **Context/Props Drilling:** Untuk data yang perlu diakses oleh komponen anak (seperti `QuestionCard` menerima data dari `CreateFormPage`).
*   **Custom Hooks:** Digunakan untuk logika yang berulang (misal: `useAuth`).

### Component Structure
*   **Pages:** Halaman utama (misal: `HomePage`, `CreateFormPage`) bertindak sebagai *Controller* yang mengambil data dan mengatur layout.
*   **Components/CMS:** Komponen spesifik untuk editor form (`QuestionCard`, `Sidebar`, `OptionPanel`).
*   **Components/UI:** Komponen dasar yang *reusable* (`Button`, `Input`, `Popup`, `Toast`).

### Styling System
Menggunakan **Tailwind CSS v4** dengan konfigurasi tema warna terpusat di `globals.css`:
*   `--color-mahogany`: Warna utama (Cokelat Tua).
*   `--color-rice`: Warna latar belakang terang (Krem).
*   `--color-vanilla`: Warna aksen sekunder.

## 3. Backend Architecture

### Handler-Route Pattern
Backend diorganisir menggunakan pola standar Express:
1.  **Routes (`src/routes`):** Mendefinisikan endpoint URL dan middleware yang relevan.
2.  **Middlewares (`src/middlewares`):** Melakukan verifikasi token (`verifyToken`) sebelum request masuk ke handler.
3.  **Handlers (`src/handlers`):** Berisi logika bisnis utama (validasi input, query database, response formatting).

### Database Schema (Firestore)

**Collection: `users`**
*   Menyimpan profil pengguna (Nama, Email, Role).

**Collection: `forms`**
*   `id` (UUID): ID unik form.
*   `userId` (UID): Pemilik form.
*   `title` (String): Judul form.
*   `questions` (Array of Objects): Struktur pertanyaan (JSON).
*   `theme` (Object): Konfigurasi warna dan gambar.
*   `slug` (String): URL kustom (opsional).
*   **Sub-collection: `responses`**
    *   `id`: ID jawaban.
    *   `submittedAt`: Timestamp.
    *   `answers` (Object): Key-value pair `{ questionId: value }`.

## 4. Deployment Strategy

Arphatra menggunakan **Firebase Suite** untuk infrastruktur produksi:
*   **Hosting:** Melayani Landing Page (`/`) dan CMS Dashboard (`/cms/`). SPA Routing dikelola melalui `firebase.json` rewrites.
*   **Cloud Functions (Gen 2):** Backend Express di-deploy ke region **Singapore (`asia-southeast1`)** untuk latensi rendah bagi pengguna di Asia Tenggara.
*   **Storage:** Digunakan untuk menyimpan aset statis seperti gambar profil dan banner form.

## 5. Key Features Implementation

### Custom URL Slugs
User dapat menentukan URL kustom untuk form mereka (misal: `arphatra.web.app/f/lomba`).
*   **Backend:** `getFormById` melakukan lookup ganda (mencoba mencari `id` (UUID) lalu `slug`).
*   **Frontend:** Menampilkan indikator ketersediaan slug secara real-time melalui endpoint `/forms/check-slug`.

### Automatic Thumbnails
Saat form disimpan, frontend menggunakan library `html-to-image` untuk menangkap screenshot area editor. Gambar ini kemudian diunggah ke Firebase Storage dan URL-nya disimpan di field `thumbnail`. Dashboard menggunakan URL ini untuk menampilkan preview visual form di tampilan Grid.

### Robust File Uploads (Busboy)
Untuk mengatasi batasan stream parsing di Firebase Cloud Functions (v2), backend menggunakan `busboy` secara manual sebagai pengganti `multer`. Ini memungkinkan pemrosesan file multipart/form-data yang lebih stabil di lingkungan serverless.

### Multi-language (i18n)
Mendukung Bahasa Inggris dan Bahasa Indonesia melalui `LanguageProvider`. Pilihan bahasa disimpan di Firestore dalam pengaturan profil user dan disinkronkan saat login.

### Google OAuth
Menggunakan Firebase SDK di frontend untuk mendapatkan `idToken`, yang kemudian divalidasi oleh Backend menggunakan `firebase-admin` untuk menjamin keamanan data dan sinkronisasi profil otomatis.

## 6. Security Measures

1.  **JWT Authentication:** Semua request sensitif harus menyertakan header `Authorization: Bearer <token>`.
2.  **CORS Policy:** Dikonfigurasi untuk hanya menerima request dari domain frontend yang diizinkan.
3.  **Input Validation:** Validasi di sisi frontend dan backend (sanitasi data).
4.  **Ownership Check:** Middleware backend memverifikasi apakah user yang login berhak mengedit/menghapus form tersebut (`userId` match).