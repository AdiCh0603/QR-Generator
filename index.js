import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

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
  // else if(!url.startsWith("https://www.")){
  //   return res.status(400).send("Pls enter valid URL");
  // }

  // Generate QR code
  const qrSvg = qr.image(url, { type: 'png' });
  const qrCodePath = `${__dirname}/qr.png`;
  qrSvg.pipe(fs.createWriteStream(qrCodePath));

  // Send the generated QR code back to the client
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
});


app.get("/qr.png", (req, res) => {
  res.sendFile(`${__dirname}/qr.png`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
