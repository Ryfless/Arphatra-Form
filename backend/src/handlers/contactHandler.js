import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: true,
  auth: { user: config.smtpUser, pass: config.smtpPass },
});

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Semua field harus diisi" });
    }

    // Email to the admin (you)
    const mailOptions = {
      from: `"Arphatra Contact" <${config.smtpUser}>`,
      to: "arphatraform@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #584738; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #584738; border-bottom: 2px solid #584738; padding-bottom: 10px;">New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #F6F8ED; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #AAA396; margin-top: 30px;">Sent via Arphatra Contact Form</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact Form Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengirim pesan", error: error.message });
  }
};
