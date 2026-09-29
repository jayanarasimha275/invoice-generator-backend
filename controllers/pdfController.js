const Invoice = require("../models/Invoice");
const generatePDF = require("../utils/pdfGenerator");

const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice Not Found",
      });
    }

    generatePDF(invoice, res);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  downloadInvoice,
};