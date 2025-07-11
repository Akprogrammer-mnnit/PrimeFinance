import { io } from "socket.io-client";
import  store  from "../store/store.js"; 
import { updateOnlineUsers ,removeOnlineUser} from "../store/authSlice.js"; 

const BASEURL = import.meta.env.VITE_SOCKET_BASE_URL;
let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(BASEURL, {
      query: {
        userId,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("getOnlineUsers", (data) => {
      store.dispatch(updateOnlineUsers(data));
    });
  }
};

export const disconnectSocket =   (userId) => {
  if (socket) {
    socket.disconnect();
    console.log("Disconnected from server");
    store.dispatch(removeOnlineUser(userId));
    socket = null;
  }
};

export const getSocket = () => socket;
