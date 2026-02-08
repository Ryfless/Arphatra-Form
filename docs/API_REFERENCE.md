# 📡 API Reference

Base URL: `https://asia-southeast1-pentataste-ff444.cloudfunctions.net/api` (Singapore Region)

All protected endpoints require an `Authorization: Bearer <token>` header.

## 🔐 Authentication

### Register
`POST /auth/register`
*   **Body:** `{ fullName, email, password }`
*   **Response:** `{ success: true, message: "...", data: { token, user } }`

### Login
`POST /auth/login`
*   **Body:** `{ email, password }`
*   **Response:** `{ success: true, message: "...", data: { token, user } }`

### Google Auth
`POST /auth/google-login`
*   **Body:** `{ idToken }` (Obtained from Firebase Client SDK)
*   **Description:** Verifies Google token and syncs profile with Firestore.
*   **Response:** `{ success: true, data: { user, idToken } }`

### Forgot Password
`POST /auth/forgot-password`
*   **Body:** `{ email }`
*   **Description:** Sends a 6-digit OTP to the user's email.

### Reset Password
`POST /auth/reset-password`
*   **Body:** `{ email, otp, newPassword }`
*   **Description:** Resets the password if OTP matches.

---

## 👤 User & Settings (Protected)

### Get Profile
`GET /users/profile`
*   **Response:** `{ status: "success", data: { uid, email, fullName, avatarUrl, createdAt } }`

### Update Profile
`PUT /users/profile`
*   **Body:** `{ fullName, avatarUrl }` (Optional fields)
*   **Response:** `{ status: "success", data: updatedUser }`

### Get Settings
`GET /users/settings`
*   **Response:** `{ status: "success", data: { notifications, display, preferences } }`

### Update Settings
`PUT /users/settings`
*   **Body:** `{ category, key, value }`
*   **Example:** `{ "category": "display", "key": "language", "value": "Bahasa Indonesia" }`

### Deactivate Account
`POST /users/deactivate`
*   **Description:** Temporarily disables the account.

### Delete Account
`DELETE /users/delete`
*   **Description:** Permanently removes user, forms, and responses. **Irreversible.**

---

## 📝 Forms

### Get All My Forms (Protected)
`GET /forms`
*   **Response:** `{ status: "success", data: [ FormObjects ] }`

### Create Form (Protected)
`POST /forms`
*   **Body:**
    ```json
    {
      "name": "Internal Form Name",
      "title": "Public Form Title",
      "description": "...",
      "theme": { "backgroundColor": "...", "cardColor": "...", "accentColor": "...", "bannerImage": "..." },
      "questions": [ ... ],
      "slug": "custom-url",
      "thumbnail": "https://storage..."
    }
    ```

### Update Form (Protected)
`PUT /forms/:formId`
*   **Body:** Same as Create Form (All fields optional).

### Delete Form (Protected)
`DELETE /forms/:formId`
*   **Description:** Deletes the form and all associated responses.

### Check Slug Availability (Protected)
`GET /forms/check-slug?slug=my-url`
*   **Response:** `{ status: "success", available: true/false }`

### View Form (Public)
`GET /forms/:formId`
*   **Access:** Supports UUID or Slug.
*   **Response:** `{ status: "success", data: FormObject }`

---

## 📊 Responses

### Submit Response (Public)
`POST /forms/:formId/submit`
*   **Body:**
    ```json
    {
      "answers": {
        "question_id": "value"
      }
    }
    ```

### Get Analytics (Protected)
`GET /forms/:formId/responses`
*   **Response:** `{ status: "success", data: [ ResponseObjects ] }`

---

## 📁 Assets & Utilities

### Upload File (Protected)
`POST /upload`
*   **Body:** `FormData` with key `file`.
*   **Description:** Specifically optimized for Cloud Functions (uses Busboy).
*   **Response:** `{ status: "success", data: { url: "..." } }`

### Contact Support (Public)
`POST /contact`
*   **Body:** `{ name, email, message }`
*   **Description:** Sends a support email to Arphatra admins.
