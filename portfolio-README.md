# 💼 Ryan S. Carbonel — Portfolio

A modern, full-stack developer portfolio built with React and Node.js, featuring a secure admin dashboard for managing projects and blog posts.

🌐 **Live Demo:** [https://portfolio-three-delta-dzyn1fzefk.vercel.app](https://portfolio-three-delta-dzyn1fzefk.vercel.app)

---

## ✨ Features

### 🎨 Portfolio
- Clean, minimal dark theme design
- Smooth scroll animations
- Responsive layout
- Featured projects showcase
- Blog posts section
- Contact form with email notifications

### 🔐 Admin Dashboard
- Secure JWT authentication
- Add, edit, delete projects
- Add, edit, delete blog posts
- View contact messages
- Forgot/reset password via email

### 📧 Email
- Contact form sends email notification to admin
- Auto-reply email sent to visitor
- Password reset email via Brevo

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI Framework |
| CSS-in-JS | Styling |
| Cormorant Garamond + DM Mono | Typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Brevo | Email Service |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Brevo account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Reffin/portfolio.git
cd portfolio
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
BREVO_API_KEY=your_brevo_key
```

5. **Run the development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

---

## 📁 Project Structure

```
portfolio/
├── client/                 # React frontend
│   └── src/
│       └── App.jsx         # Main app with portfolio + admin
│
└── server/                 # Node.js backend
    ├── models/             # MongoDB models
    ├── routes/             # API routes (auth, projects, posts, contact)
    ├── middleware/         # Auth middleware
    └── index.js            # Entry point
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Add project (Admin) |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Add post (Admin) |
| GET | `/api/contact` | Get messages (Admin) |
| POST | `/api/contact` | Send contact message |

---

## 👤 Developer

**Ryan S. Carbonel**
- 🛍️ ShopZone: [https://shopping-cart-peach-alpha.vercel.app](https://shopping-cart-peach-alpha.vercel.app)
- GitHub: [https://github.com/Reffin](https://github.com/Reffin)

---

## 📄 License

MIT License — feel free to use this project as a reference or template!
