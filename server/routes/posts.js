const router = require("express").Router();
const Post   = require("../models/Post");
const auth   = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    if (!req.body.slug) {
      req.body.slug = req.body.title.toLowerCase().replace(/[a-z0-9]+/g, "-").replace(/(-|-$)/g, "");
    }
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
