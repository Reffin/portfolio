const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Trust Render's proxy
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/posts",    require("./routes/posts"));
app.use("/api/contact",  require("./routes/contact"));

// ─── Health check ────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ─── Connect DB & Start Server ───────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
