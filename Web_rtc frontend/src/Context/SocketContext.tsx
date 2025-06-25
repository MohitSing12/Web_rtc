import SocketIoClient from "socket.io-client";
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { v4 as UUIDv4 } from 'uuid';
import { peerReducer } from "../Reducers/peerReducer";
import { addPeerAction } from "../Actions/peerActions";


const WS_Server = "http://localhost:5500";

export const SocketContext = createContext<any | null>(null);
const socket = SocketIoClient(WS_Server, {
    withCredentials: false,
    transports: ["polling", "websocket"]
});

interface Props {
    children: React.ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();//Will help in the navigation

    //state variable to store the user
    const [user, setUser] = useState<Peer>();//new peer user
    const [stream, setStream] = useState<MediaStream>();

    const [peers, dispatch] = useReducer(peerReducer, {});
    const fetchUserFeed = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(stream);
    }
    useEffect(() => {
        const userId = UUIDv4();
        const newPeer = new Peer(userId, {
            host: "localhost",
            port: 9000,
            path: "/myapp",
        });
        setUser(newPeer);
        fetchUserFeed();
        const enterRoom = ({ roomId }: { roomId: string }) => {
            navigate(`/room/${roomId}`);
        }

        //We will transfer the user to the room page when we collect an event of room-created from the server
        socket.on("room-created", enterRoom);

    }

        , []);

    useEffect(() => {
        if (!user || !stream) return;

        socket.on("user-joined", ({ peerId }) => {
            const call = user.call(peerId, stream);
            console.log("calling the new peer", peerId);
            call.on("stream", () => {
                dispatch(addPeerAction(peerId, stream));
            })
        })
        user.on("call", (call) => {
            //what to do when other peers on the group call you when you joined
            console.log("receiving the call");
            call.answer(stream);
            call.on("stream", () => {
                dispatch(addPeerAction(call.peer, stream));
            })
        })
        socket.emit("ready");
    }, [user, stream])


    return (
        <SocketContext.Provider value={{ socket, user, stream, peers }}>
            {children}
        </SocketContext.Provider>
    )
}