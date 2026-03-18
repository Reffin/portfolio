const router   = require("express").Router();
const Contact  = require("../models/Contact");
const auth     = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const Brevo = require("@getbrevo/brevo");

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many messages sent. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function sendEmail(to, subject, html) {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

  const email = new Brevo.SendSmtpEmail();
  email.sender = { name: "Ryan S. Carbonel Portfolio", email: "ryancarbonel1984@gmail.com" };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;

  return apiInstance.sendTransacEmail(email);
}

function sanitize(str) {
  return String(str).trim().replace(/[<>]/g, "");
}

// POST /api/contact - public
router.post("/", contactLimiter, async (req, res) => {
  try {
    const name    = sanitize(req.body.name || "");
    const email   = sanitize(req.body.email || "");
    const message = sanitize(req.body.message || "");

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return res.status(400).json({ error: "Input too long" });
    }

    await Contact.create({ name, email, message });

    try {
      await sendEmail(
        process.env.ADMIN_EMAIL || "ryancarbonel1984@gmail.com",
        `New message from ${name}`,
        `
          <h2>New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      );
      await sendEmail(
        email,
        "Thanks for reaching out!",
        `
          <h2>Hey ${name}!</h2>
          <p>Thanks for your message. I received it and will get back to you soon!</p>
          <br/>
          <p>— Ryan S. Carbonel</p>
        `
      );
    } catch (emailErr) {
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
