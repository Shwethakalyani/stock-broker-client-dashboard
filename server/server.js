// server/server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 2000;

/* ✅ Allowed Frontend Origins */
const allowedOrigins = [
  "https://stock-broker-client-dashboard.vercel.app",
  "https://www.stock-broker-client-dashboard.vercel.app",
  "http://localhost:3000",
];

/* ✅ Express CORS (Mobile Safe) */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: false,
  })
);

app.use(express.json());

/* ✅ Socket.IO (WebSocket only – Mobile Friendly) */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: false,
  },
  transports: ["websocket"],
});

/* ===================== STOCK LOGIC ===================== */

const TICKERS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

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
    console.log("User joined:", user);
  });

  socket.on("subscribe", ({ ticker }) => {
    if (!TICKERS.includes(ticker)) return;

    socket.join(`ticker:${ticker}`);
    console.log(`${socket.id} subscribed to ${ticker}`);

    socket.emit("priceUpdate", {
      ticker,
      price: basePrice[ticker],
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* ===================== PRICE ENGINE ===================== */

function generatePrice(ticker) {
  const base = basePrice[ticker];
  const change = (Math.random() - 0.5) * 0.04;
  const newPrice = +(base * (1 + change)).toFixed(2);
  basePrice[ticker] = newPrice;
  return newPrice;
}

setInterval(() => {
  for (const t of TICKERS) {
    const price = generatePrice(t);
    io.to(`ticker:${t}`).emit("priceUpdate", {
      ticker: t,
      price,
    });
  }
}, 1000);

/* ===================== HEALTH CHECK ===================== */

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Stock price server running" });
});

/* ===================== START SERVER ===================== */

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
