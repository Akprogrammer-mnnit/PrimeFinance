import { io } from "socket.io-client";
import  store  from "../store/store.js"; // Import your Redux store
import { updateOnlineUsers ,removeOnlineUser} from "../store/authSlice.js"; // Import the action

const BASEURL = "http://localhost:8000";
let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(BASEURL, {
      query: {
        userId,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });

    socket.on("getOnlineUsers", (data) => {
      console.log("Online users updated:", data);
      store.dispatch(updateOnlineUsers(data)); // Dispatch Redux action
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
