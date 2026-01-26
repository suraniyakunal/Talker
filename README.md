# Talker

Talker is a real-time social communication web app built with the **MERN** stack, designed to let people connect through live chat and voice rooms.

Live app: https://talker-one.vercel.app

---

## Features

- Real-time one-to-one and group chat.
- Voice rooms for drop-in audio conversations.
- User authentication and persistent profiles.
- Responsive UI built with React.
- Separate `client` and `server` apps for clean architecture.

---

## Tech Stack

- **Frontend (client):** React, JavaScript, REST API integration.
- **Backend (server):** Node.js, Express.
- **Database:** MongoDB (via Mongoose).
- **Real-time:** Socket.io or WebSocket-based communication.
- **Auth:** JWT-based auth with secure password hashing.
- **Deployment:**
  - Client on Vercel (`talker-one.vercel.app`).
  - Server on a Node-compatible host (Render, Railway, etc.).

---

## Folder Structure

```text
Talker/
  client/          # React frontend
  server/          # Node/Express backend
  .gitignore
  package.json
  README.md


Getting Started
Prerequisites

    Node.js (LTS)

    npm or pnpm

    MongoDB (local or Atlas)

Clone

bash
git clone https://github.com/suraniyakunal/Talker.git
cd Talker

Environment setup

Create .env.dev in server/:

text
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

Create .env.dev in client/:

text
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

Install dependencies

bash
# backend
cd server
npm install

# frontend
cd ../client
npm install

Run in development

bash
# terminal 1 - server
cd server
npm run dev   # or npm start

# terminal 2 - client
cd client
npm run dev     # React dev server

Open http://localhost:3000 in your browser.
Core Flows

    Authentication: User registers/logs in → server validates credentials and issues JWT → client stores token → protected routes call backend with auth header.

    Chat: Client connects to Socket.io, joins room by ID → sends message event → server broadcasts to room and persists in MongoDB.

    Voice rooms: Users join a room, server tracks room membership, and client handles audio (WebRTC/peer connections with signaling over sockets).

Scripts
client

    npm run dev – Run React dev server.

    npm run build – Build production bundle.

server

    npm run dev – Run server in dev mode (with nodemon).

    npm start – Run server in production mode.

Roadmap

    Better room management (private/public rooms, invitations).

    Message reactions and read receipts.

    Profile customization and presence (last seen, status).

    Notifications (in-app, email, push).

