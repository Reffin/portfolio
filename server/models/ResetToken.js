const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ResetToken", resetTokenSchema);
