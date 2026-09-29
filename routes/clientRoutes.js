const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

// Create Client
router.post("/", protect, createClient);

// Get All Clients
router.get("/", protect, getClients);

// Get Single Client
router.get("/:id", protect, getClient);

// Update Client
router.put("/:id", protect, updateClient);

// Delete Client
router.delete("/:id", protect, deleteClient);

module.exports = router;