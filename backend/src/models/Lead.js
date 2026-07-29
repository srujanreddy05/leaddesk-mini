const mongoose = require("mongoose");

const BUDGET_OPTIONS = ["Under $1k", "$1k-5k", "$5k-20k", "$20k+"];
const STATUS_OPTIONS = ["New", "Contacted", "Closed"];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be under 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    budget: {
      type: String,
      required: [true, "Budget range is required"],
      enum: {
        values: BUDGET_OPTIONS,
        message: "Budget must be one of: " + BUDGET_OPTIONS.join(", "),
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message must be under 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: STATUS_OPTIONS,
        message: "Status must be one of: " + STATUS_OPTIONS.join(", "),
      },
      default: "New",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Speeds up the admin search-by-name/email query.
leadSchema.index({ name: "text", email: "text" });

module.exports = mongoose.model("Lead", leadSchema);
module.exports.BUDGET_OPTIONS = BUDGET_OPTIONS;
module.exports.STATUS_OPTIONS = STATUS_OPTIONS;
