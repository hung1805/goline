const mongoose = require("mongoose")

const rentalSchema = new mongoose.Schema({
  name: String,
  address: String,
  roomCount: Number,
  price: Number,
  image: String,
  description: String,
})

const Rental = mongoose.model("Rental", rentalSchema)

module.exports = Rental
