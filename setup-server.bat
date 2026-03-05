@echo off
echo Setting up your portfolio server...

:: Create folder structure
mkdir server
mkdir server\models
mkdir server\routes
mkdir server\middleware

:: ── index.js ──────────────────────────────────────────────────
(
echo const express = require("express"^);
echo const cors = require("cors"^);
echo const mongoose = require("mongoose"^);
echo require("dotenv"^).config(^);
echo.
echo const app = express(^);
echo.
echo app.use(cors({ origin: process.env.CLIENT_URL ^|^| "http://localhost:5173" }^)^);
echo app.use(express.json(^)^);
echo.
echo app.use("/api/projects", require("./routes/projects"^)^);
echo app.use("/api/posts",    require("./routes/posts"^)^);
echo app.use("/api/contact",  require("./routes/contact"^)^);
echo.
echo app.get("/api/health", (req, res^) =^> res.json({ status: "ok" }^)^);
echo.
echo app.use((req, res^) =^> res.status(404^).json({ error: "Route not found" }^)^);
echo.
echo app.use((err, req, res, next^) =^> {
echo   console.error(err.stack^);
echo   res.status(500^).json({ error: "Something went wrong" }^);
echo }^);
echo.
echo const PORT = process.env.PORT ^|^| 5000;
echo.
echo mongoose
echo   .connect(process.env.MONGO_URI^)
echo   .then((^) =^> {
echo     console.log("MongoDB connected"^);
echo     app.listen(PORT, (^) =^> console.log("Server running on http://localhost:" + PORT^)^);
echo   }^)
echo   .catch((err^) =^> {
echo     console.error("MongoDB connection failed:", err.message^);
echo     process.exit(1^);
echo   }^);
) > server\index.js

:: ── .env ──────────────────────────────────────────────────────
(
echo PORT=5000
echo MONGO_URI=paste_your_mongodb_uri_here
echo JWT_SECRET=make_up_any_long_random_string_here
echo CLIENT_URL=http://localhost:5173
echo EMAIL_USER=your@gmail.com
echo EMAIL_PASS=your_gmail_app_password
) > server\.env

:: ── package.json ──────────────────────────────────────────────
(
echo {
echo   "name": "portfolio-server",
echo   "version": "1.0.0",
echo   "main": "index.js",
echo   "scripts": {
echo     "start": "node index.js",
echo     "dev": "nodemon index.js"
echo   },
echo   "dependencies": {
echo     "bcryptjs": "^2.4.3",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.4.5",
echo     "express": "^4.18.3",
echo     "jsonwebtoken": "^9.0.2",
echo     "mongoose": "^8.2.1",
echo     "nodemailer": "^6.9.12"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.1.0"
echo   }
echo }
) > server\package.json

:: ── middleware/auth.js ─────────────────────────────────────────
(
echo const jwt = require("jsonwebtoken"^);
echo.
echo module.exports = function auth(req, res, next^) {
echo   const header = req.headers.authorization;
echo   if (!header ^|^| !header.startsWith("Bearer "^)^) {
echo     return res.status(401^).json({ error: "No token, access denied" }^);
echo   }
echo   const token = header.split(" "^)[1];
echo   try {
echo     const decoded = jwt.verify(token, process.env.JWT_SECRET^);
echo     req.user = decoded;
echo     next(^);
echo   } catch (err^) {
echo     res.status(401^).json({ error: "Token invalid or expired" }^);
echo   }
echo };
) > server\middleware\auth.js

:: ── models/Project.js ─────────────────────────────────────────
(
echo const mongoose = require("mongoose"^);
echo.
echo const projectSchema = new mongoose.Schema(
echo   {
echo     title:       { type: String, required: true, trim: true },
echo     description: { type: String, required: true },
echo     tech:        { type: [String], default: [] },
echo     link:        { type: String, default: "" },
echo     github:      { type: String, default: "" },
echo     image:       { type: String, default: "" },
echo     featured:    { type: Boolean, default: false },
echo     order:       { type: Number, default: 0 },
echo   },
echo   { timestamps: true }
echo ^);
echo.
echo module.exports = mongoose.model("Project", projectSchema^);
) > server\models\Project.js

:: ── models/Post.js ────────────────────────────────────────────
(
echo const mongoose = require("mongoose"^);
echo.
echo const postSchema = new mongoose.Schema(
echo   {
echo     title:     { type: String, required: true, trim: true },
echo     slug:      { type: String, required: true, unique: true },
echo     content:   { type: String, required: true },
echo     excerpt:   { type: String, default: "" },
echo     tags:      { type: [String], default: [] },
echo     published: { type: Boolean, default: false },
echo     readTime:  { type: String, default: "" },
echo   },
echo   { timestamps: true }
echo ^);
echo.
echo module.exports = mongoose.model("Post", postSchema^);
) > server\models\Post.js

