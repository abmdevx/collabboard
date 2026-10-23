# CollabBoard Backend

The `server/` directory contains the Node.js backend for CollabBoard. It exposes room and canvas REST endpoints and manages realtime collaboration through Socket.IO.

## Responsibilities

- Create and retrieve rooms
- Store room users and chat history
- Save and load canvas elements
- Broadcast drawing, scene, cursor, chat, and voice events
- Connect to MongoDB when configured
- Fall back to in-memory storage when MongoDB is unavailable

## Main Areas

```text
src/
  controllers/   Room and canvas request handlers
  models/        Mongoose room and canvas models
  routes/        REST API routes
  socket/        Socket.IO event registration
  utils/         Room IDs and in-memory storage
  index.js       Express, HTTP, Socket.IO, and database startup
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB is optional for local development

## Setup

```bash
cd server
npm install
```

Copy `.env.example` to `.env`, or create `server/.env` with:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=
```

For local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/collab-whiteboard
```

If `MONGO_URI` is empty, the server logs a warning and uses the in-memory fallback. This mode is useful for testing, but data does not survive a server restart.

## Development

```bash
npm run dev
```

The backend listens on port `5000` by default.

Start without Nodemon:

```bash
npm start
```

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Return server health |
| `POST` | `/api/room/create` | Create a new room |
| `GET` | `/api/room/:roomId` | Return room users and chat history |
| `POST` | `/api/canvas/save` | Persist canvas elements |
| `GET` | `/api/canvas/:roomId` | Return saved canvas elements |

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | HTTP and Socket.IO listening port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `MONGO_URI` | Empty | Optional MongoDB connection string |

## Production Notes

- Set `CLIENT_ORIGIN` to the deployed frontend origin.
- Use a managed MongoDB connection string when persistence is required.
- Keep credentials in environment variables and never commit `.env`.
- Run `npm start` for a non-watch production process.
