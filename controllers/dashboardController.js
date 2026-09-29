const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");

const getDashboard = async (req, res) => {
  try {

    const userId = req.user._id;

    const totalInvoices = await Invoice.countDocuments({ userId });

    const totalClients = await Client.countDocuments({ userId });

    const totalProducts = await Product.countDocuments({ userId });

    const paidInvoices = await Invoice.countDocuments({
      userId,
      status: "Paid",
    });

    const pendingInvoices = await Invoice.countDocuments({
      userId,
      status: "Pending",
    });

    const draftInvoices = await Invoice.countDocuments({
      userId,
      status: "Draft",
    });

    const cancelledInvoices = await Invoice.countDocuments({
      userId,
      status: "Cancelled",
    });

    const invoices = await Invoice.find({ userId });

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0
    );

    const recentInvoices = await Invoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlyRevenue = Array(12).fill(0);

    invoices.forEach((invoice) => {
      const month = new Date(invoice.invoiceDate).getMonth();
      monthlyRevenue[month] += invoice.grandTotal;
    });

    res.json({
      success: true,

      summary: {
        totalInvoices,
        totalClients,
        totalProducts,
        paidInvoices,
        pendingInvoices,
        draftInvoices,
        cancelledInvoices,
        totalRevenue,
      },

      monthlyRevenue,

      recentInvoices,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getDashboard,
};