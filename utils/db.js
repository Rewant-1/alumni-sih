const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");

const dbConnect = async () => {
    try {
        // MONGO_URI already contains the database name (sih_2025)
        // So we use it directly without appending anything
        const connectionString = MONGO_URI || "mongodb://localhost:27017/sih_2025";

        console.log("Connecting to MongoDB...");
        console.log("Database:", connectionString.split('/').pop().split('?')[0]); // Log just the DB name

        await mongoose.connect(connectionString);

        const db = mongoose.connection;

        db.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        db.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        db.once("open", () => {
            console.log("✅ Connected to MongoDB");
            console.log("📦 Database name:", db.name);
        });

    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
};

module.exports = dbConnect;
