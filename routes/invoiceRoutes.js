const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
} = require("../controllers/invoiceController");

router.post("/", protect, createInvoice);

router.get("/", protect, getInvoices);

router.get("/:id", protect, getInvoice);

router.put("/:id", protect, updateInvoice);
router.post("/:id/duplicate", protect, duplicateInvoice);
router.delete("/:id", protect, deleteInvoice);

module.exports = router;