import { Server } from "socket.io";
import * as http from "http";
let io: Server;


export const initializeSocketIO = async (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin:[process.env.FRONT_END_URL, process.env.LAMBDA_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("userDisconnected", () => {
      console.log("userDisconnected");
    })
  });

};

export const getSocketInstance = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet");
  }
  return io;
};
