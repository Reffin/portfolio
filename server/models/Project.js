const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tech:        { type: [String], default: [] },
    link:        { type: String, default: "" },
    github:      { type: String, default: "" },
    image:       { type: String, default: "" },
    featured:    { type: Boolean, default: false },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
