// client/src/socket.js
import { io } from "socket.io-client";

const socket = io(
  "https://stock-broker-client-dashboard-j6jp.onrender.com",
  {
    transports: ["websocket", "polling"],
    secure: true,
  }
);

export default socket;
