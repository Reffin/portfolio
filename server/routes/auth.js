const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const ResetToken = require("../models/ResetToken");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Too many reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

let ADMIN = {
  email: "ryancarbonel1984@gmail.com",
  passwordHash: "$2a$10$.qtAqqMRmTY.2dRYF18bj.oK06NUMgQCL/AdQAnxCfVBHV5Qlho6e",
};

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== ADMIN.email) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, ADMIN.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== ADMIN.email) {
      return res.json({ message: "If that email is registered, you will receive a reset link." });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await ResetToken.create({ token, expiresAt });
    const resetUrl = `${process.env.CLIENT_URL}/#reset-password?token=${token}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ADMIN.email,
        subject: "Portfolio Admin — Password Reset",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. Expires in <strong>1 hour</strong>.</p>
          <br/>
          <a href="${resetUrl}" style="background:#c9a96e;color:#080808;padding:12px 24px;text-decoration:none;font-family:monospace;">Reset Password</a>
          <br/><br/>
          <p style="color:#888;font-size:12px;">If you did not request this, ignore this email.</p>
          <p style="color:#888;font-size:12px;">Link: ${resetUrl}</p>
        `,
      });
    } catch (emailErr) {
      console.error("Reset email error (token still saved):", emailErr.message);
      // Log the reset URL to server logs as fallback
      console.log("Reset URL:", resetUrl);
    }
    res.json({ message: "If that email is registered, you will receive a reset link." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const resetToken = await ResetToken.findOne({ token, used: false });
    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    ADMIN.passwordHash = passwordHash;
    await ResetToken.findByIdAndUpdate(resetToken._id, { used: true });
    res.json({ message: "Password reset successful! You can now log in with your new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
