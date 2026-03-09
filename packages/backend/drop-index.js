const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            console.log("Connected. Dropping phone_1 index if exists...");
            await mongoose.connection.collection("users").dropIndex("phone_1");
            console.log("Index dropped successfully.");
        } catch (err) {
            console.error(err.message);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
