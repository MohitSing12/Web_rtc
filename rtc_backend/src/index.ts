import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import serverConfig from "./config/serverConfig";
  import roomHandler from "./handlers/roomHandler";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log("New user connected");
    roomHandler(socket);// Pass the socket connection to the room handler for room creation and joining
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(serverConfig.PORT, () => {
    console.log(`The server is listening at port ${serverConfig.PORT} `);
});