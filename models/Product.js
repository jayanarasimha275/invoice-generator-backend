const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);