const mongoose = require("mongoose");

/* =====================================================
   ITEM SCHEMA
===================================================== */

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    rate: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   PAYMENT SCHEMA
===================================================== */

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Bank Transfer",
        "UPI",
        "Card",
        "Cheque",
        "Other",
      ],
      default: "Other",
    },

    reference: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INVOICE SCHEMA
===================================================== */

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

   seller: {
  type: mongoose.Schema.Types.Mixed,
  default: () => ({}),
},

client: {
  type: mongoose.Schema.Types.Mixed,
  default: () => ({}),
},

bankDetails: {
  type: mongoose.Schema.Types.Mixed,
  default: () => ({
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
  }),
},

    shipping: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    items: {
      type: [itemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalInWords: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    terms: {
      type: String,
      default: "",
      trim: true,
    },

    signature: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    attachments: {
      type: [String],
      default: [],
    },

    recurring: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Partially Paid",
        "Paid",
        "Overdue",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    payments: {
      type: [paymentSchema],
      default: [],
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXES
===================================================== */

invoiceSchema.index({
  userId: 1,
  createdAt: -1,
});

invoiceSchema.index({
  userId: 1,
  status: 1,
});

invoiceSchema.index({
  userId: 1,
  invoiceDate: -1,
});

invoiceSchema.index({
  userId: 1,
  dueDate: 1,
});

/* =====================================================
   EXPORT MODEL
===================================================== */

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);