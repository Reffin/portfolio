const router   = require("express").Router();
const Contact  = require("../models/Contact");
const auth     = require("../middleware/auth");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// POST /api/contact - public
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Always save to MongoDB first
    await Contact.create({ name, email, message });

    // Try to send email - but don't fail if it doesn't work
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New message from ${name}`,
        html: `
          <h2>New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thanks for reaching out!",
        html: `
          <h2>Hey ${name}!</h2>
          <p>Thanks for your message. I received it and will get back to you soon!</p>
          <br/>
          <p>— Ryan S. Carbonel</p>
        `,
      });
    } catch (emailErr) {
      // Email failed but message was saved - log it and continue
      console.error("Email error (message still saved):", emailErr.message);
    }

    res.status(201).json({ message: "Message received! I'll get back to you soon." });
  } catch (err) {
    console.error("Contact error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contact - protected
router.get("/", auth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contact/:id/read - protected
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(
      req.params.id, { read: true }, { new: true }
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
