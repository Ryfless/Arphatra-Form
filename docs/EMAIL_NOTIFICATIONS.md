# Email Notification Feature - Setup Guide

## Overview
Arphatra now supports email notifications when someone submits a response to your forms. Users can enable/disable this feature from the Settings page.

## Features

### 1. **Email Notifications on Form Submission**
- Automatically sends email to form owner when a response is submitted
- Beautiful HTML email template with form details
- Can be toggled ON/OFF in Settings → Notifications

### 2. **Weekly Form Analytics** (Placeholder)
- Weekly summary email feature (to be implemented)
- Can be enabled in Settings → Notifications

## Backend Implementation

### Files Modified/Created:

1. **`src/utils/emailService.js`** (NEW)
   - `sendFormSubmissionNotification()` - Sends email when form receives a response
   - `sendWeeklySummary()` - Placeholder for weekly summary feature
   - Uses nodemailer with SMTP configuration

2. **`src/handlers/formHandler.js`** (UPDATED)
   - Modified `submitResponse()` function
   - Now checks user settings before sending email
   - Fetches form owner details and notification preferences
   - Sends email if `settings.notifications.email === true`

3. **`src/handlers/settingsHandler.js`** (EXISTING)
   - Already handles saving/loading user settings
   - Settings structure:
     ```javascript
     {
       notifications: {
         email: true/false,          // Email on each submission
         weeklySummary: true/false   // Weekly analytics email
       },
       display: {
         layout: 'list'/'grid',
         language: 'English (US)'/'Bahasa Indonesia'
       }
     }
     ```

## SMTP Configuration

### Step 1: Get Gmail App Password

1. Go to Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Search for **App passwords** in the search bar
5. Create a new App Password:
   - Select app: **Mail**
   - Select device: **Other** (custom name)
   - Name it: "Arphatra Backend"
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Configure Backend `.env`

Edit your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=arphatra.forms@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

> ⚠️ **Important:** Never commit your `.env` file to Git! It's already in `.gitignore`.

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

## Testing Email Notifications

### Test 1: Enable Email Notifications

1. Login to Arphatra frontend
2. Go to **Settings** → **Notifications**
3. Toggle **Email Notifications** to **ON**
4. Settings are auto-saved to backend

### Test 2: Submit a Form Response

1. Create a test form
2. Get the public form link
3. Open the link in incognito/private browser
4. Submit a response
5. Check your email inbox for notification

### Test 3: Disable Email Notifications

1. Go to **Settings** → **Notifications**
2. Toggle **Email Notifications** to **OFF**
3. Submit another form response
4. You should NOT receive an email

## Email Template

The notification email includes:
- **Subject:** `New Response for "Your Form Title"`
- **From:** `Arphatra Forms <your-smtp-email>`
- **Content:**
  - Form name and title
  - Total response count
  - Submission timestamp
  - Link to dashboard
  - Instructions to disable notifications

### Email Preview

```
🎉 New Form Response!

Someone just submitted a response to your form "Customer Feedback Form".

Form Name: Feedback Q1 2026
Form Title: Customer Feedback Form
Total Responses: 23
Submitted At: February 7, 2026 at 1:30 PM

[View Dashboard Button]

---
This email was sent because you have email notifications enabled.
To disable, go to Settings → Notifications in your dashboard.
```

## Troubleshooting

### Email Not Sending?

1. **Check SMTP Configuration**
   ```bash
   # In backend/.env, verify:
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

2. **Check Backend Logs**
   ```bash
   # Look for:
   "Email notification sent to user@example.com"
   # OR error messages:
   "Error sending email notification: ..."
   ```

3. **Common Issues:**
   - **"Invalid login"** → Wrong app password, regenerate it
   - **"SMTP not configured"** → Missing SMTP_USER or SMTP_PASS in .env
   - **"Connection timeout"** → Firewall blocking port 465

4. **Test SMTP Manually**
   ```javascript
   // In backend, create test.js:
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 465,
     secure: true,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   
   transporter.sendMail({
     from: 'your-email@gmail.com',
     to: 'your-email@gmail.com',
     subject: 'Test Email',
     text: 'This is a test email from Arphatra'
   }).then(() => console.log('Email sent!'))
     .catch(err => console.error('Error:', err));
   ```

### Settings Not Saving?

1. Check browser console for errors
2. Verify backend `/api/users/settings` endpoint is working
3. Check Firestore database → `users` collection → `settings` field

### Email Goes to Spam?

1. Add sender email to your contacts
2. Mark email as "Not spam"
3. Consider using a custom domain email (not Gmail) for production

## Production Considerations

### For Production Deployment:

1. **Use Professional Email Service**
   - Gmail SMTP is limited to 500 emails/day
   - Consider: SendGrid, AWS SES, Mailgun, or Postmark
   - Better deliverability and analytics

2. **Update Email Template**
   - Replace `http://localhost:5173` with your production URL
   - Add your company logo
   - Customize colors to match brand

3. **Rate Limiting**
   - Implement rate limiting for email sending
   - Prevent spam/abuse

4. **Email Queue**
   - Use a queue system (Bull, RabbitMQ) for high-volume forms
   - Avoid blocking API responses

5. **Unsubscribe Link**
   - Add "Unsubscribe" link in footer (legal requirement in some countries)
   - Comply with GDPR/CAN-SPAM laws

## Future Enhancements

- [ ] Weekly analytics summary email
- [ ] Customizable email templates
- [ ] Email preview before sending
- [ ] Multiple notification recipients
- [ ] Slack/Discord webhook integration
- [ ] Push notifications (browser)
- [ ] SMS notifications (Twilio)

## API Reference

### Settings Structure

**GET** `/api/users/settings`

Response:
```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "weeklySummary": false
    },
    "display": {
      "layout": "list",
      "language": "English (US)"
    }
  }
}
```

**PUT** `/api/users/settings`

Request:
```json
{
  "category": "notifications",
  "key": "email",
  "value": true
}
```

Response:
```json
{
  "success": true,
  "message": "Settings updated",
  "data": { /* full settings object */ }
}
```

## Summary

✅ **Settings Page Notifications ARE connected to backend:**
- Toggle states saved to Firestore `users/{userId}/settings`
- Email notifications triggered on form submission
- Respects user preference (ON/OFF)

✅ **Email Service:**
- Fully functional with Gmail SMTP
- HTML email template ready
- Error handling in place

✅ **Next Steps:**
1. Configure SMTP in `.env`
2. Test email notifications
3. Deploy to production with professional email service

---

**Note:** Make sure to configure SMTP credentials before testing. Without valid SMTP configuration, emails will not be sent (but the app will continue to work normally).
