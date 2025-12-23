import React, { useEffect, useState } from "react";
import socket from "./socket";
import StockCard from "./StockCard";
import StockChart from "./StockChart";

export default function Dashboard({ user }) {
  const supportedStocks = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

  const [subscribed, setSubscribed] = useState([]);
  const [prices, setPrices] = useState({});

  /* 🚫 Prevent unauthorized access */
  if (!user) {
    return (
      <div className="dashboard">
        <h2>Please login to access dashboard</h2>
      </div>
    );
  }

  /* 🔌 Socket lifecycle */
  useEffect(() => {
    // join socket room
    socket.emit("join", { user });

    // receive price updates
    const handlePriceUpdate = ({ ticker, price }) => {
      setPrices((prev) => ({
        ...prev,
        [ticker]: price,
      }));
    };

    socket.on("price_update", handlePriceUpdate);

    // cleanup listeners
    return () => {
      socket.off("price_update", handlePriceUpdate);
    };
  }, [user]);

  /* 📌 Subscribe to stock */
  const subscribe = (ticker) => {
    if (subscribed.includes(ticker)) return;

    setSubscribed((prev) => [...prev, ticker]);
    socket.emit("subscribe", { user, ticker });
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user}</h2>

      {/* MARKET WATCH */}
      <section>
        <h3>Market Watch</h3>
        <div className="ticker-list">
          {supportedStocks.map((ticker) => (
            <button
              key={ticker}
              onClick={() => subscribe(ticker)}
              disabled={subscribed.includes(ticker)}
            >
              {ticker}
            </button>
          ))}
        </div>
      </section>

      {/* SUBSCRIBED STOCKS */}
      <section>
        <h3>Your Subscribed Stocks</h3>
        <div className="card-container">
          {subscribed.length === 0 && (
            <p>No subscriptions yet</p>
          )}

          {subscribed.map((ticker) => (
            <StockCard
              key={ticker}
              ticker={ticker}
              price={prices[ticker] ?? "Loading..."}
            />
          ))}
        </div>
      </section>

      {/* LIVE CHART */}
      <section>
        <h3>Live Stock Chart</h3>
        {subscribed.length === 0 ? (
          <p>Subscribe to stocks to view chart</p>
        ) : (
          <StockChart tickerList={subscribed} prices={prices} />
        )}
      </section>
    </div>
  );
}
