/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import io from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  const token = localStorage.getItem("token"); // use the key you saved the token under
  socketInstance = io(import.meta.env.VITE_API_URL, {
    auth: {
      token: token,
    },
    query: {
      projectId,
    },
  });

  return socketInstance;
};

export const receiveMessage = (eventName, callback) => {
  if (!socketInstance) {
    console.error("Socket not initialized");
    return;
  }
  socketInstance.on(eventName, callback);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error("Socket not initialized");
    return;
  }
  socketInstance.emit(eventName, data);
};
