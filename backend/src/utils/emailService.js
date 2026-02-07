import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: true,
  auth: { 
    user: config.smtpUser, 
    pass: config.smtpPass 
  },
});

// Send form submission notification
export const sendFormSubmissionNotification = async (userEmail, formName, formTitle, responseCount) => {
  try {
    // Check if SMTP is configured
    if (!config.smtpUser || !config.smtpPass) {
      console.log("SMTP not configured, skipping email notification");
      return { success: false, message: "SMTP not configured" };
    }

    const mailOptions = {
      from: `"Arphatra Forms" <${config.smtpUser}>`,
      to: userEmail,
      subject: `New Response for "${formTitle || formName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8F0; border-radius: 10px;">
          <div style="background-color: #584738; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 New Form Response!</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #584738; margin-bottom: 20px;">
              Hello,
            </p>
            
            <p style="font-size: 16px; color: #584738; margin-bottom: 20px;">
              Someone just submitted a response to your form <strong>"${formTitle || formName}"</strong>.
            </p>
            
            <div style="background-color: #FFF8F0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #584738;">
                <strong>Form Name:</strong> ${formName}
              </p>
              ${formTitle ? `<p style="margin: 5px 0; color: #584738;">
                <strong>Form Title:</strong> ${formTitle}
              </p>` : ''}
              <p style="margin: 5px 0; color: #584738;">
                <strong>Total Responses:</strong> ${responseCount}
              </p>
              <p style="margin: 5px 0; color: #584738;">
                <strong>Submitted At:</strong> ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'long', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>
            
            <p style="font-size: 16px; color: #584738; margin-top: 20px;">
              Log in to your Arphatra dashboard to view the response details.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/homepage" 
                 style="background-color: #584738; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #8B7355; font-size: 12px;">
            <p>This email was sent because you have email notifications enabled in your Arphatra settings.</p>
            <p>To disable these notifications, go to Settings → Notifications in your dashboard.</p>
          </div>
        </div>
      `,
      text: `
New Response Received!

Someone just submitted a response to your form "${formTitle || formName}".

Form Name: ${formName}
${formTitle ? `Form Title: ${formTitle}` : ''}
Total Responses: ${responseCount}
Submitted At: ${new Date().toLocaleString()}

Log in to your Arphatra dashboard to view the response details: http://localhost:5173/homepage

---
This email was sent because you have email notifications enabled. 
To disable, go to Settings → Notifications in your dashboard.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${userEmail}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email notification:", error);
    return { success: false, message: error.message };
  }
};

// Weekly summary (placeholder for future implementation)
export const sendWeeklySummary = async (userEmail, formStats) => {
  // TODO: Implement weekly summary email
  console.log("Weekly summary feature not yet implemented");
};
