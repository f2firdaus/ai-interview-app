import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://firdausnaseem_db_user:ViFhQonpPX5CN5Wz@cluster0.9jqafor.mongodb.net/?appName=Cluster0";

async function checkDb() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");
  
  const db = mongoose.connection.db;
  if (!db) {
    console.log("No DB connected.");
    process.exit(1);
  }

  const user = await db.collection("users").findOne({ phone: "1234567890" });
  console.log("User record found:", user);

  process.exit(0);
}

checkDb().catch(console.error);
