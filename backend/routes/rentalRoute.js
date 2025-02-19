const express = require("express")
const Rental = require("../models/rentalModel")
const upload = require("../middleware/upload")
const fs = require("fs")
const xlsx = require("xlsx")
const path = require("path")

const router = express.Router()

// Add
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, address, roomCount, price, description } = req.body
    if (!req.file) return res.status(400).json({ error: "Image is required" })

    const rental = new Rental({
      name,
      address,
      roomCount,
      price,
      description,
      image: `/uploads/${req.file.filename}`,
    })

    await rental.save()
    res.status(201).json(rental)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get All
router.get("/", async (req, res) => {
  try {
    const { page, limit, sort, order, query } = req.query
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    let filter = {}
    if (query) {
      filter.$or = [{ name: { $regex: query, $options: "i" } }, { address: { $regex: query, $options: "i" } }]
    }

    let dbQuery = Rental.find(filter)
    if (sort) {
      const sortOrder = order && order.toLowerCase() === "desc" ? -1 : 1
      dbQuery = dbQuery.sort({ [sort]: sortOrder })
    }

    const total = await Rental.countDocuments(filter)
    const rentals = await dbQuery.skip((pageNumber - 1) * limitNumber).limit(limitNumber)

    res.json({ rentals, total, page: pageNumber, limit: limitNumber })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).json({ message: "Rental not found" })
    res.json(rental)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, address, roomCount, price, description } = req.body
    let updateData = { name, address, roomCount, price, description }

    if (req.file) {
      const rental = await Rental.findById(req.params.id)
      if (rental.image) {
        const oldImagePath = path.join(__dirname, "..", rental.image)
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
      }
      updateData.image = `/uploads/${req.file.filename}`
    }

    const updatedRental = await Rental.findByIdAndUpdate(req.params.id, updateData, { new: true })
    res.json(updatedRental)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).json({ error: "Rental not found" })

    if (rental.image) {
      const imagePath = path.join(__dirname, "..", rental.image)
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
    }

    await Rental.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search
router.get("/search", async (req, res) => {
  try {
    const { query, page = 1, limit = 10, sort, order } = req.query
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    let filter = {
      $or: [{ name: { $regex: query, $options: "i" } }, { address: { $regex: query, $options: "i" } }],
    }

    let dbQuery = Rental.find(filter)

    if (sort) {
      const sortOrder = order && order.toLowerCase() === "desc" ? -1 : 1
      dbQuery = dbQuery.sort({ [sort]: sortOrder })
    }

    const total = await Rental.countDocuments(filter)
    const rentals = await dbQuery.skip((pageNumber - 1) * limitNumber).limit(limitNumber)

    res.json({ rentals, total, page: pageNumber, limit: limitNumber })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export excel file
router.get("/api/rentals/export", async (req, res) => {
  try {
    const rentals = await Rental.find()

    const data = rentals.map((rental) => ({
      ID: rental._id.toString(),
      Name: rental.name,
      Address: rental.address,
      Rooms: rental.roomCount,
      Price: rental.price,
      Description: rental.description,
      Image: rental.image,
    }))

    const worksheet = xlsx.utils.json_to_sheet(data)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Rentals")

    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })

    res.setHeader("Content-Disposition", "attachment; filename=rentals.xlsx")
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    res.send(excelBuffer)
  } catch (error) {
    res.status(500).json({ message: "Error exporting rentals", error: error.message })
  }
})

module.exports = router
