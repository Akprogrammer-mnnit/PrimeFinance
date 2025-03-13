import {Server} from 'socket.io'
import http from 'http'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config({path: './.env'})
dotenv.config({})
const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
    }
}
)
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
  }
const userSocketMap = {};
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
      userSocketMap[userId] = socket.id;
      socket.join(userId); 
  }
  io.emit("getOnlineUsers", userSocketMap);
  socket.on("message", ({ room, message }) => {
    io.to(room).emit("recieve-message", { message, senderId: userId });

  });

  socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", userSocketMap);
  });
});

export {io,app,server}

