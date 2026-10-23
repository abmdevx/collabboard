# CollabBoard

CollabBoard is a realtime collaborative whiteboard for sketching, planning, and sharing ideas in room-based workspaces.

## Features

- Create and join shared rooms
- Realtime drawing with pencil, lines, rectangles, ellipses, triangles, diamonds, and arrows
- Add text with selectable fonts and bounded font sizes
- Select and move items from their full selection area
- Erase complete items by clicking anywhere inside them
- Live collaborator cursors
- Undo and redo synchronization
- Save and load canvas state
- Realtime room chat with an optional overlay
- Optional voice chat
- MongoDB persistence with an in-memory fallback

## Tech Stack

- **Frontend:** React, Vite, Zustand, Tailwind CSS, Canvas API, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, Mongoose
- **Database:** MongoDB, optional for local development

## Repository Structure

```text
client/  React/Vite frontend
server/  Express/Socket.IO backend
```

See the dedicated documentation:

- [Frontend README](./client/README.md)
- [Backend README](./server/README.md)

## Requirements

- Node.js 18 or newer
- npm
- MongoDB only if persistent database storage is required

## Quick Start

Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Configure the environment files:

```text
client/.env
server/.env
```

The repository includes `.env.example` files. Local defaults are:

### Client

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Server

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=
```

`MONGO_URI` may remain empty. The server will use its in-memory fallback, but data will be lost when the server restarts. For local MongoDB, use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/collab-whiteboard
```

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Open the app in multiple browser tabs to test collaboration.

## Available Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start with Nodemon
npm start         # Start with Node.js
```

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check server health |
| `POST` | `/api/room/create` | Create a room |
| `GET` | `/api/room/:roomId` | Get room data |
| `POST` | `/api/canvas/save` | Save canvas elements |
| `GET` | `/api/canvas/:roomId` | Load canvas elements |

## Realtime Events

The frontend and backend communicate through Socket.IO for room membership, canvas synchronization, cursors, chat, and voice signaling. The main events include:

- Room: `JOIN_ROOM`, `USER_JOINED`, `USER_LEFT`
- Canvas: `SCENE_CHANGE`, `SYNC_SCENE`, `CLEAR_CANVAS`, `SYNC_CLEAR`
- Cursor: `CURSOR_MOVE`, `SYNC_CURSOR`
- Chat: `SEND_CHAT_MESSAGE`, `SYNC_CHAT_MESSAGE`, `SYNC_CHAT_HISTORY`
- Voice: `VOICE_JOIN`, `VOICE_LEAVE`, and related signaling events

## Security Notes

- Never commit real MongoDB credentials.
- Keep `.env` files local; commit only `.env.example` templates.
- Configure `CLIENT_ORIGIN` for the deployed frontend origin in production.
