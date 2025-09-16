import express from "express";
import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env["FRONTEND_URL"] || "http://localhost:4200",
  },
});


// --- Conexión de clientes ---
io.on("connection", (socket) => {

  // Unir al canal global automáticamente
  socket.join("global");

  // Escuchar mensajes globales
  socket.on("chat:global", ({playerId, msg}) => {
    io.to("global").emit("chat:global", {
      user: playerId,
      message: msg,
    });
  });

  // Unir a sala de batalla
  socket.on("join:battle", ({playerId, battleId}) => {
    const room = `battle-${battleId}`;
    socket.join(room);
    io.to(room).emit("system", `${playerId} se unió a la sala ${battleId}`);
  });

  // Escuchar mensajes de batalla
  socket.on("chat:battle", ({ battleId, playerId, message }) => {
    const room = `battle-${battleId}`;
    io.to(room).emit("chat:battle", {
      user: playerId,
      message: message,
    });
  });

  // Al desconectarse
  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// --- Iniciar servidor ---
const PORT = process.env["PORT"] || 3000;
server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});