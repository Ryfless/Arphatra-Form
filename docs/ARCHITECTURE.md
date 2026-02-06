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
*   **Sub-collection: `responses`**
    *   `id`: ID jawaban.
    *   `submittedAt`: Timestamp.
    *   `answers` (Object): Key-value pair `{ questionId: value }`.

## 4. Authentication Flow

Arphatra mendukung dua metode autentikasi:
1.  **Email/Password:** Login tradisional menggunakan Firebase Auth REST API.
2.  **Google OAuth:** Menggunakan Firebase SDK di frontend untuk mendapatkan `idToken`, yang kemudian divalidasi oleh Backend menggunakan `firebase-admin` untuk menjamin keamanan data dan sinkronisasi profil otomatis.

## 5. Security Measures

1.  **JWT Authentication:** Semua request sensitif harus menyertakan header `Authorization: Bearer <token>`.
2.  **CORS Policy:** Dikonfigurasi untuk hanya menerima request dari domain frontend yang diizinkan.
3.  **Input Validation:** Validasi di sisi frontend dan backend (sanitasi data).
4.  **Ownership Check:** Middleware backend memverifikasi apakah user yang login berhak mengedit/menghapus form tersebut (`userId` match).
