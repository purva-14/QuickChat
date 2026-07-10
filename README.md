# QuickChat — MERN Real-Time Chat App

Full-stack real-time chat application built with **MongoDB, Express, React, Node.js**, **JWT auth**, **Socket.IO**, **Axios**, **Tailwind CSS + DaisyUI**. Theme: black background with neon green accents, matching the provided UI mock.

## Features
- JWT authentication (register/login/logout, protected routes)
- Real-time messaging with Socket.IO
- Online/offline presence
- Typing indicators
- Read receipts (Sent → Delivered → Seen)
- Image sharing in chat
- Reply to messages
- Message search (per conversation)
- Profile editing with avatar upload
- Message reactions (emoji, toggleable)
- Dark mode (black + neon green, always-on theme)
- Responsive UI (mobile sidebar collapses, desktop shows profile panel)
- Browser notifications + sound ping for new messages when tab isn't focused

## Project structure
```
quickchat/
├── backend/     # Express + Socket.IO + MongoDB API
└── frontend/    # React (Vite) + Tailwind + DaisyUI client
```

## 1. Prerequisites
- Node.js 18+
- A MongoDB database — either:
  - Local MongoDB (`mongod` running on `mongodb://127.0.0.1:27017`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended)

## 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=make_this_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
Run it:
```bash
npm run dev
```
API will be live at `http://localhost:5000`, static uploads served from `/uploads`.

## 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
```
`.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Run it:
```bash
npm run dev
```
App will be live at `http://localhost:5173`.

## 4. Try it out
1. Open two browser windows (or one normal + one incognito).
2. Register two different accounts.
3. Start chatting — you'll see live typing indicators, delivered/seen ticks, presence dots, reactions, replies, and image sharing between the two sessions in real time.

## Notes on going to production
- Swap `MONGO_URI` for your Atlas connection string.
- Deploy backend (Render/Railway/Fly.io) and set `CLIENT_URL` to your deployed frontend origin for CORS + Socket.IO.
- Deploy frontend (Vercel/Netlify) and point `VITE_API_URL` / `VITE_SOCKET_URL` at your deployed backend.
- Move uploaded images to a cloud bucket (S3/Cloudinary) instead of local disk for a multi-instance deployment.
- Rotate `JWT_SECRET` to a strong random value and never commit `.env`.

## Design system
- Background: `#050706` / `#0A0F0B` (base-950/900)
- Accent: neon green `#39FF14` (primary), `#7CFF6B` (soft), `#1FAA0C` (dim)
- Fonts: Space Grotesk (display), Inter (body)
- DaisyUI theme name: `quickchat` (see `frontend/tailwind.config.js`)
