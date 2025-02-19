const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const rentalRoute = require("./routes/rentalRoute")

const app = express()
const PORT = 5000

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static("uploads"))

app.use("/api/rentals", rentalRoute)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
