const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ✔ Microsoft 365 SMTP setup
 * :contentReference[oaicite:0]{index=0}
 */
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASS
  }
});

/**
 * Booking API
 * :contentReference[oaicite:1]{index=1} will receive requests here
 */
app.post("/book", async (req, res) => {
  const { fullname, phone, email, date, time, address, guests } = req.body;

  const mailOptions = {
    from: process.env.OUTLOOK_USER,
    to: "wenping@southflamellc.com",
    replyTo: email,
    subject: "🔥 New Hibachi Booking Request",
    text: `
New Booking Request

Name: ${fullname}
Phone: ${phone}
Email: ${email}
Date: ${date}
Time: ${time}
Address: ${address}
Guests: ${guests}
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Booking email sent successfully"
    });

  } catch (error) {
    console.error("Email error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});