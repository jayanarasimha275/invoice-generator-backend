const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Business = require("../models/Business");

const calculateTotals = require("../utils/calculateTotals");
const numberToWords = require("../utils/numberToWords");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");

/* =====================================================
   HELPER — ROUND MONEY
===================================================== */

const roundMoney = (value) => {
  return (
    Math.round(
      (Number(value || 0) + Number.EPSILON) * 100
    ) / 100
  );
};

/* =====================================================
   HELPER — NORMALIZE CLIENT
===================================================== */

/* =====================================================
   HELPER — NORMALIZE CLIENT
===================================================== */

const normalizeClient = (client = {}) => {
  const clientBankDetails =
    client.bankDetails || {};

  return {
    id:
      client.id ||
      client._id ||
      "",

    name:
      client.name ||
      client.clientName ||
      "",

    clientName:
      client.clientName ||
      client.name ||
      "",

    companyName:
      client.companyName ||
      "",

    gst:
      client.gst ||
      client.gstNumber ||
      "",

    gstNumber:
      client.gstNumber ||
      client.gst ||
      "",

    email:
      client.email ||
      "",

    phone:
      client.phone ||
      "",

    address:
      client.address ||
      "",

    city:
      client.city ||
      "",

    state:
      client.state ||
      "",

    country:
      client.country ||
      "India",

    zipCode:
      client.zipCode ||
      client.zip ||
      "",

    bankDetails: {
      bankName:
        clientBankDetails.bankName ||
        clientBankDetails.bank ||
        client.bankName ||
        client.bank ||
        "",

      accountName:
        clientBankDetails.accountName ||
        clientBankDetails.accountHolderName ||
        clientBankDetails.accountHolder ||
        client.accountName ||
        client.accountHolderName ||
        client.accountHolder ||
        "",

      accountNumber:
        clientBankDetails.accountNumber ||
        clientBankDetails.accountNo ||
        clientBankDetails.acNo ||
        client.accountNumber ||
        client.accountNo ||
        client.acNo ||
        "",

      ifsc:
        clientBankDetails.ifsc ||
        clientBankDetails.ifscCode ||
        clientBankDetails.IFSC ||
        client.ifsc ||
        client.ifscCode ||
        client.IFSC ||
        "",

      branchName:
        clientBankDetails.branchName ||
        client.branchName ||
        "",
    },
  };
};

/* =====================================================
   HELPER — NORMALIZE SELLER
===================================================== */

const normalizeSeller = (seller = {}) => {
  return {
    id:
      seller.id ||
      seller._id ||
      "",

    name:
      seller.name ||
      seller.businessName ||
      "",

    businessName:
      seller.businessName ||
      seller.name ||
      "",

    gst:
      seller.gst ||
      seller.gstNumber ||
      "",

    gstNumber:
      seller.gstNumber ||
      seller.gst ||
      "",

    email:
      seller.email ||
      "",

    phone:
      seller.phone ||
      "",

    address:
      seller.address ||
      "",

    city:
      seller.city ||
      "",

    state:
      seller.state ||
      "",

    country:
      seller.country ||
      "India",

    zipCode:
      seller.zipCode ||
      seller.zip ||
      "",

    website:
      seller.website ||
      "",

    logo:
      seller.logo ||
      "",

    signature:
      seller.signature ||
      "",

    bankDetails:
      seller.bankDetails ||
      {},
  };
};

/* =====================================================
   HELPER — NORMALIZE BANK DETAILS
===================================================== */

const normalizeBankDetails = (
  bankDetails = {}
) => {
  return {
    bankName:
      bankDetails.bankName ||
      bankDetails.bank ||
      "",

    accountName:
      bankDetails.accountName ||
      bankDetails.accountHolderName ||
      bankDetails.acName ||
      "",

    accountNumber:
      bankDetails.accountNumber ||
      bankDetails.accountNo ||
      bankDetails.acNo ||
      "",

    ifsc:
      bankDetails.ifsc ||
      bankDetails.ifscCode ||
      "",
  };
};

