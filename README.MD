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




/root/.pm2/logs/lexical-server-out.log last 15 lines:
0|lexical- | ✅ WebSocket server running on ws://0.0.0.0:10000
0|lexical- | 
0|lexical- | 📡 Available on your network:
0|lexical- |    ws://64.226.116.98:10000
0|lexical- |    ws://10.19.0.5:10000
0|lexical- |    ws://10.114.0.2:10000
0|lexical- | 
0|lexical- | 🚀 Ready for collaborative editing!

