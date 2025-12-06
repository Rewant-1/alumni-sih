require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    MONGO_URI,
    PORT,
    JWT_SECRET,
};
