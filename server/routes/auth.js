const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ADMIN = {
  email: "ryancarbonel1984@gmail.com",
  passwordHash: "$2a$10$KbJYEGZuxo5MLvThFDbcWOf6nXc6Dn5SSwmia4/BbBzCs9zhbdj9q",
};

router.post("/login", async (req, res) => {
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

module.exports = router;