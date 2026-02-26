import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

async function testTranscription() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide the path to the audio file.");
    process.exit(1);
  }

  try {
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(filePath));

    console.log(`Sending ${filePath} to /api/ai/transcribe...`);

    const response = await fetch("http://localhost:5000/api/ai/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Response:", data);

  } catch (error) {
    console.error("Error testing transcription:", error);
  }
}

testTranscription();
