/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiMiniUsers } from "react-icons/hi2";
import { IoMdSend, IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { PiUserCircleGearBold } from "react-icons/pi";
import axios from "axios";
import "../index.css";
import { initializeSocket } from "../config/socket";
import Markdown from "markdown-to-jsx";
import JSON5 from "json5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Project = () => {
  const location = useLocation();
  const { project } = location.state || {};
  const navigate = useNavigate();

  const [togglebutton, setTogglebutton] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileTree, setFileTree] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Get logged in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    if (token) {
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      setUser(userInfo);
    }
  }, []);

  // ✅ Fetch messages + dynamically update AI fileTree
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

        const allMessages = Array.isArray(res.data)
          ? res.data
          : res.data.messages || [];
        setMessages(allMessages);

        // ✅ Find the last AI message
        const aiMsg = allMessages.find((msg) => msg.sender === "ai");

        if (aiMsg && aiMsg.content) {
          // Extract AI plain text
          const textMatch = aiMsg.content.match(/"text":\s*"([^"]+)"/);
          const cleanText = textMatch ? textMatch[1] : null;
          console.log("🧠 AI Text:", cleanText);

          // ✅ Extract fileTree JSON dynamically
          const fileTreeMatch = aiMsg.content.match(
            /"fileTree":\s*(\{[\s\S]*\})\s*,\s*"buildCommand"/
          );
          if (fileTreeMatch) {
            try {
              const dynamicTree = JSON5.parse(fileTreeMatch[1]);
              setFileTree(dynamicTree);
              console.log("📁 Updated FileTree:", dynamicTree);
            } catch (e) {
              console.warn("Error parsing fileTree:", e.message);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    if (project?._id) {
      fetchMessages();
    }
  }, [project?._id]);

  // ✅ Render AI clean message
  function WriteAiMessage(msgContent) {
    if (typeof msgContent === "string" && msgContent.includes('"text":')) {
      const match = msgContent.match(/"text":\s*"([^"]+)"/);
      const clean = match ? match[1] : msgContent;
      return <p className="whitespace-pre-wrap">{clean}</p>;
    }

    return (
      <Markdown className="break-words whitespace-pre-wrap">
        {msgContent}
      </Markdown>
    );
  }

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

        // ✅ Live update fileTree if AI sends new code
        if (
          newMessage.sender === "ai" &&
          newMessage.content.includes("fileTree")
        ) {
          try {
            const fileTreeMatch = newMessage.content.match(
              /"fileTree":\s*(\{[\s\S]*\})\s*,\s*"buildCommand"/
            );
            if (fileTreeMatch) {
              const dynamicTree = JSON5.parse(fileTreeMatch[1]);
              setFileTree(dynamicTree);
              console.log("📁 Live Updated FileTree:", dynamicTree);
            }
          } catch (err) {
            console.error("Error parsing fileTree from AI:", err.message);
          }
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log("Socket disconnected");
        }
      };
    }
  }, [project?._id, user?.email]);

  // ✅ Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    if (isAddingCollaborator) return;

    try {
      setIsAddingCollaborator(true);
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
      toast.success("Collaborators added successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add collaborators"
      );
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const getToggleUsers = () => {
    setAvailableUsers(project.users);
  };

  // ✅ Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || isSending) return;

    try {
      setIsSending(true);
      const newMessage = {
        content: message,
      };

      socketRef.current.emit("send-message", newMessage);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col lg:flex-row w-full h-screen">
        {/* LEFT SECTION */}
        <section className="lg:w-[30%] w-full h-full bg-zinc-200 relative">
          {/* Collaborator List */}
          <div
            className={`absolute bg-white z-20 w-full h-full transition-all duration-500 ${
              togglebutton ? "left-0" : "-left-full"
            }`}
          >
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

          {/* Header */}
          <header className="bg-white h-15 flex items-center justify-between p-4">
            <button
              onClick={() => {
                allUsers();
                setAddCollaborator(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white
             hover:bg-blue-700 transition-all duration-200 font-semibold text-sm
             w-60 overflow-hidden cursor-pointer "
            >
              <IoMdAdd className="text-lg" />
              <p className="truncate">Add Collaborator</p>
              <p className="hidden sm:block text-[0.6rem] font-normal text-gray-200 truncate">
                {project.name}
              </p>
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
          <div className="Messages text w-full h-[70vh] -mb-6 overflow-y-auto p-4">
            {Array.isArray(messages) &&
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full ${
                    msg.sender === user?.email ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative mx-2 my-3 rounded-xl px-4 py-2 max-w-[70%]  ${
                      msg.sender === "ai"
                        ? "bg-black text-white"
                        : msg.sender === user?.email
                        ? "bg-gray-300"
                        : "bg-[#281a1a28]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <small className="text-xs font-semiboadd server.js and gitignore and controllders and middlewares ld opacity-65 mb-1">
                        {msg.sender === user?.email
                          ? "You"
                          : msg.sender === "ai"
                          ? "AI"
                          : msg.sender}
                      </small>

                      <div className="overflow-x-auto">
                        {WriteAiMessage(msg.content)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="msg  w-full p-4">
            <div className="relative flex items-center bg-white mt-2 rounded-full">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 pr-12 border rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSending}
                className={`absolute right-3 transition-colors ${
                  isSending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <IoMdSend
                  className={`text-xl ${isSending ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT SECTION */}
        <section
          className={`right w-[70%] flex ${
            Object.keys(fileTree).length === 0 ? "hidden" : "block"
          }`}
        >
          <div className="right-left w-[30%] h-full bg-gray-100 p-4">
            {Object.keys(fileTree).length > 0 ? (
              Object.keys(fileTree).map((file, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFile(file)}
                  className={`folders w-[97%] flex justify-center items-center m-auto cursor-pointer mt-2 mb-1 px-4 h-12 text-white font-semibold text-lg rounded-lg transition-all ${
                    selectedFile === file
                      ? "bg-blue-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  <p className="truncate">{file}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No folder was found. @AI, kindly generate the required response
                — for example, create an Express server and show its file
                structure.”
              </p>
            )}
          </div>

          <div className="right-right w-[70%] h-full bg-white p-4 overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {selectedFile
                ? fileTree[selectedFile]?.file?.contents ||
                  fileTree[selectedFile]?.content ||
                  "No content available"
                : "Select a file to view contents"}
            </pre>
          </div>
        </section>

        {/* Add Collaborator PopUp */}
        {addCollaborator && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/50 z-30">
            <div className="bg-[#ffffff6f] w-[40vw] p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h2
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl
             bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200
             font-semibold text-sm w-60 overflow-hidden"
                >
                  <span className="truncate">Add Collaborators:-</span>
                  <span
                    className="text-[0.65rem] font-medium py-0.5
                   rounded-full truncate max-w-[80px]"
                  >
                    ({project.name})
                  </span>
                </h2>

                <RxCross2
                  onClick={() => setAddCollaborator(false)}
                  className="cursor-pointer text-xl"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {users.filter((u) => !project.users.includes(u._id)).length ===
                0 ? (
                  <h1 className="text-center text-lg font-bold text-gray-700">
                    All users are already added in this group
                  </h1>
                ) : (
                  users.map((u) => {
                    const alreadyMember = project.users.includes(u._id);
                    if (alreadyMember) return null;
                    return (
                      <div
                        key={u._id}
                        onClick={() =>
                          !alreadyMember && toggleSelectUser(u._id)
                        }
                        className="flex justify-between items-center p-2 rounded-md mb-2 border cursor-pointer"
                      >
                        <PiUserCircleGearBold className="text-2xl m-1" />
                        <h2>{u.email}</h2>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u._id)}
                          readOnly
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={addCollaboratorFunction}
                disabled={isAddingCollaborator}
                className={`w-full py-2 mt-4 rounded-md transition-colors ${
                  isAddingCollaborator
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {isAddingCollaborator ? "Adding..." : "Add Collaborators"}
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
      />
    </div>
  );
};

export default Project;
