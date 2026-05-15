const express = require("express");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

const BUSINESS_ADDRESS = "Houston, TX";

//////////////////////////////////////////////////////
// Travel Fee Function
//////////////////////////////////////////////////////

function calculateTravelFee(distanceMiles) {

  if (distanceMiles <= 40) return 50;
  if (distanceMiles <= 60) return 75;
  if (distanceMiles <= 80) return 100;
  if (distanceMiles <= 100) return 125;
  if (distanceMiles <= 120) return 150;

  return "Custom Quote";
}

//////////////////////////////////////////////////////
// Email Transporter
//////////////////////////////////////////////////////

const transporter = nodemailer.createTransport({

  host: "smtp.office365.com",

  port: 587,

  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

});

//////////////////////////////////////////////////////
// Booking Route
//////////////////////////////////////////////////////

app.post("/book", async (req, res) => {

  try {

    const {
      fullname,
      email,
      phone,
      contact,
      date,
      time,
      address,
      guests
    } = req.body;

    //////////////////////////////////////////////////////
    // Calculate Distance
    //////////////////////////////////////////////////////

    const mapsRes = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: BUSINESS_ADDRESS,
          destinations: address,
          units: "imperial",
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    const element =
      mapsRes.data.rows[0].elements[0];

    if (element.status !== "OK") {

      return res.json({
        success: false,
        message: "Could not calculate distance"
      });

    }

    //////////////////////////////////////////////////////
    // Convert meters to miles
    //////////////////////////////////////////////////////

    const distanceMiles =
      (
        element.distance.value / 1609.34
      ).toFixed(1);

    //////////////////////////////////////////////////////
    // Calculate Travel Fee
    //////////////////////////////////////////////////////

    const travelFee =
      calculateTravelFee(Number(distanceMiles));

    //////////////////////////////////////////////////////
    // Email to Owner
    //////////////////////////////////////////////////////

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: process.env.OWNER_EMAIL,

      subject: "New Hibachi Booking Request",

      text: `
New booking request received.

Name: ${fullname}

Email: ${email}

Phone: ${phone}

Preferred Contact: ${contact}

Date: ${date}

Time: ${time}

Address: ${address}

Guests: ${guests}

Distance: ${distanceMiles} miles

Travel Fee: $${travelFee}
      `
    });

    //////////////////////////////////////////////////////
    // Confirmation Email to Guest
    //////////////////////////////////////////////////////

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "We Received Your Hibachi Booking Request",

      text: `
Hi ${fullname},

Thank you for your booking request!

Here are your submitted booking details:

Date: ${date}

Time: ${time}

Event Address:
${address}

Estimated Guests:
${guests}

Estimated Distance:
${distanceMiles} miles

Estimated Travel Fee:
$${travelFee}

We will review your request and contact you shortly to confirm availability.

Thank you,
Authentic Hibachi
      `
    });

    //////////////////////////////////////////////////////
    // Response Back to Frontend
    //////////////////////////////////////////////////////

    res.json({
      success: true,
      distanceMiles,
      travelFee
    });

  } catch (err) {

    console.error(err);

    res.json({
      success: false,
      message: "Server error"
    });

  }

});

//////////////////////////////////////////////////////
// Start Server
//////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});