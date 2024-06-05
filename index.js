import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import qr from "qr-image";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Serve the HTML form
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle form submission and generate QR code
app.post("/submit", (req, res) => {
  const url = req.body["URL"];
  if (!url) {
    return res.status(400).send("URL is required");
  }

  // Generate QR code
  const qrSvg = qr.image(url, { type: 'png' });
  const qrCodePath = `${__dirname}/qr.png`;
  qrSvg.pipe(fs.createWriteStream(qrCodePath).on('finish', () => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code</title>
      </head>
      <body>
        <h1>QR Code for: ${url}</h1>
        <img src="/qr.png" alt="QR Code" />
        <br><br>
        <a href="/">Generate another QR code</a>
      </body>
      </html>
    `);
  }).on('error', (err) => {
    res.status(500).send('Error generating QR code');
  }));
});

app.get("/qr.png", (req, res) => {
  res.sendFile(`${__dirname}/qr.png`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
