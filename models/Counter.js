const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    sequence: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Counter", counterSchema);