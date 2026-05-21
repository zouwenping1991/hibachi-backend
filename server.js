const express = require("express");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

const BUSINESS_ADDRESS = "4002 Woodhaven St, Houston, TX, 77025";

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

      state,
      city,
      streetAddress,
      zipcode,

      adults,
      kids,

      foodOrder,
      foodAllergies,
      addons,
      specialInstructions,
      promoCode,
      hearAboutUs,
      agreePolicy,
      agreeTerms,
      agreeTravelPolicy
    } = req.body;

    const fullEventAddress =
      `${streetAddress}, ${city}, ${state} ${zipcode}`;
    //////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Calculate Distance
//////////////////////////////////////////////////////

const mapsRes = await axios.get(
  "https://maps.googleapis.com/maps/api/distancematrix/json",
  {
    params: {
      origins: BUSINESS_ADDRESS,
      destinations: fullEventAddress,
      units: "imperial",
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  }
);

console.log("Google Distance API response:");
console.log(JSON.stringify(mapsRes.data, null, 2));

//////////////////////////////////////////////////////
// Default values if distance calculation fails
//////////////////////////////////////////////////////

let distanceMiles = "Unknown";
let travelFee = 50;

const element =
  mapsRes.data?.rows?.[0]?.elements?.[0];

//////////////////////////////////////////////////////
// If Google successfully calculates distance
//////////////////////////////////////////////////////

if (element && element.status === "OK") {

  distanceMiles =
    (
      element.distance.value / 1609.34
    ).toFixed(1);

  travelFee =
    calculateTravelFee(Number(distanceMiles));

} else {

  console.log(
    "Distance calculation failed. Using default travel fee."
  );

}

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
Address: ${fullEventAddress}
Phone: ${phone}
Preferred Contact: ${contact}

Date: ${date}
Time: ${time}

Adults: ${adults}
Kids: ${kids}

Food Order:
${foodOrder}

Add-Ons:
${addons || "None"}

Food Allergies:
${foodAllergies || "None"}

Estimated Travel Fee:
$${travelFee}

Special Instructions:
${specialInstructions}

Promotion Code:
${promoCode || "None"}

How did you hear about us?
${hearAboutUs}

Agreed to Cancellation & Weather Policy: ${agreePolicy ? "Agreed" : "Not agreed"}
Agreed to Terms: ${agreeTerms ? "Agreed" : "Not agreed"}
Agreed to Travel Policy: ${agreeTravelPolicy ? "Agreed" : "Not agreed"}
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
Event Address:
${fullEventAddress}

Date: ${date}
Time: ${time}

Phone: ${phone}
Preferred Contact: ${contact}

Adults: ${adults}
Kids: ${kids}

Food Order:
${foodOrder}
Optional Add-Ons:
${addons || "None"}

Food Allergies / Dietary Restrictions:
${foodAllergies || "None"}

Special Instructions:
${specialInstructions}

Promotion Code:
${promoCode || "None"}

Estimated Distance:
${distanceMiles === "Unknown"
  ? "Could not calculate"
  : distanceMiles + " miles"}

Estimated Travel Fee:
$${travelFee}

How did you hear about us?
${hearAboutUs}

Agreement Status:
Cancellation & Weather Policy: ${agreePolicy ? "Agreed" : "Not agreed"}
Terms & Conditions: ${agreeTerms ? "Agreed" : "Not agreed"}
Travel Fee Policy: ${agreeTravelPolicy ? "Agreed" : "Not agreed"}

Please note: This is a booking request, not a final confirmation. We will review availability and contact you shortly.

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