/* =====================================================
   HELPER — GET BUSINESS
===================================================== */

const getInvoiceBusiness = async (
  seller,
  userId
) => {
  const businessId =
    seller?.businessId ||
    seller?.id ||
    seller?._id;

  console.log(
    "SELLER RECEIVED:",
    seller
  );

  console.log(
    "BUSINESS ID RECEIVED:",
    businessId
  );

  if (
    !businessId ||
    !mongoose.Types.ObjectId.isValid(
      String(businessId)
    )
  ) {
    console.log(
      "INVALID OR MISSING BUSINESS ID"
    );

    return null;
  }

  const business =
    await Business.findOne({
      _id: businessId,
      userId,
    });

  console.log(
    "BUSINESS FROM DATABASE:",
    business
  );

  return business;
};

/* =====================================================
   HELPER — BUILD INVOICE SELLER
===================================================== */

const buildInvoiceSeller = async (
  seller,
  userId,
  requestBankDetails = {}
) => {
  const normalizedSeller =
    normalizeSeller(seller);

  const business =
    await getInvoiceBusiness(
      seller,
      userId
    );

  if (!business) {
    const bankDetails =
      normalizeBankDetails(
        requestBankDetails?.bankName ||
        requestBankDetails?.accountName ||
        requestBankDetails?.accountNumber ||
        requestBankDetails?.ifsc
          ? requestBankDetails
          : normalizedSeller.bankDetails
      );

    return {
      seller: {
        ...normalizedSeller,
        bankDetails,
      },

      bankDetails,

      logo:
        normalizedSeller.logo ||
        "",

      signature:
        normalizedSeller.signature ||
        "",
    };
  }

  const businessObject =
    business.toObject();

  const bankDetails =
    normalizeBankDetails(
      businessObject.bankDetails ||
      requestBankDetails ||
      {}
    );

  const invoiceSeller =
    normalizeSeller({
      ...businessObject,

      id:
        businessObject._id?.toString(),

      name:
        businessObject.businessName,

      gst:
        businessObject.gstNumber,

      bankDetails,
    });

  return {
    seller: invoiceSeller,

    bankDetails,

    logo:
      businessObject.logo ||
      normalizedSeller.logo ||
      "",

    signature:
      businessObject.signature ||
      normalizedSeller.signature ||
      "",
  };
};

/* =====================================================
   HELPER — CALCULATE PAYMENT STATUS
===================================================== */

const calculatePaymentStatus = ({
  grandTotal,
  amountPaid,
  dueDate,
  currentStatus,
}) => {
  const total =
    roundMoney(grandTotal);

  const paid =
    roundMoney(amountPaid);

  if (currentStatus === "Draft") {
    return "Draft";
  }

  if (currentStatus === "Cancelled") {
    return "Cancelled";
  }

  if (
    paid >= total &&
    total > 0
  ) {
    return "Paid";
  }

  if (
    paid > 0 &&
    paid < total
  ) {
    return "Partially Paid";
  }

  if (
    dueDate &&
    new Date(dueDate) < new Date()
  ) {
    return "Overdue";
  }

  return "Pending";
};

/* =====================================================
   CREATE INVOICE
===================================================== */

