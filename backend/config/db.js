const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/rentals")
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Database Connection Error:", error)
    process.exit(1)
  }
}

module.exports = connectDB
