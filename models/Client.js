const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    zipCode: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Client", clientSchema);