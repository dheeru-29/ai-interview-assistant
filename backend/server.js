// server.js (Complete and Final Version)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const User = require('./models/userModel.js');
const Analysis = require('./models/analysisModel.js');
const userRoutes = require('./routes/userRoutes.js');

// --- Initialize App & Middleware ---
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// --- Security Middleware to Protect Routes ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// --- API Routes ---
app.use('/api/users', userRoutes); // User registration and login routes

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AI Analysis Route - now protected and saves to DB
app.post("/api/analyze", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const prompt = `You are a very strict career coach. Your task is to evaluate a user's appearance for a formal software engineering interview based on a checklist.

**YOUR INSTRUCTIONS:**
1. Go through each item in the **INTERVIEW CHECKLIST** below.
2. For each item, briefly state your observation from the image.
3. After making all your observations, provide a final, summary bulleted list of suggestions for improvement. Address the user directly as "You" or "Your".

**INTERVIEW CHECKLIST:**
Attire: (Observation: Is the user wearing professional attire like a collared shirt, or casual attire like a t-shirt/cap?)
Grooming: (Observation: Is the user's hair and facial hair neat?)
Posture: (Observation: Is the user sitting up straight or slouching?)
Eye Contact: (Observation: Is the user looking towards the camera?)
Framing:(Observation: Is the camera at eye-level and the user well-centered?)
Background: (Observation: Is the background clean or cluttered?)
Lighting:(Observation: Is the lighting good and from the front?)

**CRITICAL RULE:** Base every observation *only* on what is visible in the image. Do not make assumptions.
`;
    
    const imageBuffer = req.file.buffer;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    const model = "@cf/llava-hf/llava-1.5-7b-hf";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    const payload = {
      prompt,
      image: [...new Uint8Array(imageBuffer)],
    };

    console.log("📤 Sending request directly to Cloudflare API...");

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Cloudflare API error: ${apiResponse.status} ${errorText}`);
    }
    
    const responseData = await apiResponse.json();
    console.log("📥 Received response from Cloudflare AI.");
    
    const suggestions = responseData.result.description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // --- Save the result to the database ---
    const imageBase64 = imageBuffer.toString('base64');
    await Analysis.create({
      user: req.user._id, // Link to the logged-in user from the 'protect' middleware
      image: imageBase64,
      suggestions: suggestions,
    });
    console.log('✅ Analysis saved to database for user:', req.user.name);
    
    res.json({ suggestions });

  } catch (error) {
    console.error("❌ Error analyzing image:", error);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

// Add this new route to backend/server.js

// @desc    Get user's analysis history
// @route   GET /api/analyses/history
app.get("/api/analyses/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});



// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});