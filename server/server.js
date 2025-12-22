// server/server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 2000;

/* ✅ Express CORS */
app.use(cors({
  origin: "https://stock-broker-client.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));

/* ✅ Socket.IO CORS */
const io = new Server(server, {
  cors: {
    origin: "https://stock-broker-client.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Supported tickers
const TICKERS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Base prices (seed)
let basePrice = {
  GOOG: 2800,
  TSLA: 700,
  AMZN: 3100,
  META: 330,
  NVDA: 180,
};

// When client connects
io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  // login with email — we store it in socket.data.email and join a room for the user
  socket.on("login", ({ email }) => {
    if (!email) return;
    socket.data.email = email;
    socket.join(`user:${email}`);
    console.log(`socket ${socket.id} logged in as ${email}`);
    // Optionally send back confirmation
    socket.emit("logged_in", { email });
  });

  // subscribe to a ticker -> join ticker room
  socket.on("subscribe", ({ ticker }) => {
    if (!TICKERS.includes(ticker)) {
      socket.emit("error_msg", { msg: "Unsupported ticker" });
      return;
    }
    socket.join(`ticker:${ticker}`);
    console.log(`${socket.id} subscribed to ${ticker}`);
    // send immediate current price snapshot
    socket.emit("price_update", { ticker, price: basePrice[ticker], ts: Date.now() });
  });

  socket.on("unsubscribe", ({ ticker }) => {
    socket.leave(`ticker:${ticker}`);
    console.log(`${socket.id} unsubscribed from ${ticker}`);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });
});

// Generate a new random price for a ticker (random walk)
function generatePrice(ticker) {
  const base = basePrice[ticker] ?? 100;
  const changePct = (Math.random() - 0.5) * 0.04; // -2% .. +2%
  const newPrice = +(base * (1 + changePct)).toFixed(2);
  basePrice[ticker] = newPrice;
  return newPrice;
}

// Emit price updates every second per ticker to its room
setInterval(() => {
  for (const t of TICKERS) {
    const price = generatePrice(t);
    io.to(`ticker:${t}`).emit("price_update", { ticker: t, price, ts: Date.now() });
  }
}, 1000);

// basic index route
app.get("/", (req, res) => {
  res.json({ msg: "Stock price server running" });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
