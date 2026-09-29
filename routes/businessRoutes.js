const express = require("express");

const {
  createBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} = require("../controllers/businessController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBusiness);

router.get("/", protect, getBusinesses);

router.get("/:id", protect, getBusiness);

router.put("/:id", protect, updateBusiness);

router.delete("/:id", protect, deleteBusiness);

module.exports = router;