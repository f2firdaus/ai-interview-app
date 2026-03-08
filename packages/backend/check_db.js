"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = "mongodb+srv://firdausnaseem_db_user:ViFhQonpPX5CN5Wz@cluster0.9jqafor.mongodb.net/?appName=Cluster0";
async function checkDb() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log("Connected to MongoDB.");
    const db = mongoose_1.default.connection.db;
    if (!db) {
        console.log("No DB connected.");
        process.exit(1);
    }
    const user = await db.collection("users").findOne({ phone: "1234567890" });
    console.log("User record found:", user);
    process.exit(0);
}
checkDb().catch(console.error);
