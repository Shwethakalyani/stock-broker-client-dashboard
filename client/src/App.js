import React, { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

/* Supported stocks */
const SUPPORTED = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

/* Stock logos */
const STOCK_IMAGES = {
  GOOG: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  TSLA: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
  AMZN: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  META: "/meta-logo-png.png",
  NVDA: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
};

function App() {
  const [email, setEmail] = useState("");
  const [loggedInAs, setLoggedInAs] = useState(null);

  const [subscriptions, setSubscriptions] = useState([]);
  const [prices, setPrices] = useState({});
  const [logs, setLogs] = useState([]);

  /* ✅ Correct Socket Listener */
  useEffect(() => {
    const handlePrice = ({ ticker, price }) => {
      setPrices((prev) => ({ ...prev, [ticker]: price }));
    };

    socket.on("priceUpdate", handlePrice);

    return () => {
      socket.off("priceUpdate", handlePrice);
    };
  }, []);

  function addLog(message) {
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()} — ${message}`,
      ...prev,
    ].slice(0, 40));
  }

  /* ✅ Client-side login only */
  function handleLogin(e) {
    e.preventDefault();
    if (!email.trim()) return alert("Enter email");
    setLoggedInAs(email);
    socket.emit("join", email);
    addLog(`Logged in as ${email}`);
  }

  function toggleSubscribe(ticker) {
    if (!loggedInAs) {
      alert("Please login first");
      return;
    }

    if (subscriptions.includes(ticker)) {
      setSubscriptions((s) => s.filter((t) => t !== ticker));
      addLog(`Unsubscribed from ${ticker}`);
    } else {
      socket.emit("subscribe", { ticker });
      setSubscriptions((s) => [...s, ticker]);
      addLog(`Subscribed to ${ticker}`);
    }
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>📈 Stock Broker Client Dashboard</h1>

        {loggedInAs ? (
          <div>
            Logged in as <strong>{loggedInAs}</strong>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 6 }}
            />
            <button type="submit">Login</button>
          </form>
        )}
      </header>

      {/* MARKET WATCH */}
      <section className="card">
        <h3>Market Watch</h3>

        <div className="ticker-grid">
          {SUPPORTED.map((ticker) => {
            const isSub = subscriptions.includes(ticker);

            return (
              <div key={ticker} className="stock-card">
                <img
                  src={STOCK_IMAGES[ticker]}
                  alt={ticker}
                  className="stock-logo"
                />

                <h4>{ticker}</h4>

                <p className="price">
                  {prices[ticker] !== undefined
                    ? `$${prices[ticker]}`
                    : "Loading..."}
                </p>

                <button
                  className={`btn ${isSub ? "unsubscribe" : "subscribe"}`}
                  onClick={() => toggleSubscribe(ticker)}
                >
                  {isSub ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SUBSCRIPTIONS */}
      <section className="card">
        <h3>Your Subscriptions</h3>

        {subscriptions.length === 0 ? (
          <div>No subscriptions yet</div>
        ) : (
          subscriptions.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <strong>{t}</strong>
              <span>{prices[t] ?? "Loading..."}</span>
            </div>
          ))
        )}
      </section>

      {/* ACTIVITY LOG */}
      <section className="card">
        <h3>Activity Log</h3>

        <div style={{ maxHeight: 160, overflowY: "auto", fontSize: 13 }}>
          {logs.length === 0
            ? "No activity yet"
            : logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </section>

      <footer>
        <small>Live stock prices update every second</small>
      </footer>
    </div>
  );
}

export default App;
