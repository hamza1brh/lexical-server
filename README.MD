# Lexical WebSocket Server

Simple (the simplest) WebSocket server for Lexical real-time collaborative editing.

## Quick Start

```bash
npm install
npm start
```

Server runs on `ws://localhost:10000`

## Usage

Connect clients to rooms via URL path:

```
ws://localhost:10000/room-name
```

## Environment Variables

- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 10000)
