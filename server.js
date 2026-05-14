const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// EMAIL SETUP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  requireTLS: true,
  tls: {
    family: 4,
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
// BOOKING API
app.post("/book", async (req, res) => {
  const { fullname, phone, email, date, time, address, guests } = req.body;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: "🔥 New Hibachi Booking",
    text: `
New Booking:

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
    return res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ success: false, error: "Email failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});