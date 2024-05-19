const express = require("express");
const bodyParser = require("body-parser");
const shortid = require("shortid");

const app = express();
const PORT = process.env.PORT || 3010;

// In-memory storage for URL mappings and statistics
const urlMap = {};
const urlStats = {};

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Endpoint to shorten URL
app.post("/shorten", (req, res) => {
  const { longUrl } = req.body;

  // Validate URL
  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Generate short URL
  const shortUrl = shortid.generate();

  // Store URL mapping
  urlMap[shortUrl] = longUrl;
  urlStats[shortUrl] = { visits: 0, lastAccessed: null };

  res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortUrl}` });
});

// Endpoint to redirect short URL
app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;

  // Check if short URL exists
  if (!urlMap[shortUrl]) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // Update URL statistics
  urlStats[shortUrl].visits++;
  urlStats[shortUrl].lastAccessed = new Date();

  // Redirect to long URL
  res.redirect(301, urlMap[shortUrl]);
});

// Endpoint to get URL statistics
app.get("/stats/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;

  // Check if short URL exists
  if (!urlStats[shortUrl]) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.json({
    shortUrl,
    visits: urlStats[shortUrl].visits,
    lastAccessed: urlStats[shortUrl].lastAccessed,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
