import { useState, useEffect, useRef } from "react";

const BASE_URL = "https://portfolio-server-l1uk.onrender.com/api";

// ── API helpers ───────────────────────────────────────────────
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  return res.json();
}

async function getPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  return res.json();
}

async function getMessages(token) {
  const res = await fetch(`${BASE_URL}/contact`, { headers: authHeaders(token) });
  return res.json();
}

async function sendContact(data) {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

async function createProject(data, token) {
  const res = await fetch(`${BASE_URL}/projects`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

async function updateProject(id, data, token) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

async function deleteProject(id, token) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
}

async function createPost(data, token) {
  const res = await fetch(`${BASE_URL}/posts`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

async function updatePost(id, data, token) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

async function deletePost(id, token) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
}

// ── Fallback data ─────────────────────────────────────────────
const FALLBACK_PROJECTS = [
  { _id: "f1", title: "E-Commerce App", tech: ["React", "Node.js", "MongoDB"], description: "Full stack store with cart, auth, and payments." },
  { _id: "f2", title: "Weather Dashboard", tech: ["React", "API"], description: "Real-time weather with beautiful data visualizations." },
  { _id: "f3", title: "Task Manager", tech: ["Node.js", "Express", "PostgreSQL"], description: "Productivity app with drag-and-drop task boards." },
];

const FALLBACK_POSTS = [
  { _id: "p1", title: "How I Built My First Full Stack App", createdAt: "2026-02-12", readTime: "5 min" },
  { _id: "p2", title: "Why I Chose React Over Vue", createdAt: "2026-01-28", readTime: "4 min" },
  { _id: "p3", title: "MongoDB vs PostgreSQL: My Take", createdAt: "2026-01-10", readTime: "6 min" },
];

const NAV_LINKS = ["about", "projects", "blog", "contact"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #c9a96e33; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #080808; } ::-webkit-scrollbar-thumb { background: #c9a96e55; border-radius: 2px; }
  .serif { font-family: 'Cormorant Garamond', serif; }
  .mono { font-family: 'DM Mono', monospace; }
  .gold { color: #c9a96e; }
  a { color: inherit; text-decoration: none; }
  .project-card { border: 1px solid #1e1e1e; padding: 2rem; transition: border-color 0.3s, background 0.3s; }
  .project-card:hover { border-color: #c9a96e55; background: #0f0f0f; }
  .blog-card { border-bottom: 1px solid #1a1a1a; padding: 1.5rem 0; transition: padding-left 0.3s; cursor: pointer; }
  .blog-card:hover { padding-left: 1rem; }
  .btn { background: transparent; border: 1px solid #c9a96e; color: #c9a96e; padding: 0.7rem 2rem; font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.15em; cursor: pointer; transition: background 0.3s, color 0.3s; }
  .btn:hover { background: #c9a96e; color: #080808; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-sm { padding: 0.4rem 1rem; font-size: 0.65rem; }
  .btn-danger { border-color: #e05555; color: #e05555; }
  .btn-danger:hover { background: #e05555; color: #fff; }
  .input { background: #0f0f0f; border: 1px solid #222; color: #e8e0d5; padding: 0.8rem 1rem; font-family: 'DM Mono', monospace; font-size: 0.85rem; width: 100%; outline: none; transition: border-color 0.3s; }
  .input:focus { border-color: #c9a96e55; }
  .tag { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; border: 1px solid #2a2a2a; padding: 0.2rem 0.6rem; color: #888; }
  .skeleton { background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .admin-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #1a1a1a; transition: background 0.2s; }
  .admin-row:hover { background: #0f0f0f; }
  .modal-overlay { position: fixed; inset: 0; background: #000000cc; z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .modal { background: #0f0f0f; border: 1px solid #222; padding: 2rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .desktop-nav { display: flex !important; }
  .hamburger-btn { display: none !important; }
  @media (max-width: 640px) {
    .desktop-nav { display: none !important; }
    .hamburger-btn { display: flex !important; width: auto !important; }
    .about-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
  }
`;

// ── Hooks ─────────────────────────────────────────────────────
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function Section({ id, children, style }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <section id={id} ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease", ...style }}>
      {children}
    </section>
  );
}

// ── Login Page ────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await login(form.email, form.password);
      localStorage.setItem("admin_token", token);
      onLogin(token);
    } catch {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>Admin Access</p>
        <h1 className="serif" style={{ fontSize: "2.5rem", fontWeight: 300, marginBottom: "2rem" }}>Sign In</h1>
        {error && <p className="mono" style={{ color: "#e05555", fontSize: "0.75rem", marginBottom: "1rem", padding: "0.75rem", border: "1px solid #e0555533" }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              onMouseEnter={() => setShowPassword(true)}
              onMouseLeave={() => setShowPassword(false)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: "1rem", padding: "0.25rem" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button className="btn" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}

// ── Project Modal ─────────────────────────────────────────────
function ProjectModal({ project, token, onSave, onClose }) {
  const [form, setForm] = useState(project || { title: "", description: "", tech: "", link: "", github: "", featured: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, tech: typeof form.tech === "string" ? form.tech.split(",").map(t => t.trim()).filter(Boolean) : form.tech };
      if (project?._id && !project._id.startsWith("f")) {
        await updateProject(project._id, data, token);
      } else {
        await createProject(data, token);
      }
      onSave();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "1.5rem" }}>{project ? "EDIT PROJECT" : "NEW PROJECT"}</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Description *" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <input className="input" placeholder="Tech stack (comma separated: React, Node.js)" value={Array.isArray(form.tech) ? form.tech.join(", ") : form.tech} onChange={e => setForm({ ...form, tech: e.target.value })} />
          <input className="input" placeholder="Live URL" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
          <input className="input" placeholder="GitHub URL" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
          <label className="mono" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#888", fontSize: "0.75rem", cursor: "pointer" }}>
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
            Featured project
          </label>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Save Project"}</button>
            <button className="btn" type="button" onClick={onClose} style={{ borderColor: "#333", color: "#666" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Post Modal ────────────────────────────────────────────────
function PostModal({ post, token, onSave, onClose }) {
  const [form, setForm] = useState(post || { title: "", content: "", excerpt: "", tags: "", readTime: "", published: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags };
      if (post?._id && !post._id.startsWith("p")) {
        await updatePost(post._id, data, token);
      } else {
        await createPost(data, token);
      }
      onSave();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "1.5rem" }}>{post ? "EDIT POST" : "NEW POST"}</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Content *" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <textarea className="input" placeholder="Excerpt (short preview)" rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
          <input className="input" placeholder="Tags (comma separated)" value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <input className="input" placeholder="Read time (e.g. 5 min)" value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} />
          <label className="mono" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#888", fontSize: "0.75rem", cursor: "pointer" }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            Published (visible on portfolio)
          </label>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Save Post"}</button>
            <button className="btn" type="button" onClick={onClose} style={{ borderColor: "#333", color: "#666" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectModal, setProjectModal] = useState(false);
  const [postModal, setPostModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, b, m] = await Promise.all([getProjects(), getPosts(), getMessages(token)]);
      setProjects(Array.isArray(p) ? p : []);
      setPosts(Array.isArray(b) ? b : []);
      setMessages(Array.isArray(m) ? m : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(id, token);
    fetchAll();
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await deletePost(id, token);
    fetchAll();
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e8e0d5" }}>
      {projectModal && <ProjectModal project={projectModal === true ? null : projectModal} token={token} onSave={() => { setProjectModal(false); fetchAll(); }} onClose={() => setProjectModal(false)} />}
      {postModal && <PostModal post={postModal === true ? null : postModal} token={token} onSave={() => { setPostModal(false); fetchAll(); }} onClose={() => setPostModal(false)} />}

      {/* Header */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="serif gold" style={{ fontSize: "1.3rem", fontWeight: 300 }}>Admin</span>
          <span className="mono" style={{ color: "#444", fontSize: "0.65rem", marginLeft: "1rem" }}>Portfolio Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/" className="mono" style={{ color: "#555", fontSize: "0.7rem" }}>← View Site</a>
          <button className="btn btn-sm" onClick={onLogout} style={{ borderColor: "#333", color: "#666" }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 2rem", borderBottom: "1px solid #1a1a1a", display: "flex" }}>
        {["projects", "posts", "messages"].map(t => (
          <button key={t} onClick={() => setTab(t)} className="mono" style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #c9a96e" : "2px solid transparent", color: tab === t ? "#c9a96e" : "#555", padding: "1rem 1.5rem", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.2s" }}>
            {t}{t === "messages" && unread > 0 && <span style={{ background: "#c9a96e", color: "#080808", borderRadius: "50%", padding: "0.1rem 0.4rem", fontSize: "0.6rem", marginLeft: "0.4rem" }}>{unread}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        {loading ? (
          <p className="mono" style={{ color: "#444", fontSize: "0.75rem", textAlign: "center", padding: "4rem" }}>Loading...</p>
        ) : (
          <>
            {tab === "projects" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 300 }}>Projects <span style={{ color: "#444", fontSize: "1rem" }}>({projects.length})</span></h2>
                  <button className="btn btn-sm" onClick={() => setProjectModal(true)}>+ New Project</button>
                </div>
                <div style={{ border: "1px solid #1a1a1a" }}>
                  {projects.length === 0 ? (
                    <p className="mono" style={{ color: "#444", padding: "2rem", fontSize: "0.75rem", textAlign: "center" }}>No projects yet. Add your first one!</p>
                  ) : projects.map(p => (
                    <div key={p._id} className="admin-row">
                      <div>
                        <p className="serif" style={{ fontSize: "1.1rem" }}>{p.title}</p>
                        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                          {p.tech?.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-sm" onClick={() => setProjectModal(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProject(p._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "posts" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 300 }}>Blog Posts <span style={{ color: "#444", fontSize: "1rem" }}>({posts.length})</span></h2>
                  <button className="btn btn-sm" onClick={() => setPostModal(true)}>+ New Post</button>
                </div>
                <div style={{ border: "1px solid #1a1a1a" }}>
                  {posts.length === 0 ? (
                    <p className="mono" style={{ color: "#444", padding: "2rem", fontSize: "0.75rem", textAlign: "center" }}>No posts yet. Write your first one!</p>
                  ) : posts.map(p => (
                    <div key={p._id} className="admin-row">
                      <div>
                        <p className="serif" style={{ fontSize: "1.1rem" }}>{p.title}</p>
                        <p className="mono" style={{ color: "#555", fontSize: "0.65rem", marginTop: "0.3rem" }}>
                          {p.published ? <span style={{ color: "#6ec9a9" }}>● Published</span> : <span style={{ color: "#888" }}>○ Draft</span>}
                          {" · "}{new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-sm" onClick={() => setPostModal(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(p._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "messages" && (
              <div>
                <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>Messages <span style={{ color: "#444", fontSize: "1rem" }}>({messages.length})</span></h2>
                <div style={{ border: "1px solid #1a1a1a" }}>
                  {messages.length === 0 ? (
                    <p className="mono" style={{ color: "#444", padding: "2rem", fontSize: "0.75rem", textAlign: "center" }}>No messages yet.</p>
                  ) : messages.map(m => (
                    <div key={m._id} className="admin-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", opacity: m.read ? 0.5 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <div>
                          <span className="serif" style={{ fontSize: "1.1rem" }}>{m.name}</span>
                          <span className="mono" style={{ color: "#555", fontSize: "0.7rem", marginLeft: "0.75rem" }}>{m.email}</span>
                        </div>
                        <span className="mono" style={{ color: "#444", fontSize: "0.65rem" }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mono" style={{ color: "#888", fontSize: "0.78rem", lineHeight: 1.7 }}>{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Portfolio ─────────────────────────────────────────────────
function Portfolio() {
  const [activeNav, setActiveNav] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    getProjects().then(data => { if (data?.length > 0) setProjects(data); }).catch(() => {}).finally(() => setLoadingProjects(false));
    getPosts().then(data => { if (data?.length > 0) setPosts(data); }).catch(() => {}).finally(() => setLoadingPosts(false));
  }, []);

  useEffect(() => {
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      for (const id of NAV_LINKS) {
        const el = document.getElementById(id);
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= 120 && r.bottom >= 120) { setActiveNav(id); break; } }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendContact(form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch { alert("Failed to send. Please try again."); }
    finally { setSending(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div style={{ background: "#080808", color: "#e8e0d5", fontFamily: "'Georgia', serif", minHeight: "100vh", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999, mixBlendMode: "difference", transform: `translate(${cursor.x - 16}px, ${cursor.y - 16}px)` }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #c9a96e", opacity: 0.6 }} />
      </div>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080808ee", backdropFilter: "blur(4px)", borderBottom: "1px solid #111" }}>
        <span className="serif gold" style={{ fontSize: "1.2rem", fontWeight: 300, whiteSpace: "nowrap" }}>Ryan S. Carbonel.</span>

        {/* Desktop menu */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "nowrap" }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => scrollTo(l)} style={{ background: "none", border: "none", color: activeNav === l ? "#c9a96e" : "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.3s", whiteSpace: "nowrap" }}>{l}</button>
          ))}

        </div>

        {/* Hamburger button - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger-btn"
          style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", width: "auto", alignSelf: "center" }}
        >
          <span style={{ display: "block", width: 22, height: 1.5, background: menuOpen ? "#c9a96e" : "#888", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: menuOpen ? "#c9a96e" : "#888", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: menuOpen ? "#c9a96e" : "#888", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#080808f5", zIndex: 99, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "2rem" }} onClick={() => setMenuOpen(false)}>
            <span className="serif gold" style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "1rem" }}>Ryan S. Carbonel.</span>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => { scrollTo(l); setMenuOpen(false); }} style={{ background: "none", border: "none", color: activeNav === l ? "#c9a96e" : "#888", fontFamily: "'DM Mono', monospace", fontSize: "1rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", textAlign: "center", padding: "0.5rem 0" }}>{l}</button>
            ))}
          </div>
        )}
      </nav>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "8rem 3rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 79px, #ffffff05 80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #c9a96e08 0%, transparent 70%)", pointerEvents: "none" }} />
        <p className="mono gold" style={{ fontSize: "0.7rem", letterSpacing: "0.3em", marginBottom: "1.5rem", textTransform: "uppercase" }}>— Full Stack Developer</p>
        <h1 className="serif" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", fontWeight: 300, lineHeight: 1.05, marginBottom: "2rem", maxWidth: 800 }}>
          Hi, I'm Ryan<br /><em style={{ fontStyle: "italic", color: "#c9a96e" }}>S. Carbonel.</em>
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", color: "#555", fontSize: "0.85rem", maxWidth: 500, lineHeight: 1.8, marginBottom: "3rem" }}>
          Tech-savvy innovator with hands-on experience in emerging technologies and a passion for continuous improvement.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn" onClick={() => scrollTo("projects")}>View Work</button>
          <button className="btn" onClick={() => scrollTo("contact")} style={{ borderColor: "#333", color: "#888" }}>Say Hello →</button>
        </div>
        <div className="mono" style={{ position: "absolute", bottom: "3rem", right: "3rem", fontSize: "0.65rem", color: "#333" }}>SCROLL ↓</div>
      </div>

      <Section id="about" style={{ padding: "8rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "start" }}>
          <div>
            <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>01 / About</p>
            <div style={{ width: 40, height: 1, background: "#c9a96e", marginBottom: "2rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML & CSS", "REST APIs", "Git", "Vite"].map(s => (
                <span key={s} className="tag" style={{ width: "fit-content" }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300, marginBottom: "2rem", lineHeight: 1.2 }}>
              I build <em className="gold">meaningful</em> digital experiences.
            </h2>
            <p style={{ color: "#888", lineHeight: 2, fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
              Tech-savvy innovator with hands-on experience in emerging technologies and passion for continuous improvement. Skilled in identifying opportunities for technological enhancements and implementing effective solutions.
            </p>
            <p style={{ color: "#666", lineHeight: 2, fontFamily: "'DM Mono', monospace", fontSize: "0.82rem" }}>
              Adept at leveraging new tools and methods to solve problems and enhance productivity. Excels in adapting to fast-paced environments and driving technological advancements. Currently open to exciting opportunities.
            </p>
          </div>
        </div>
      </Section>

      <Section id="projects" style={{ padding: "8rem 3rem", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>02 / Projects</p>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}>Selected Work</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {loadingProjects ? [1,2,3].map(i => (
              <div key={i} style={{ border: "1px solid #1e1e1e", padding: "2rem" }}>
                <div className="skeleton" style={{ height: 12, width: "30%", marginBottom: "1.5rem" }} />
                <div className="skeleton" style={{ height: 24, width: "70%", marginBottom: "1rem" }} />
                <div className="skeleton" style={{ height: 12, width: "100%", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ height: 12, width: "80%" }} />
              </div>
            )) : projects.map((p, i) => (
              <div key={p._id} className="project-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <span className="mono" style={{ color: "#333", fontSize: "0.65rem" }}>0{i + 1}</span>
                  <span className="mono gold" style={{ fontSize: "0.7rem" }}>→</span>
                </div>
                <h3 className="serif" style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: "1rem" }}>{p.title}</h3>
                <p className="mono" style={{ color: "#666", fontSize: "0.78rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>{p.description}</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {p.tech?.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="blog" style={{ padding: "8rem 3rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>03 / Blog</p>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}>Writing</h2>
          </div>
          <div>
            {loadingPosts ? [1,2,3].map(i => (
              <div key={i} style={{ borderBottom: "1px solid #1a1a1a", padding: "1.5rem 0" }}>
                <div className="skeleton" style={{ height: 20, width: "50%", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ height: 12, width: "20%" }} />
              </div>
            )) : posts.map(post => (
              <div key={post._id} className="blog-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "2rem" }}>
                <div>
                  <h3 className="serif" style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.5rem" }}>{post.title}</h3>
                  <span className="mono" style={{ color: "#555", fontSize: "0.7rem" }}>{formatDate(post.createdAt)}</span>
                </div>
                <span className="mono gold" style={{ fontSize: "0.7rem" }}>{post.readTime || "5 min"} read →</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="contact" style={{ padding: "8rem 3rem", background: "#050505" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p className="mono gold" style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>04 / Contact</p>
          <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300, marginBottom: "1rem" }}>Let's talk.</h2>
          <p className="mono" style={{ color: "#555", fontSize: "0.8rem", marginBottom: "3rem", lineHeight: 1.8 }}>Open to new opportunities, collaborations, or just a good conversation about tech. Reach me at <span className="gold">ryancarbonel1984@gmail.com</span></p>
          {sent ? (
            <div style={{ border: "1px solid #c9a96e33", padding: "2rem", textAlign: "center" }}>
              <p className="serif gold" style={{ fontSize: "1.5rem", fontWeight: 300 }}>Message sent.</p>
              <p className="mono" style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.5rem" }}>I'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input className="input" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <textarea className="input" placeholder="Your message..." rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required style={{ resize: "vertical" }} />
              <button className="btn" type="submit" disabled={sending} style={{ width: "fit-content" }}>{sending ? "Sending..." : "Send Message"}</button>
            </form>
          )}
          <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #1a1a1a", display: "flex", gap: "2rem" }}>
            <a href="https://github.com/Reffin" target="_blank" className="mono" style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.1em", transition: "color 0.3s" }}
              onMouseEnter={e => e.target.style.color = "#c9a96e"} onMouseLeave={e => e.target.style.color = "#444"}>GitHub</a>
            <a href="https://web.facebook.com/ryan.s.carbonel" target="_blank" className="mono" style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.1em", transition: "color 0.3s" }}
              onMouseEnter={e => e.target.style.color = "#c9a96e"} onMouseLeave={e => e.target.style.color = "#444"}>Facebook</a>
          </div>
        </div>
      </Section>

      <footer style={{ padding: "2rem 3rem", borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ color: "#333", fontSize: "0.65rem" }}>© 2026 — Ryan S. Carbonel</span>
        <span className="mono gold" style={{ fontSize: "0.65rem" }}>Connected to API ✓</span>
      </footer>
    </div>
  );
}

// ── App Router ────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const isAdmin = window.location.pathname === "/admin" ||
                  window.location.hash === "#admin";

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    window.location.href = "/";
  };

  if (isAdmin) {
    if (!token) return <><style>{STYLES}</style><LoginPage onLogin={setToken} /></>;
    return <><style>{STYLES}</style><AdminDashboard token={token} onLogout={handleLogout} /></>;
  }

  return <><style>{STYLES}</style><Portfolio /></>;
}