:: ── models/Contact.js ─────────────────────────────────────────
(
echo const mongoose = require("mongoose"^);
echo.
echo const contactSchema = new mongoose.Schema(
echo   {
echo     name:    { type: String, required: true, trim: true },
echo     email:   { type: String, required: true, trim: true },
echo     message: { type: String, required: true },
echo     read:    { type: Boolean, default: false },
echo   },
echo   { timestamps: true }
echo ^);
echo.
echo module.exports = mongoose.model("Contact", contactSchema^);
) > server\models\Contact.js

:: ── routes/projects.js ────────────────────────────────────────
(
echo const router  = require("express"^).Router(^);
echo const Project = require("../models/Project"^);
echo const auth    = require("../middleware/auth"^);
echo.
echo router.get("/", async (req, res^) =^> {
echo   try {
echo     const projects = await Project.find(^).sort({ order: 1, createdAt: -1 }^);
echo     res.json(projects^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.get("/:id", async (req, res^) =^> {
echo   try {
echo     const project = await Project.findById(req.params.id^);
echo     if (!project^) return res.status(404^).json({ error: "Project not found" }^);
echo     res.json(project^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.post("/", auth, async (req, res^) =^> {
echo   try {
echo     const project = await Project.create(req.body^);
echo     res.status(201^).json(project^);
echo   } catch (err^) { res.status(400^).json({ error: err.message }^); }
echo }^);
echo.
echo router.put("/:id", auth, async (req, res^) =^> {
echo   try {
echo     const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }^);
echo     if (!project^) return res.status(404^).json({ error: "Project not found" }^);
echo     res.json(project^);
echo   } catch (err^) { res.status(400^).json({ error: err.message }^); }
echo }^);
echo.
echo router.delete("/:id", auth, async (req, res^) =^> {
echo   try {
echo     const project = await Project.findByIdAndDelete(req.params.id^);
echo     if (!project^) return res.status(404^).json({ error: "Project not found" }^);
echo     res.json({ message: "Project deleted" }^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo module.exports = router;
) > server\routes\projects.js

:: ── routes/posts.js ───────────────────────────────────────────
(
echo const router = require("express"^).Router(^);
echo const Post   = require("../models/Post"^);
echo const auth   = require("../middleware/auth"^);
echo.
echo router.get("/", async (req, res^) =^> {
echo   try {
echo     const posts = await Post.find({ published: true }^).sort({ createdAt: -1 }^);
echo     res.json(posts^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.get("/:slug", async (req, res^) =^> {
echo   try {
echo     const post = await Post.findOne({ slug: req.params.slug, published: true }^);
echo     if (!post^) return res.status(404^).json({ error: "Post not found" }^);
echo     res.json(post^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.post("/", auth, async (req, res^) =^> {
echo   try {
echo     if (!req.body.slug^) {
echo       req.body.slug = req.body.title.toLowerCase(^).replace(/[^a-z0-9]+/g, "-"^).replace(/(^-^|-$^)/g, ""^);
echo     }
echo     const post = await Post.create(req.body^);
echo     res.status(201^).json(post^);
echo   } catch (err^) { res.status(400^).json({ error: err.message }^); }
echo }^);
echo.
echo router.put("/:id", auth, async (req, res^) =^> {
echo   try {
echo     const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }^);
echo     if (!post^) return res.status(404^).json({ error: "Post not found" }^);
echo     res.json(post^);
echo   } catch (err^) { res.status(400^).json({ error: err.message }^); }
echo }^);
echo.
echo router.delete("/:id", auth, async (req, res^) =^> {
echo   try {
echo     const post = await Post.findByIdAndDelete(req.params.id^);
echo     if (!post^) return res.status(404^).json({ error: "Post not found" }^);
echo     res.json({ message: "Post deleted" }^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo module.exports = router;
) > server\routes\posts.js

:: ── routes/contact.js ─────────────────────────────────────────
(
echo const router  = require("express"^).Router(^);
echo const Contact = require("../models/Contact"^);
echo const auth    = require("../middleware/auth"^);
echo.
echo router.post("/", async (req, res^) =^> {
echo   try {
echo     const { name, email, message } = req.body;
echo     if (!name ^|^| !email ^|^| !message^) {
echo       return res.status(400^).json({ error: "All fields are required" }^);
echo     }
echo     await Contact.create({ name, email, message }^);
echo     res.status(201^).json({ message: "Message received! I will get back to you soon." }^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.get("/", auth, async (req, res^) =^> {
echo   try {
echo     const messages = await Contact.find(^).sort({ createdAt: -1 }^);
echo     res.json(messages^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo router.patch("/:id/read", auth, async (req, res^) =^> {
echo   try {
echo     const msg = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true }^);
echo     if (!msg^) return res.status(404^).json({ error: "Message not found" }^);
echo     res.json(msg^);
echo   } catch (err^) { res.status(500^).json({ error: err.message }^); }
echo }^);
echo.
echo module.exports = router;
) > server\routes\contact.js

echo.
echo All files created! Now running npm install...
cd server
npm install
echo.
echo DONE! Your server is ready.
echo.
echo Next steps:
echo 1. Open server\.env and paste your MongoDB URI
echo 2. Run: npm run dev
echo.
pause
