import { Socket } from "socket.io";
import { v4 as UUIDv4 } from 'uuid';
import IRoomParams from "../Interface/IRoomParams";
// The below map stores for the room what all peers have joined
/*
{1:[u1,u2,u3], 2:[u4,u5,u6]}

*/
const rooms: Record<string, string[]> = {};
const roomHandler = (socket: Socket) => {

    const createRoom = () => {
        const roomId = UUIDv4();// This is the unique room where clients will be exchanging data
        socket.join(roomId);// We will make the socket connection enter the new room
        rooms[roomId] = [];// Create a new entry for the room

        // We will emit an event from server side that socket connection
        // has been added to the room
        socket.emit("room-created", { roomId });
        console.log("Room created with id:", roomId);
    };

    // Below function is executed when a user(creator,joinee) joins a new room
    const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
        if (rooms[roomId]) {
            // If the given id exists in memory db
            console.log("New user has joined", roomId, " with peer id as: ", peerId);
            // the moment the new user joins,add the peerid to the key of roomid
            rooms[roomId].push(peerId);
            socket.join(roomId);// Make the user join the socket room
        }
        socket.to(roomId).emit("user-joined",{peerId})

    };
    socket.on("create-room", createRoom);
    socket.on("joined-room", joinedRoom);
};



export default roomHandler;