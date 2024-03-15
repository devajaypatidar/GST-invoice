const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios"); 
const taxSlabRates = require("./taxSlabRates");

admin.initializeApp();

exports.processBooking = functions.firestore
    .document("bookings/{bookingId}")
    .onUpdate(async (change, context) => {
      try {
        const newData = change.after.data();
        if (newData.status == "Finished") {
          const {name, totalBookingAmount, category, isInterState} = newData;
          const taxSlab = taxSlabRates[category];
          const {CGST, SGST, IGST} = calculateGST(
              totalBookingAmount,
              taxSlab,
              isInterState,
          );
          let totalGST = 0;
          if (IGST) {
            totalGST = IGST;
          } else {
            totalGST = CGST + SGST;
          }
          const gstApiResponse = await submitGST(name, totalGST);
          console.log("GST API Response:", gstApiResponse);
          return {message: "GST Filing process completed successfully"};
        }
      } catch (error) {
        console.error("Error processing booking:", error);
        return {error: "An error occurred while processing the booking."};
      }
    });

// Function to calculate GST
function calculateGST(totalBookingAmount, taxSlab, isInterState) {
  let igstAmount = 0;
  let sgstAmount = 0;
  let cgstAmount = 0;
  if (isInterState) {
    igstAmount = totalBookingAmount * (taxSlab / 100);
  } else {
    cgstAmount = totalBookingAmount * (taxSlab / 2 / 100); 
    sgstAmount = cgstAmount;
  }
  return {cgstAmount, sgstAmount, igstAmount};
}

// GST filing function
async function submitGST(name, gstAmount) {
  const apiEndpoint = "http://localhost:3000/gst/filing";
  const apiKey = "2121212";
  try {
    const response = await axios.post(apiEndpoint, {
      name: name,
      gstAmount: gstAmount,
      apiKey: apiKey,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to submit GST to API: ${error.message}`);
  }
}

