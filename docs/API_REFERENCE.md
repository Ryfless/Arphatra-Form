# 📡 API Reference

Base URL: `http://localhost:5000/api`

## Authentication

### Login
`POST /auth/login`
*   **Body:** `{ email, password }`
*   **Response:** `{ token, user }`

### Register
`POST /auth/register`
*   **Body:** `{ fullName, email, password }`
*   **Response:** `{ token, user }`

### Google Login
`POST /auth/google-login`
*   **Body:** `{ idToken }` (Didapat dari Firebase Client SDK)
*   **Description:** Memverifikasi token Google, mencari/membuat user di Firestore, dan mengembalikan data profil lengkap.
*   **Response:** `{ success: true, message: "...", data: { ...user, idToken } }`

---

## Forms

### Get All Forms
`GET /forms`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `[ { id, title, createdAt, ... } ]`

### Get Single Form
`GET /forms/:formId`
*   **Access:** Public
*   **Response:** `{ id, title, questions, theme, ... }`

### Create Form
`POST /forms`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:**
    ```json
    {
      "title": "My Form",
      "description": "...",
      "questions": [...],
      "theme": {...}
    }
    ```
*   **Response:** `{ id, status: "success" }`

### Update Form
`PUT /forms/:formId`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** (Sama seperti Create)
*   **Response:** `{ message: "Form updated" }`

### Delete Form
`DELETE /forms/:formId`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `{ message: "Form deleted" }`

---

## Responses

### Submit Response
`POST /forms/:formId/submit`
*   **Access:** Public
*   **Body:**
    ```json
    {
      "answers": {
        "questionId_1": "Answer Value",
        "questionId_2": ["Option A", "Option B"]
      }
    }
    ```

### Get Form Responses (Analytics)
`GET /forms/:formId/responses`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `[ { id, answers, submittedAt } ]`

---

## Uploads

### Upload File
`POST /upload`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** `FormData` (Key: `file`)
*   **Response:** `{ data: { url: "https://storage..." } }`
