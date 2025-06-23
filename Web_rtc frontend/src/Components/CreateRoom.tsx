import { useContext } from "react";
import { SocketContext } from "../Context/SocketContext";
const CreateRoom:React.FC=()=>{
    const {socket}=useContext(SocketContext);
    const initRoom=()=>{
        console.log("initialising a req to create a room")
        socket.emit("create-room");
    }
    return(
        <button onClick={initRoom}
        className="btn btn-secondary">
            Start a new meeting in the new room.
        </button>
    )
}
export default CreateRoom;