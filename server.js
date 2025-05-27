const WebSocket = require("ws");
const http = require("http");

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 10000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🔌 New WebSocket connection from: ${clientIP}`);

  // Extract room name from URL path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomname = url.pathname.slice(1);

  if (!roomname) {
    console.log("❌ No room name provided, closing connection");
    ws.close();
    return;
  }

  console.log(`📋 Client joined room: ${roomname}`);

  // Store room name on the WebSocket for filtering
  ws.roomname = roomname;

  // handle incoming messages - just forward them, don't process
  ws.on("message", (message) => {
    // Forward message to all other clients in the same room
    wss.clients.forEach((client) => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.roomname === roomname
      ) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log(
      `🔌 WebSocket connection closed from: ${clientIP} (room: ${roomname})`
    );
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(port, host, () => {
  console.log(`✅ WebSocket server running on ws://${host}:${port}`);

  if (host === "0.0.0.0") {
    const networkInterfaces = require("os").networkInterfaces();
    console.log("\n📡 Available on your network:");

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((interface) => {
        if (interface.family === "IPv4" && !interface.internal) {
          console.log(`   ws://${interface.address}:${port}`);
        }
      });
    });
  }

  console.log("\n🚀 Ready for collaborative editing!");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
