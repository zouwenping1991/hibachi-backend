const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// BOOKING API
app.post("/book", async (req, res) => {
  const { fullname, phone, email, date, time, address, guests } = req.body;

  const mailOptions = {
    from: email,
    to: "process.env.GMAIL_USER",
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
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});