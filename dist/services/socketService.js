"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketInstance = exports.initializeSocketIO = void 0;
const socket_io_1 = require("socket.io");
let io;
const initializeSocketIO = async (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: [process.env.FRONT_END_URL, process.env.LAMBDA_URL],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        socket.on("userDisconnected", () => {
            console.log("userDisconnected");
        });
    });
};
exports.initializeSocketIO = initializeSocketIO;
const getSocketInstance = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized yet");
    }
    return io;
};
exports.getSocketInstance = getSocketInstance;
//# sourceMappingURL=socketService.js.map