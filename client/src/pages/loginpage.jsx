import React, { useState } from "react";
import "../styles/login.css";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");

  const submit = () => {
    if (!email.trim()) return;
    onLogin(email);
  };

  return (
    <div className="login-container">
      <h2>Stock Dashboard Login</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={submit}>Login</button>
    </div>
  );
}
