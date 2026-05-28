const express = require("express");
const cors = require("cors");

const app = express();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

//////////////////////////////////////////////////////
// Email Transporter
//////////////////////////////////////////////////////


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
      agreeTravelPolicy,

      paypalOrderID,
      paypalPayerName,
      paypalPayerEmail,
      depositPaid,
      depositAmount
    } = req.body;

    const fullEventAddress =
      `${streetAddress}, ${city}, ${state} ${zipcode}`;

    // SECURITY CHECK: require PayPal deposit before booking email
    if (depositPaid !== "Yes" || !paypalOrderID) {
       return res.json({
        success: false,
        message: "Deposit payment is required before submitting booking."
     });
    }

      
    //////////////////////////////////////////////////////
    // Simple Travel Fee Logic
    //////////////////////////////////////////////////////

    let travelMessage = "Travel fee is $50.";

    if (city !== "Houston") {
      travelMessage =
        "Travel fee will be adjusted based on your location.";
    }

const bookingDetails = `
New hibachi booking request received.

Name: ${fullname}
Email: ${email}
Phone: ${phone}
Preferred Contact: ${contact}

Date: ${date}
Time: ${time}

Event Address:
${fullEventAddress}

Adults: ${adults}
Kids: ${kids}

Food Order:
${foodOrder}

Optional Add-Ons:
${addons || "None"}

Food Allergies / Dietary Restrictions:
${foodAllergies || "None"}

Special Instructions:
${specialInstructions || "None"}

Promotion Code:
${promoCode || "None"}

How did you hear about us?
${hearAboutUs}

Travel Information:
${travelMessage}

Agreement Status:
Cancellation & Weather Policy: ${agreePolicy ? "Agreed" : "Not agreed"}
Terms & Conditions: ${agreeTerms ? "Agreed" : "Not agreed"}
Travel Fee Policy: ${agreeTravelPolicy ? "Agreed" : "Not agreed"}

========================
PAYPAL DEPOSIT INFORMATION
========================

Deposit Paid: ${depositPaid || "No"}
Deposit Amount: ${depositAmount || "N/A"}

PayPal Order ID:
${paypalOrderID || "N/A"}

PayPal Payer Name:
${paypalPayerName || "N/A"}

PayPal Payer Email:
${paypalPayerEmail || "N/A"}

Please note: This is a booking request, not a final confirmation. We will review availability and contact you shortly.

Thank you,
Authentic Hibachi
`;


res.json({
  success: true,
  travelMessage
});

resend.emails.send({
  from: "Authentic Hibachi <booking@authentichibachi.com>",
  to: process.env.OWNER_EMAIL,
  subject: "New Hibachi Booking Request",
  text: bookingDetails
})
.then(() => {
  console.log("Owner email sent successfully via Resend");
})
.catch((err) => {
  console.error("Owner email failed via Resend:", err);
});

resend.emails.send({
  from: "Authentic Hibachi <booking@authentichibachi.com>",
  to: email,
  subject: "We Received Your Booking Request",
  text: `
Hi ${fullname},

Your booking request was submitted successfully.

We will contact you shortly to confirm availability.

Below are your submitted booking details:

${bookingDetails}
`
})
.then(() => {
  console.log("Guest email sent successfully via Resend");
})
.catch((err) => {
  console.error("Guest email failed via Resend:", err);
});


 } catch (err) {

    console.error("Server error:", err);

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