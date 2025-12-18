import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import StockCard from "./StockCard";
import StockChart from "./StockChart";

const socket = io("http://localhost:5000");

export default function Dashboard({ user }) {
  const [supportedStocks] = useState(["GOOG", "TSLA", "AMZN", "META", "NVDA"]);
  const [subscribed, setSubscribed] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    socket.emit("join", user);

    socket.on("priceUpdate", (data) => {
      setPrices((prev) => ({ ...prev, [data.ticker]: data.price }));
    });
  }, [user]);

  const subscribe = (ticker) => {
    if (!subscribed.includes(ticker)) {
      setSubscribed([...subscribed, ticker]);
      socket.emit("subscribe", { user, ticker });
    }
  };

  return (
    <div>
      <h2>Welcome, {user}</h2>

      <h3>Subscribe to a Stock</h3>
      <div className="ticker-list">
        {supportedStocks.map((t) => (
          <button key={t} onClick={() => subscribe(t)}>
            {t}
          </button>
        ))}
      </div>

      <h3>Your Subscribed Stocks</h3>
      <div className="card-container">
        {subscribed.map((t) => (
          <StockCard key={t} ticker={t} price={prices[t]} />
        ))}
      </div>

      <h3>Live Chart</h3>
      <StockChart tickerList={subscribed} prices={prices} />
    </div>
  );
}
