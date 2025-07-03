const WebSocket = require("ws");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 443;
const isDevelopment = process.env.NODE_ENV !== "production";

// SSL Certificate paths (adjust these paths based on your server setup)
const SSL_CERT_PATH =
  process.env.SSL_CERT_PATH ||
  "/etc/letsencrypt/live/ws.cowrite.software/fullchain.pem";
const SSL_KEY_PATH =
  process.env.SSL_KEY_PATH ||
  "/etc/letsencrypt/live/ws.cowrite.software/privkey.pem";

let server;
let serverType = "HTTP";

// Try to create HTTPS server with SSL certificates
try {
  if (
    !isDevelopment &&
    fs.existsSync(SSL_CERT_PATH) &&
    fs.existsSync(SSL_KEY_PATH)
  ) {
    const sslOptions = {
      cert: fs.readFileSync(SSL_CERT_PATH),
      key: fs.readFileSync(SSL_KEY_PATH),
    };

    server = https.createServer(sslOptions);
    serverType = "HTTPS";
    console.log("🔒 SSL certificates found, creating HTTPS server");
  } else {
    // Fallback to HTTP for development or if certificates not found
    server = http.createServer();
    console.log(
      "⚠️  No SSL certificates found or in development mode, using HTTP"
    );
    if (!isDevelopment) {
      console.log("💡 To use HTTPS, ensure SSL certificates exist at:");
      console.log(`   Cert: ${SSL_CERT_PATH}`);
      console.log(`   Key:  ${SSL_KEY_PATH}`);
    }
  }
} catch (error) {
  console.error("❌ Error loading SSL certificates:", error.message);
  console.log("🔄 Falling back to HTTP server");
  server = http.createServer();
}

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
  const protocol = serverType === "HTTPS" ? "wss" : "ws";
  console.log(`✅ WebSocket server running on ${protocol}://${host}:${port}`);

  if (host === "0.0.0.0") {
    const networkInterfaces = require("os").networkInterfaces();
    console.log("\n📡 Available on your network:");

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((interface) => {
        if (interface.family === "IPv4" && !interface.internal) {
          console.log(`   ${protocol}://${interface.address}:${port}`);
        }
      });
    });
  }

  if (serverType === "HTTPS") {
    console.log("🔒 Server is running with SSL encryption");
  } else {
    console.log("⚠️  Server is running without SSL encryption");
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
