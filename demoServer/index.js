const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint to handle GST filing
app.post("/gst/filing", (req, res) => {
  const { name, gstAmount, apiKey } = req.body;

  
  if (apiKey !== "2121212") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dataToWrite = `Name: ${name}, GST Amount: ${gstAmount}\n`;

  fs.appendFile("gst_requests.log", dataToWrite, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }

    console.log("Data added to file");
  });

  const responseData = {
    success: true,
    message: `GST filed successfully for ${name} with amount ${gstAmount}`,
  };

  return res.json(responseData);
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
