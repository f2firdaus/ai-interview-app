"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
async function testTranscription() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Please provide the path to the audio file.");
        process.exit(1);
    }
    try {
        const formData = new form_data_1.default();
        formData.append("audio", fs_1.default.createReadStream(filePath));
        console.log(`Sending ${filePath} to /api/ai/transcribe...`);
        const response = await (0, node_fetch_1.default)("http://localhost:5000/api/ai/transcribe", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        console.log("Response:", data);
    }
    catch (error) {
        console.error("Error testing transcription:", error);
    }
}
testTranscription();
