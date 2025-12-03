const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");

const dbConnect = async () => {
    try {
        mongoose.connect(
            `${MONGO_URI}/sih_2025` || `mongodb://localhost:27017/sih_2025`
        );

        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => {
            console.log("Connected to MongoDB");
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = dbConnect;
