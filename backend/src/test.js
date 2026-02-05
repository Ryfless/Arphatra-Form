// File untuk testing API endpoints
// Gunakan Postman, Insomnia, atau curl untuk testing

/*
CONTOH TEST ENDPOINTS:

1. REGISTER USER
-----------------
Method: POST
URL: http://localhost:5000/api/auth/register
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+6281234567890"
}

Expected Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "userId": "uuid-value",
    "uid": "firebase-uid",
    "email": "john@example.com",
    "fullName": "John Doe",
    "idToken": "token...",
    "refreshToken": "refresh-token..."
  }
}

---

2. LOGIN USER
-----------------
Method: POST
URL: http://localhost:5000/api/auth/login
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}

Expected Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "userId": "uuid-value",
    "uid": "firebase-uid",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+6281234567890",
    "idToken": "token...",
    "refreshToken": "refresh-token..."
  }
}

---

3. GET USER PROFILE (Protected)
-----------------
Method: GET
URL: http://localhost:5000/api/auth/profile
Headers: 
  Authorization: Bearer {idToken}

Expected Response:
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "uid": "firebase-uid",
    "userId": "uuid-value",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+6281234567890",
    "createdAt": "2024-01-08T12:00:00.000Z",
    "updatedAt": "2024-01-08T12:00:00.000Z"
  }
}

---

4. UPDATE USER PROFILE (Protected)
-----------------
Method: PUT
URL: http://localhost:5000/api/auth/profile
Headers: 
  Content-Type: application/json
  Authorization: Bearer {idToken}

Body (JSON):
{
  "fullName": "John Smith",
  "phoneNumber": "+6287654321098"
}

Expected Response:
{
  "success": true,
  "message": "Profil user berhasil diperbarui",
  "data": {
    "uid": "firebase-uid",
    "userId": "uuid-value",
    "email": "john@example.com",
    "fullName": "John Smith",
    "phoneNumber": "+6287654321098",
    "updatedAt": "2024-01-08T13:00:00.000Z"
  }
}

---

5. REFRESH TOKEN
-----------------
Method: POST
URL: http://localhost:5000/api/auth/refresh-token
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "refreshToken": "refresh-token-value"
}

Expected Response:
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "idToken": "new-token...",
    "refreshToken": "new-refresh-token..."
  }
}

---

6. LOGOUT USER (Protected)
-----------------
Method: POST
URL: http://localhost:5000/api/auth/logout
Headers: 
  Authorization: Bearer {idToken}

Expected Response:
{
  "success": true,
  "message": "Logout berhasil"
}

---

7. HEALTH CHECK
-----------------
Method: GET
URL: http://localhost:5000/api/health

Expected Response:
{
  "success": true,
  "message": "API berjalan dengan baik",
  "timestamp": "2024-01-08T12:30:00.000Z"
}

*/

export default {
  message: "Lihat comments di file ini untuk contoh testing API endpoints",
};