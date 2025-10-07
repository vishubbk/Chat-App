import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { HiMiniUsers } from "react-icons/hi2";
import { IoMdSend, IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { PiUserCircleGearBold } from "react-icons/pi";
import axios from "axios";
import { initializeSocket } from "../config/socket";

const Project = () => {
  const location = useLocation();
  const { project } = location.state || {};

  const [togglebutton, setTogglebutton] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Get logged in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      setUser(userInfo);
    }
  }, []);

// ✅ Fetch old messages from DB
useEffect(() => {
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages/${project._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
-     setMessages(res.data); // old messages
+     setMessages(Array.isArray(res.data) ? res.data : res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  if (project?._id) {
    fetchMessages();
  }
}, [project?._id]);


  // ✅ Socket connection setup
  useEffect(() => {
    if (project?._id && user?.email) {
      socketRef.current = initializeSocket(project._id);

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
      });

      socketRef.current.on("new-message", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log("Socket disconnected");
        }
      };
    }
  }, [project?._id, user?.email]);

  
// Scroll to bottom on initial load or when new messages are added
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // whenever messages change, scroll down

  // ✅ Fetch all users
  const allUsers = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/user/all",
        { projectId: project._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const addCollaboratorFunction = async () => {
    try {
      await axios.put(
        import.meta.env.VITE_API_URL + "/project/add-user",
        {
          projectId: project._id,
          users: selectedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAddCollaborator(false);
      setSelectedUsers([]);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getToggleUsers = () => {
    setAvailableUsers(project.users);
  };

  // ✅ Send message
 const handleSendMessage = (e) => {
  e.preventDefault();
  if (!message.trim() || !socketRef.current) return;

  const newMessage = {
    content: message,
  };

  socketRef.current.emit("send-message", newMessage);
  setMessage("");
};


  return (
    <div className="relative w-full">
      <div className="flex flex-col lg:flex-row w-full h-screen">
        {/* LEFT SECTION */}
        <section className="lg:w-[30%] w-full h-full bg-zinc-200 relative">
          <div
            className={`absolute bg-white z-20 w-full h-full transition-all duration-500 ${
              togglebutton ? "left-0" : "-left-full"
            }`}
          >
            <div className="top">
              <div className="bg-slate-300 w-full h-15 flex justify-between items-center text-xl text-slate-900 font-semibold pl-2">
                <div>Collaborators</div>
                <RxCross2
                  onClick={() => setTogglebutton(false)}
                  className="cursor-pointer text-black font-extrabold text-4xl absolute right-1"
                />
              </div>

              <div className="mt-4 px-4">
                {Array.isArray(availableUsers) && availableUsers.length > 0 ? (
                  availableUsers.map((user, idx) => (
                    <div key={user._id || idx}>
                      <div className="user-section flex items-center mt-1 hover:bg-gray-300 p-1 transition-all duration-200">
                        <PiUserCircleGearBold className="text-2xl m-1" />
                        <h2 className="font">{user.email}</h2>
                      </div>
                      <div className="w-full h-[1px] bg-black"></div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No users available</div>
                )}
              </div>
            </div>
          </div>

          <header className="bg-white h-15 flex items-center justify-between p-4">
            <button
              onClick={() => {
                allUsers();
                setAddCollaborator(true);
              }}
              className="flex gap-2 items-center font-bold cursor-pointer"
            >
              <IoMdAdd />
              <p>Add collaborator</p>
            </button>

            <HiMiniUsers
              onClick={() => {
                getToggleUsers();
                setTogglebutton(!togglebutton);
              }}
              className="text-2xl cursor-pointer"
            />
          </header>

          {/* Messages */}
          <div className="text w-full h-[calc(100vh-130px)] overflow-y-auto p-4">
           {Array.isArray(messages) && messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === user?.email
                    ? "send-msg flex justify-end w-full"
                    : "accept-msg"
                }
              >
                <div
                  className={`w-fit max-w-[70%] mx-2 my-3 rounded-xl px-4 py-2 ${
                    msg.sender === user?.email
                      ? "bg-[#1a281a28]"
                      : "bg-[#281a1a28]"
                  }`}
                >
                  <div>
                    <small className="text-xs font-semibold opacity-65">
                      {msg.sender === user?.email ? "You" : msg.sender}
                    </small>
                    <p>{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="msg absolute bottom-0 w-full p-4"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 pr-12 border rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <IoMdSend className="text-xl" />
              </button>
            </div>
          </form>
        </section>

        {/* Add Collaborator PopUp */}
        {addCollaborator && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/50 z-30">
            <div className="bg-[#ffffff6f] w-[40vw] p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h2 className="font-bold text-lg">Add Collaborators</h2>
                <RxCross2
                  onClick={() => setAddCollaborator(false)}
                  className="cursor-pointer text-xl"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {users.filter((user) => !project.users.includes(user._id))
                  .length === 0 ? (
                  <h1 className="text-center text-lg font-bold text-gray-700">
                    All users are already added in this group
                  </h1>
                ) : (
                  users.map((user) => {
                    const alreadyMember = project.users.includes(user._id);
                    if (alreadyMember) return null;
                    return (
                      <div
                        key={user._id}
                        onClick={() =>
                          !alreadyMember && toggleSelectUser(user._id)
                        }
                        className={`flex justify-between items-center p-2 rounded-md mb-2 border cursor-pointer`}
                      >
                        <PiUserCircleGearBold className="text-2xl m-1" />
                        <h2>{user.email}</h2>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          readOnly
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {users.filter((user) => !project.users.includes(user._id))
                .length > 0 && (
                <button
                  onClick={addCollaboratorFunction}
                  className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md"
                >
                  Add Collaborators
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
