const mongoose = require("mongoose");

/**
 * Connects to MongoDB Atlas using the URI from environment variables.
 * Exits the process if the connection fails, since the app is useless
 * without a database.
 */
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
