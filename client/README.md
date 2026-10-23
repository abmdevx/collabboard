# CollabBoard Frontend

The `client/` directory contains the React/Vite frontend for CollabBoard. It provides the whiteboard interface, room navigation, collaboration UI, chat, live cursors, and voice controls.

## Responsibilities

- Render the home page and room workspace
- Manage local canvas state with Zustand
- Draw and interact with elements using the Canvas API
- Synchronize rooms, scenes, cursors, chat, and voice signaling through Socket.IO
- Call the backend REST API for room and canvas persistence

## Main Areas

```text
src/
  canvas/       Canvas renderer and pointer interactions
  components/   Toolbar, chat, cursor, and voice UI
  hooks/        Socket and voice collaboration hooks
  pages/        Home and room pages
  socket/       Socket.IO client setup
  store/        Zustand board state
  utils/        Element creation and geometry helpers
```

## Requirements

- Node.js 18 or newer
- npm
- The backend running locally or at the configured API URL

## Setup

```bash
cd client
npm install
```

Copy `.env.example` to `.env`, or create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Vite exposes only variables prefixed with `VITE_` to browser code. Do not put secrets in this file.

## Development

```bash
npm run dev
```

The development server runs at [http://localhost:5173](http://localhost:5173).

## Scripts

```bash
npm run dev       # Start Vite with hot reload
npm run build     # Build the frontend for production
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## User Features

- Create a new room or join an existing room code
- Draw with pencil, line, and multiple shape tools
- Add text with font and size controls
- Select, move, erase, undo, redo, clear, and save canvas content
- See collaborator cursors and connected users
- Open an overlay chat without leaving the board
- Join optional room voice chat

## Backend Connection

By default, the frontend expects:

- REST API: `http://localhost:5000/api`
- Socket.IO server: `http://localhost:5000`

For deployment, set `VITE_API_URL` and `VITE_SOCKET_URL` to the public backend URLs before building.
