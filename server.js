const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const BUSINESS_ADDRESS = "Houston, TX";

function calculateTravelFee(distanceMiles) {

  if (distanceMiles <= 40) return 50;
  if (distanceMiles <= 60) return 75;
  if (distanceMiles <= 80) return 100;
  if (distanceMiles <= 100) return 125;
  if (distanceMiles <= 120) return 150;

  return "Custom Quote";
}

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

    // Google Maps Distance Matrix API
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

    // meters → miles
    const distanceMiles =
      (
        element.distance.value / 1609.34
      ).toFixed(1);

    const travelFee =
      calculateTravelFee(Number(distanceMiles));

    // HERE you can also:
    // send email
    // save to database
    // send SMS

    console.log({
      fullname,
      email,
      phone,
      contact,
      date,
      time,
      address,
      guests,
      distanceMiles,
      travelFee
    });

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});