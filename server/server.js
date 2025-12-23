// server/server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

/* ✅ Allow all Vercel + local origins safely */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

/* ✅ Socket.IO with mobile-safe config */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"], // mobile safe
});


/* ✅ EXPRESS CORS — HERE */
app.use(
  cors({
    origin: "*",        // allow all (safe for demo/project)
    methods: ["GET", "POST"],
  })
);

// Supported stocks
const TICKERS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Base prices
let basePrice = {
  GOOG: 2800,
  TSLA: 700,
  AMZN: 3100,
  META: 330,
  NVDA: 180,
};

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("join", (user) => {
    console.log("👤 User joined:", user);
  });

  socket.on("subscribe", ({ ticker }) => {
    if (!TICKERS.includes(ticker)) return;

    socket.join(`ticker:${ticker}`);
    console.log(`📌 ${socket.id} subscribed to ${ticker}`);

    // Send immediate price
    socket.emit("priceUpdate", {
      ticker,
      price: basePrice[ticker],
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* 🔁 Price generator */
function generatePrice(ticker) {
  const base = basePrice[ticker];
  const change = (Math.random() - 0.5) * 0.04; // ±2%
  const newPrice = +(base * (1 + change)).toFixed(2);
  basePrice[ticker] = newPrice;
  return newPrice;
}

/* ⏱ Emit prices every second */
setInterval(() => {
  TICKERS.forEach((ticker) => {
    const price = generatePrice(ticker);
    io.to(`ticker:${ticker}`).emit("priceUpdate", {
      ticker,
      price,
    });
  });
}, 1000);

/* Health check */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Stock price server running" });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
