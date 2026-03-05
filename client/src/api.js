const BASE_URL = "http://localhost:5000/api";

// ── Projects ──────────────────────────────────────
export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

// ── Posts ─────────────────────────────────────────
export async function getPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// ── Contact ───────────────────────────────────────
export async function sendContact(data) {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}