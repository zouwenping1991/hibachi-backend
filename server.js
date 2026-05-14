const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/book", async (req, res) => {
  console.log("📩 Booking received:", req.body);

  const { fullname, phone, email, date, time, address, guests } = req.body;

  try {
    console.log("📤 Sending email...");

    const result = await resend.emails.send({
      from: "Authentic Hibachi <bookings@authentichibachi.com>",
      to: "authentichibachi@southflamellc.com",
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
    });

    console.log("✅ Email sent:", result);

    return res.json({ success: true });

  } catch (error) {
    console.error("❌ Email error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});