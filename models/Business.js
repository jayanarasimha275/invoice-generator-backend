const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    legalName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    zipCode: {
      type: String,
      default: "",
      trim: true,
    },

    gstNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    panNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    signature: {
      type: String,
      default: "",
    },

    bankDetails: {
      accountHolderName: {
        type: String,
        default: "",
        trim: true,
      },

      bankName: {
        type: String,
        default: "",
        trim: true,
      },

      accountNumber: {
        type: String,
        default: "",
        trim: true,
      },

      ifscCode: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },

      branchName: {
        type: String,
        default: "",
        trim: true,
      },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({
  userId: 1,
  createdAt: -1,
});

businessSchema.index({
  userId: 1,
  businessName: 1,
});

module.exports = mongoose.model(
  "Business",
  businessSchema
);