const createInvoice = async (
  req,
  res
) => {
  try {
    const {
      header = {},

      invoiceDate,
      dueDate,

      seller = {},
      client = {},

      shipping = {},

      currency = "INR",

      items = [],

      discount = 0,

      additionalCharges = 0,

      shippingCharges = 0,

      notes = "",

      terms = "",

      status = "Pending",

      recurring = false,

      logo = "",

      signature = "",

      bankDetails = {},

      attachments = [],
    } = req.body;

    console.log(
      "CREATE INVOICE BODY:",
      req.body
    );

    console.log(
      "CREATE INVOICE ITEMS:",
      items
    );

    console.log(
      "CREATE INVOICE CLIENT:",
      client
    );

    console.log(
      "CREATE INVOICE SELLER:",
      seller
    );

    console.log(
      "CREATE INVOICE HEADER:",
      header
    );

    console.log(
      "TOP LEVEL LOGO:",
      logo
    );

    console.log(
      "HEADER LOGO:",
      header?.logo
    );

    console.log(
      "SELLER LOGO:",
      seller?.logo
    );

    console.log(
      "CREATE INVOICE BANK DETAILS:",
      bankDetails
    );

    if (!invoiceDate) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice date is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Due date is required",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message:
          "Items must be an array",
      });
    }

    const validItems =
      items.filter((item) => {
        return (
          item &&
          String(
            item.itemName || ""
          ).trim()
        );
      });

    if (
      status !== "Draft" &&
      validItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one item is required",
      });
    }

    const totals =
      calculateTotals(
        validItems,
        discount,
        additionalCharges,
        shippingCharges
      );

    const grandTotal =
      roundMoney(
        totals.grandTotal
      );

    const invoiceStatus =
      calculatePaymentStatus({
        grandTotal,

        amountPaid: 0,

        dueDate,

        currentStatus: status,
      });

    const businessData =
      await buildInvoiceSeller(
        seller,
        req.user._id,
        bankDetails
      );

    const normalizedClient =
      normalizeClient(client);

    const finalLogo =
      logo ||
      header?.logo ||
      seller?.logo ||
      businessData?.logo ||
      "";

    const finalSignature =
      signature ||
      seller?.signature ||
      businessData?.signature ||
      "";

    console.log(
      "FINAL CLIENT:",
      normalizedClient
    );

    console.log(
      "FINAL BANK DETAILS:",
      businessData.bankDetails
    );

    console.log(
      "FINAL LOGO SAVED:",
      finalLogo
    );

    console.log(
      "FINAL SIGNATURE SAVED:",
      finalSignature
    );

    const invoice =
      await Invoice.create({
        userId:
          req.user._id,

        invoiceNo:
          await generateInvoiceNumber(),

        invoiceDate,

        dueDate,

        seller: {
          ...businessData.seller,

          logo:
            businessData.seller?.logo ||
            finalLogo,

          signature:
            businessData.seller?.signature ||
            finalSignature,
        },

        client:
          normalizedClient,

        shipping,

        currency,

        items:
          totals.items,

        subtotal:
          roundMoney(
            totals.subtotal
          ),

        tax:
          roundMoney(
            totals.tax
          ),

        discount:
          roundMoney(
            totals.discount
          ),

        additionalCharges:
          roundMoney(
            totals.additionalCharges
          ),

        shippingCharges:
          roundMoney(
            totals.shippingCharges
          ),

        grandTotal,

        totalInWords:
          numberToWords(
            grandTotal
          ),

        notes,

        terms,

        recurring,

        logo:
          finalLogo,

        signature:
          finalSignature,

        bankDetails:
          businessData.bankDetails,

        attachments,

        status:
          invoiceStatus,

        payments: [],

        amountPaid: 0,

        balanceDue:
          grandTotal,
      });

    console.log(
      "INVOICE SAVED LOGO:",
      invoice.logo
    );

    console.log(
      "INVOICE SELLER LOGO:",
      invoice.seller?.logo
    );

    return res
      .status(201)
      .json({
        success: true,

        message:
          status === "Draft"
            ? "Invoice Draft Saved Successfully"
            : "Invoice Created Successfully",

        data: invoice,
      });
  } catch (error) {
    console.error(
      "CREATE INVOICE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   GET ALL INVOICES
===================================================== */

const getInvoices = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const {
      search,
      status,
      from,
      to,
    } = req.query;

    const filter = {
      userId:
        req.user._id,
    };

    if (search?.trim()) {
      const safeSearch =
        search
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      filter.$or = [
        {
          invoiceNo: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          "client.name": {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          "client.clientName": {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          "seller.name": {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (from || to) {
      filter.invoiceDate = {};

      if (from) {
        filter.invoiceDate.$gte =
          new Date(from);
      }

      if (to) {
        const endDate =
          new Date(to);

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.invoiceDate.$lte =
          endDate;
      }
    }

    const [
      total,
      invoices,
    ] = await Promise.all([
      Invoice.countDocuments(
        filter
      ),

      Invoice.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),
    ]);

    return res
      .status(200)
      .json({
        success: true,

        page,

        limit,

        totalPages:
          Math.ceil(
            total / limit
          ),

        totalInvoices:
          total,

        count:
          invoices.length,

        data:
          invoices,
      });
  } catch (error) {
    console.error(
      "GET INVOICES ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   GET ONE INVOICE
===================================================== */

const getInvoice = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid Invoice ID",
        });
    }

    const invoice =
      await Invoice.findOne({
        _id:
          req.params.id,

        userId:
          req.user._id,
      });

    if (!invoice) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Invoice Not Found",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: invoice,
      });
  } catch (error) {
    console.error(
      "GET INVOICE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   UPDATE INVOICE
===================================================== */

const updateInvoice = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid Invoice ID",
        });
    }

    const invoice =
      await Invoice.findOne({
        _id:
          req.params.id,

        userId:
          req.user._id,
      });

    if (!invoice) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Invoice Not Found",
        });
    }

    if (
      invoice.status ===
      "Cancelled"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Cancelled invoice cannot be edited",
        });
    }

    const rawItems =
      req.body.items ??
      invoice.items;

    const items =
      Array.from(rawItems).filter(
        (item) =>
          item &&
          String(
            item.itemName || ""
          ).trim()
      );

    const discount =
      req.body.discount ??
      invoice.discount;

    const additionalCharges =
      req.body.additionalCharges ??
      invoice.additionalCharges;

    const shippingCharges =
      req.body.shippingCharges ??
      invoice.shippingCharges;

    const totals =
      calculateTotals(
        items,
        discount,
        additionalCharges,
        shippingCharges
      );

    const grandTotal =
      roundMoney(
        totals.grandTotal
      );

    const amountPaid =
      roundMoney(
        invoice.amountPaid
      );

    if (
      amountPaid >
      grandTotal
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Grand total cannot be less than the amount already paid",
        });
    }

    const dueDate =
      req.body.dueDate ??
      invoice.dueDate;

    const requestedStatus =
      req.body.status ??
      invoice.status;

    const status =
      calculatePaymentStatus({
        grandTotal,

        amountPaid,

        dueDate,

        currentStatus:
          requestedStatus,
      });

    if (req.body.seller) {
      const businessData =
        await buildInvoiceSeller(
          req.body.seller,

          req.user._id,

          req.body.bankDetails ||
            {}
        );

      invoice.seller =
        businessData.seller;

      invoice.bankDetails =
        businessData.bankDetails;

      invoice.logo =
        req.body.logo ||
        req.body.header?.logo ||
        req.body.seller?.logo ||
        businessData.logo ||
        invoice.logo;

      invoice.signature =
        req.body.signature ||
        req.body.seller?.signature ||
        businessData.signature ||
        invoice.signature;
    }

    const updatedLogo =
      req.body.logo ||
      req.body.header?.logo ||
      req.body.seller?.logo ||
      "";

    if (updatedLogo) {
      invoice.logo =
        updatedLogo;

      invoice.seller = {
        ...(invoice.seller || {}),
        logo:
          updatedLogo,
      };
    }

    const updatedSignature =
      req.body.signature ||
      req.body.seller?.signature ||
      "";

    if (updatedSignature) {
      invoice.signature =
        updatedSignature;

      invoice.seller = {
        ...(invoice.seller || {}),
        signature:
          updatedSignature,
      };
    }

    console.log(
      "UPDATE FINAL LOGO:",
      invoice.logo
    );

    console.log(
      "UPDATE SELLER LOGO:",
      invoice.seller?.logo
    );

    if (req.body.client) {
      invoice.client =
        normalizeClient(
          req.body.client
        );
    }

    invoice.invoiceDate =
      req.body.invoiceDate ??
      invoice.invoiceDate;

    invoice.dueDate =
      dueDate;

    invoice.shipping =
      req.body.shipping ??
      invoice.shipping;

    invoice.currency =
      req.body.currency ??
      invoice.currency;

    invoice.items =
      totals.items;

    invoice.subtotal =
      roundMoney(
        totals.subtotal
      );

    invoice.tax =
      roundMoney(
        totals.tax
      );

    invoice.discount =
      roundMoney(
        totals.discount
      );

    invoice.additionalCharges =
      roundMoney(
        totals.additionalCharges
      );

    invoice.shippingCharges =
      roundMoney(
        totals.shippingCharges
      );

    invoice.grandTotal =
      grandTotal;

    invoice.totalInWords =
      numberToWords(
        grandTotal
      );

    invoice.notes =
      req.body.notes ??
      invoice.notes;

    invoice.terms =
      req.body.terms ??
      invoice.terms;

    invoice.recurring =
      req.body.recurring ??
      invoice.recurring;

    invoice.attachments =
      req.body.attachments ??
      invoice.attachments;

    invoice.status =
      status;

    invoice.balanceDue =
      roundMoney(
        grandTotal -
          amountPaid
      );

    if (
      status === "Paid" &&
      !invoice.paidAt
    ) {
      invoice.paidAt =
        new Date();
    }

    if (
      status !== "Paid"
    ) {
      invoice.paidAt =
        null;
    }

    await invoice.save();

    console.log(
      "UPDATED INVOICE LOGO:",
      invoice.logo
    );

    console.log(
      "UPDATED INVOICE SELLER LOGO:",
      invoice.seller?.logo
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Invoice Updated Successfully",

        data:
          invoice,
      });
  } catch (error) {
    console.error(
      "UPDATE INVOICE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   DUPLICATE INVOICE
===================================================== */

const duplicateInvoice = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid Invoice ID",
        });
    }

    const oldInvoice =
      await Invoice.findOne({
        _id:
          req.params.id,

        userId:
          req.user._id,
      });

    if (!oldInvoice) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Invoice Not Found",
        });
    }

    const duplicate =
      oldInvoice.toObject();

    delete duplicate._id;
    delete duplicate.createdAt;
    delete duplicate.updatedAt;
    delete duplicate.__v;

    duplicate.invoiceNo =
      await generateInvoiceNumber();

    duplicate.status =
      "Draft";

    duplicate.invoiceDate =
      new Date();

    duplicate.payments = [];

    duplicate.amountPaid = 0;

    duplicate.balanceDue =
      roundMoney(
        duplicate.grandTotal
      );

    duplicate.paidAt = null;

    duplicate.cancelledAt =
      null;

    duplicate.cancellationReason =
      "";

    const invoice =
      await Invoice.create(
        duplicate
      );

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Invoice Duplicated Successfully",

        data:
          invoice,
      });
  } catch (error) {
    console.error(
      "DUPLICATE INVOICE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   DELETE INVOICE
===================================================== */

const deleteInvoice = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid Invoice ID",
        });
    }

    const invoice =
      await Invoice.findOne({
        _id:
          req.params.id,

        userId:
          req.user._id,
      });

    if (!invoice) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Invoice Not Found",
        });
    }

    if (
      invoice.amountPaid > 0 ||
      invoice.payments.length > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invoice with payment history cannot be deleted",
        });
    }

    await invoice.deleteOne();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Invoice Deleted Successfully",
      });
  } catch (error) {
    console.error(
      "DELETE INVOICE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
};