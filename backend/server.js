require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const User = require('./models/userModel.js');
const Analysis = require('./models/analysisModel.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

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
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

app.use('/api/users', userRoutes);
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/analyze/all", protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  let visualSuggestions = [];
  let voiceSuggestions = [];
  
  try {
    const imageFile = req.files.image[0];
    const audioFile = req.files.audio[0];

    if (!imageFile || !audioFile) {
        return res.status(400).json({ error: "Both image and audio files are required." });
    }
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // --- Perform Visual Analysis ---
    try {
        console.log("📤 Sending visual analysis request to Cloudflare...");
        const visualPrompt = `You are a career coach. Analyze the user in the image for a formal interview. Provide a bulleted list of 3-4 concise, constructive suggestions for improvement.
       
        - Address the user directly as "You".
        - Base all feedback ONLY on what is visible in the image. Do not make assumptions.`;
        
        const visualModel = "@cf/llava-hf/llava-1.5-7b-hf";
        const visualUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${visualModel}`;
        const visualPayload = { prompt: visualPrompt, image: [...new Uint8Array(imageFile.buffer)] };
        
        const visualApiResponse = await fetch(visualUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(visualPayload),
        });
        if (!visualApiResponse.ok) throw new Error("Visual API failed");
        const visualData = await visualApiResponse.json();
        visualSuggestions = visualData.result.description.split('- ').map(s => s.trim().replace(/\n/g, '')).filter(s => s);
        console.log("📥 Received visual analysis response.");
    } catch(visualError) {
        console.error("⚠️ Error in visual analysis:", visualError.message);
        visualSuggestions = ["The AI failed to analyze the image. Please try again with better lighting."];
    }

    // --- Perform Voice Analysis ---
    try {
        console.log("📤 Sending audio for transcription to Cloudflare...");
        const whisperResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': audioFile.mimetype },
            body: audioFile.buffer,
        });
        if (!whisperResponse.ok) throw new Error("Whisper API failed");
        const transcriptData = await whisperResponse.json();
        const transcript = transcriptData.result.text || "No speech detected.";
        console.log("📥 Received transcript.");

        if (!transcript || transcript.toLowerCase() === "no speech detected.") {
            voiceSuggestions = ["No speech was detected in the audio."];
        } else {
            const voicePrompt = `You are a career coach. Analyze the following transcript from a practice interview.
            TRANSCRIPT: "${transcript}"
            Provide a bulleted list of 2-3 concise suggestions for improvement on clarity, confidence, and filler words.
            
            - Address the user directly as "You".`;

            const llamaResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: voicePrompt }),
            });
            if (!llamaResponse.ok) throw new Error("Llama API failed");
            const llamaData = await llamaResponse.json();
            voiceSuggestions = llamaData.result.response.split('- ').map(s => s.trim().replace(/\n/g, '')).filter(s => s);
            console.log("📥 Received voice analysis.");
        }
    } catch (voiceError) {
        console.error("⚠️ Error in voice analysis:", voiceError.message);
        voiceSuggestions = ["The AI failed to analyze the audio."];
    }

    // --- Save and Send Combined Result ---
    const imageBase64 = imageFile.buffer.toString('base64');
    await Analysis.create({
      user: req.user._id,
      image: imageBase64,
      visualFeedback: visualSuggestions,
      voiceFeedback: voiceSuggestions,
    });
    console.log('✅ Combined analysis saved to database for user:', req.user.name);

    res.json({
      visualFeedback: visualSuggestions,
      voiceFeedback: voiceSuggestions,
    });

  } catch (error) {
    console.error("❌ Major error in combined analysis:", error);
    res.status(500).json({ error: "Failed to process analysis." });
  }
});

app.get("/api/analyses/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});