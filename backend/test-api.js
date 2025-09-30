// test-api.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function runTest() {
  try {
    console.log("Attempting to connect to Google AI...");

    // 1. Initialize the client with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Use the standard text-only model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. Send a simple text prompt
    const prompt = "Tell me a short, one-line joke.";
    console.log("Sending prompt to the model...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Print the result if successful
    console.log("\n✅ SUCCESS! The API responded:");
    console.log(text);

  } catch (error) {
    // 5. Print the error if it fails
    console.error("\n❌ FAILED! The API returned an error:");
    console.error(error);
  }
}

runTest();


