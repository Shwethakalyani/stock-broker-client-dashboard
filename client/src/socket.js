// client/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:2000"; // backend port

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
