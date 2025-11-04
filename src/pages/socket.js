import { io } from "socket.io-client";
const url = "https://allorachat.onrender.com";

export const socket = io(url);
