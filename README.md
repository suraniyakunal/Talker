# 🚀 Talker: Real-Time Social & Voice Hub

Talker is a high-performance, feature-rich social platform that brings people together through real-time communication. From instant messaging to dynamic voice and video rooms, Talker provides a seamless experience for connecting with others.

### 🔥 [Live Demo](https://talker-one.vercel.app)

---

## 🌟 Key Features

### 📡 Real-Time Communication
- **Instant Messaging**: Seamless one-to-one and group chats with real-time updates powered by Socket.io.
- **Voice Rooms**: Drop-in audio conversations with a robust "Broadcaster/Listener" architecture.
- **Live Video Synchronization**: Synchronized video streams for hosts and speakers in live room sessions.

### 🎙️ Advanced Media Integration
- **Mediasoup (SFU)**: Leveraging Selective Forwarding Unit (SFU) architecture for low-latency, scalable audio and video broadcasting.
- **Role-Based Interaction**: Dynamic transitions from listener to speaker with request/approval workflows.

### 📱 Social Ecosystem
- **Social Feed**: Create, view, and interact with posts (Like, Comment, Follow).
- **Pro Profiles**: Comprehensive user profiles displaying following/follower metrics and activity.
- **Search & Discovery**: Find users and join public rooms instantly.

### 🍱 Modern UX/UI
- **Premium Design**: Dark-themed, glassmorphic UI built with Tailwind CSS.
- **Responsive Layout**: Optimized for both desktop and mobile experiences.
- **Dynamic Animations**: Smooth transitions and interactive elements for a premium feel.

---

## 🛠️ Technical Stack

- **Frontend**: ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
- **Backend**: ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
- **Database**: ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
- **Media**: ![Mediasoup](https://img.shields.io/badge/Mediasoup-000000?style=for-the-badge&logo=web-rtc&logoColor=white) (SFU Architecture)
- **State Management**: ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

---

## 📂 Project Structure

```text
Talker/
├── client/          # Vite-React Frontend
│   ├── src/
│   │   ├── auth/         # Authentication Context & Guards
│   │   ├── components/   # UI Components (Chats, Rooms, Posts)
│   │   ├── configs/      # Axios & API configurations
│   │   └── socket/       # Socket.io connection logic
├── server/          # Node-Express Backend
│   ├── auth/             # JWT Token generation
│   ├── controllers/      # Business logic handlers
│   ├── models/           # Mongoose schemas (User, Room, Chat, Post)
│   ├── routes/           # API Endpoints
│   └── sockets/          # Socket.io & Mediasoup logic
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/suraniyakunal/Talker.git
cd Talker

# Install Server dependencies
cd server && npm install

# Install Client dependencies
cd ../client && npm install
```

### 2. Environment Setup
Create a `.env.dev` file in both `server/` and `client/` folders.

**`server/.env.dev`**:
```env
PORT=3000
MONGODB_URL=your_mongodb_url
JWT_SECRET=your_secret_key
```

**`client/.env.dev`**:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Run Locally
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 🔒 Security & Optimization
- **JWT Protection**: Secured API endpoints with cookie-based JWT authentication.
- **Bcrypt Hashing**: Secure password storage for all users.
- **Lazy Loading**: Code-splitting and lazy components for optimized performance.
- **CORS Config**: Fine-grained access control for cross-origin requests.

---

## 🤝 Contribution
Contributions are welcome! Please fork the repo and submit a PR.

---

Designed with ❤️ for a better social experience.
