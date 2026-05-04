# Personal App Store

A production-ready personal app store built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring shadcn/ui components and Tailwind CSS.

**By Atchyuteswar Gottumukkala**

## Features

- 🏪 Browse, search, and filter apps by category
- 📱 Download APK/IPA files directly from the store
- ⭐ Featured apps carousel on the homepage
- 🌓 Dark / Light mode toggle (persisted)
- 🔐 Admin dashboard with JWT cookie-based authentication
- 📤 Upload apps with icons, screenshots, and app files
- 📊 Admin stats: total apps, downloads, published/unpublished
- 🎨 Beautiful shadcn/ui components throughout
- 📱 Fully responsive (mobile, tablet, desktop)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie) |
| File Upload | Multer |
| Password Hash | bcryptjs |

## Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally or a MongoDB Atlas connection string

### 1. Clone and Install

```bash
# Install server dependencies
cd app-store/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `app-store/.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appstore
JWT_SECRET=change_this_to_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123!

MAX_APK_SIZE_MB=500
MAX_IMAGE_SIZE_MB=5
```

### 3. Start Development Servers

```bash
# Terminal 1 - Start the backend
cd app-store/server
npm run dev

# Terminal 2 - Start the frontend
cd app-store/client
npm run dev
```

The backend runs at `http://localhost:5000` and the frontend at `http://localhost:5173`.

### 4. First Run

On first startup, the server automatically creates an admin account using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. You'll see:

```
Connected to MongoDB
Admin account seeded: admin@example.com
Server running on http://localhost:5000
```

### 5. Add Your First App

1. Navigate to `http://localhost:5173/admin/login`
2. Login with the admin credentials from `.env`
3. Click **"Add New App"** in the dashboard
4. Fill in the details, upload an icon and APK file
5. The app appears on the homepage immediately!

## Project Structure

```
app-store/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Navbar.jsx
│   │   │   ├── AppCard.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── CategoryBar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── AppDetail.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
├── server/                    # Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/              # APK files, icons, screenshots
│   └── server.js
├── .env
└── README.md
```

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apps` | Get all published apps |
| GET | `/api/apps/:slug` | Get single app detail |
| GET | `/api/apps/:slug/download` | Download app file |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Verify token |
| GET | `/api/admin/apps` | Get all apps |
| POST | `/api/admin/apps` | Create app |
| PUT | `/api/admin/apps/:id` | Update app |
| DELETE | `/api/admin/apps/:id` | Delete app |
| PATCH | `/api/admin/apps/:id/toggle-publish` | Toggle publish |
| PATCH | `/api/admin/apps/:id/toggle-featured` | Toggle featured |

## Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Set start command: `node server.js`

### Frontend (Vercel)
1. Connect your repo to Vercel
2. Set root directory to `client`
3. Set `VITE_API_URL` to your backend URL
4. Deploy

## License

MIT
