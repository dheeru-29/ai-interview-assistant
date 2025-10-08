require("dotenv").config();
const Replicate = require("replicate");

async function runTest() {
  console.log("Initializing Replicate client...");
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const model = "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0";
  console.log(`Attempting to run model: ${model}`);

  try {
    const output = await replicate.run(model, {
      input: {
        prompt: "Hello, world"
      }
    });
    console.log("\n✅ SUCCESS! The API call worked.");
    console.log("Output:", output.join(""));
  } catch (error) {
    console.error("\n❌ FAILED! The API call returned an error:");
    console.error(error);
  }
}

runTest();